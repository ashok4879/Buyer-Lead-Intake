import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z, ZodError } from "zod";

// PATCH /api/buyers/[id]/notes - Add a note to a buyer
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // ✅ App Router compatible
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Await params because it's a Promise
    const { id: buyerId } = await context.params;

    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) {
      return NextResponse.json({ message: "Buyer not found" }, { status: 404 });
    }

    if (existingBuyer.ownerId !== session.user.id && session.user.role !== "ADMIN") {
      return NextResponse.json(
        {
          message: "Unauthorized: You do not have permission to add notes to this buyer",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const schema = z.object({
      note: z.string().min(1, { message: "Note cannot be empty" }),
    });
    const { note } = schema.parse(body);

    const timestamp = new Date().toISOString();
    const formattedNote = `[${timestamp}] ${note}\n\n${existingBuyer.notes || ""}`;

    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: { notes: formattedNote },
    });

    await db.buyerHistory.create({
      data: {
        buyerId,
        changedById: session.user.id,
        diff: { note },
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error("Error adding buyer note:", error);
    if (error instanceof ZodError) {
      return NextResponse.json({ message: "Validation error", errors: error.format() }, { status: 400 });
    }
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
