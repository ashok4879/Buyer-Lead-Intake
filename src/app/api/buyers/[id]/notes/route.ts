import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { z } from 'zod';

// PATCH /api/buyers/[id]/notes - Add a note to buyer
export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> } // Updated type
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Await params to get the buyer ID
    const { id: buyerId } = await context.params;

    // Check if buyer exists
    const existingBuyer = await db.buyer.findUnique({
      where: { id: buyerId },
    });

    if (!existingBuyer) {
      return NextResponse.json({ message: 'Buyer not found' }, { status: 404 });
    }

    // Verify ownership or admin
    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to add notes to this buyer' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const schema = z.object({
      note: z.string().min(1, { message: 'Note cannot be empty' }),
    });
    const { note } = schema.parse(body);

    // Append new note with timestamp
    const currentNotes = existingBuyer.notes || '';
    const timestamp = new Date().toISOString();
    const formattedNote = `[${timestamp}] ${note}\n\n${currentNotes}`;

    // Update buyer notes
    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: { notes: formattedNote },
    });

    // Create buyer history entry
    await db.buyerHistory.create({
      data: {
        buyerId,
        changedById: session.user.id,
        diff: { note },
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error adding buyer note:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: 'Validation error', errors: error.format() },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
