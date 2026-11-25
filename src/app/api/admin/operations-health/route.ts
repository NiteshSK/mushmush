import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// A monitoring service can poll this route without receiving customer data.
export async function GET(request:NextRequest) {
  if(!process.env.CRON_SECRET || request.headers.get("authorization")!=="Bearer "+process.env.CRON_SECRET)
    return NextResponse.json({error:"Monitor authentication required"},{status:403});
  const [jobs,payments]=await Promise.all([
    prisma.staffJob.count({where:{state:"failed"}}),
    prisma.upi_payments.aggregate({where:{status:"PENDING"},_min:{createdAt:true}})
  ]);
  const age=payments._min.createdAt ? Math.floor((Date.now()-payments._min.createdAt.getTime())/60000) : 0;
  const maxAge=Number(process.env.STAFF_PAYMENT_ALERT_MINUTES);
  const unhealthy=jobs>0 || (Number.isFinite(maxAge) && maxAge>0 && age>=maxAge);
  return NextResponse.json({failedJobs:jobs,oldestPaymentMinutes:age},{status:unhealthy?503:200, headers:{"Cache-Control":"no-store"}});
}
