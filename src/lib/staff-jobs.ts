import { createHash, randomUUID } from "node:crypto";
import { StaffJob } from "@prisma/client";
import { prisma } from "./prisma";
import { generateInvoice, markInvoiceEmailSent } from "./invoice";
import { sendEmail, getOrderEmails } from "./email";

async function mail(
  job: StaffJob,
  to: string | string[],
  subject: string,
  text: string,
) {
  const escaped = text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
  const messageId =
    "<" + createHash("sha256").update(job.key).digest("hex") + "@kosvana.com>";
  const result = await sendEmail({
    to,
    subject,
    text,
    html: "<p>" + escaped.replaceAll("\n", "<br>") + "</p>",
    messageId,
  });
  if (!result.success) throw Error("Mail delivery failed");
}

async function perform(job: StaffJob) {
  if (job.kind === "news") {
    const { importHeadlines } = await import("./news-import");
    await importHeadlines();
    return;
  }
  if (job.kind === "training") {
    const reg = await prisma.trainingRegistration.findUniqueOrThrow({
      where: { id: job.resourceId },
      include: { trainingProgram: true },
    });
    await mail(
      job,
      reg.participantEmail,
      "Training payment verified · " + reg.registrationNumber,
      "Your payment of ₹" +
        reg.totalAmount +
        " has been verified for " +
        reg.trainingProgram.name +
        ". Your registration is confirmed.",
    );
    return;
  }
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: job.resourceId },
    include: {
      orderItems: { include: { product: { select: { title: true } } } },
    },
  });
  if (job.kind === "invoice") {
    const invoice = await generateInvoice(order.id);
    if (invoice.emailSent) return;
    await mail(
      job,
      order.customerEmail,
      "Invoice " + invoice.invoiceNumber,
      "Your invoice for order " +
        order.orderNumber +
        " · ₹" +
        order.total.toFixed(2) +
        "\n" +
        invoice.pdfPath,
    );
    await markInvoiceEmailSent(invoice.id);
    return;
  }
  const ops = job.kind === "order-team";
  const recipients = ops ? getOrderEmails() : order.customerEmail;
  if (Array.isArray(recipients) && !recipients.length) return;
  const lines = order.orderItems.map(
    (i) =>
      i.quantity +
      " × " +
      i.product.title +
      " · ₹" +
      (i.quantity * i.price).toFixed(2),
  );
  const label = job.action.toLowerCase().replaceAll("_", " ");
  await mail(
    job,
    recipients,
    order.orderNumber + " · " + label,
    [
      "Order " + order.orderNumber,
      "Status: " + label,
      ...lines,
      "Total ₹" + order.total.toFixed(2),
    ].join("\n"),
  );
}

// The lease token prevents an expired worker from acknowledging another worker's result.
export async function runStaffJobs(resourceId?: string) {
  const now = new Date();
  const jobs = await prisma.staffJob.findMany({
    where: { resourceId, state: { not: "done" }, nextRun: { lte: now } },
    orderBy: [{ nextRun: "asc" }, { createdAt: "asc" }],
    take: 10,
  });
  for (const job of jobs) {
    const lease = "running/" + randomUUID();
    const claim = await prisma.staffJob.updateMany({
      where: { key: job.key, state: job.state, nextRun: job.nextRun },
      data: {
        state: lease,
        attempts: { increment: 1 },
        nextRun: new Date(Date.now() + 10 * 60000),
      },
    });
    if (!claim.count) continue;
    try {
      await perform(job);
      await prisma.staffJob.updateMany({
        where: { key: job.key, state: lease },
        data: { state: "done", lastError: null },
      });
    } catch {
      await prisma.staffJob.updateMany({
        where: { key: job.key, state: lease },
        data: {
          state: "failed",
          lastError:
            job.kind === "news"
              ? "Feed import failed"
              : job.kind === "invoice"
                ? "Invoice generation or email delivery failed"
                : "Email delivery failed",
          nextRun: new Date(
            Date.now() + Math.min(3600000, 60000 * (job.attempts + 1)),
          ),
        },
      });
    }
  }
}
