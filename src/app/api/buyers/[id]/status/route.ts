import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z, ZodError } from "zod";

// PATCH /api/buyers/[id]/status - Update buyer status
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ App Router compatible
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { id: buyerId } = await context.params;

    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 });
    }

    if (existingBuyer.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Unauthorized: You cannot update this buyer status" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const schema = z.object({
      status: z.string().min(1, { message: "Status is required" }),
    });
    const { status } = schema.parse(body);

    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: { status: status as Status },
    });

    await db.buyerHistory.create({
      data: {
        buyerId,
        changedById: session.user.id,
        diff: { status },
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error("Error updating buyer status:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.format() }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
