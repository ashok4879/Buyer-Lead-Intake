import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

// Correct RouteContext type
type RouteContext = { params: { id: string } };

// PATCH /api/buyers/[id]/status - Update buyer status
export async function PATCH(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: buyerId } = context.params; // ✅ no await

    // Check if buyer exists
    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 });
    }

    // Verify ownership or admin
    if (
      existingBuyer.ownerId !== session.user.id &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          message:
            "Unauthorized: You do not have permission to update this buyer status",
        },
        { status: 403 }
      );
    }

    // Validate request body
    const body = await req.json();
    const schema = z.object({
      status: z.string().min(1, { message: "Status is required" }),
    });
    const { status } = schema.parse(body);

    // Update buyer status
    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: { status: status as any }, // if Status is an enum, import and cast properly
    });

    // Add history entry
    await db.buyerHistory.create({
      data: {
        buyerId,
        changedById: session.user.id,
        action: "STATUS_UPDATED",
        details: `Status changed to ${status}`,
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error("Error updating buyer status:", error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Validation error", errors: error.format() },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
