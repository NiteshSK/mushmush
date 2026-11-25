import { NextRequest, NextResponse } from "next/server";
import { staffSession } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

// GET /api/admin/training-registrations/[id] - Get specific training registration (admin only)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await staffSession("trainer");
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const registration = await prisma.trainingRegistration.findUnique({
      where: { id: params.id },
      include: {
        trainingProgram: true,
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!registration) {
      return NextResponse.json(
        { error: "Training registration not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error fetching training registration:", error);
    return NextResponse.json(
      { error: "Failed to fetch training registration" },
      { status: 500 }
    );
  }
}

// PUT /api/admin/training-registrations/[id] - Update training registration status (admin only)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await staffSession("trainer");
    
    if (!session?.user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const params = await context.params;
    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: "Status is required" },
        { status: 400 }
      );
    }

    const from: Record<string,string[]> = { IN_PROGRESS: ["CONFIRMED"], COMPLETED: ["IN_PROGRESS"], CANCELLED: ["PENDING","PAYMENT_RECEIVED","CONFIRMED"] };
    if (!from[status]) return NextResponse.json({ error: "Review the payment in Training payments to confirm this seat." }, { status: 409 });
    const changed = await prisma.$transaction(async tx => {
      const updated = await tx.trainingRegistration.updateMany({ where: { id: params.id, status: { in: from[status] as any } }, data: { status } });
      if (updated.count) await tx.staffEvent.create({data:{actorId:session.user.id,resource:"registration",recordId:params.id,action:status}});
      return updated;
    });
    if (!changed.count) return NextResponse.json({ error: "This transition is unavailable. Refresh the registration." }, { status: 409 });
    const registration = await prisma.trainingRegistration.findUnique({ where: { id: params.id }, include: { trainingProgram: true } });
    return NextResponse.json(registration);
  } catch (error) {
    console.error("Error updating training registration:", error);
    return NextResponse.json(
      { error: "Failed to update training registration" },
      { status: 500 }
    );
  }
}
