import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { StatusSchema } from '@/lib/validations/buyer';
import { db } from '@/lib/db';
import { z } from 'zod';

// PATCH /api/buyers/[id]/status - Update buyer status
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const buyerId = params.id;

    // Check if buyer exists
    const existingBuyer = await db.buyer.findUnique({
      where: {
        id: buyerId,
      },
    });
    
    // Buyer existence check already handled above
    
    // Verify ownership or admin status
    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to update this buyer' },
        { status: 403 }
      );
    }

    if (!existingBuyer) {
      return NextResponse.json(
        { message: 'Buyer not found' },
        { status: 404 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const schema = z.object({
      status: StatusSchema,
      note: z.string().optional(),
    });
    
    const { status, note } = schema.parse(body);

    // Update buyer status
    const updatedBuyer = await db.buyer.update({
      where: {
        id: buyerId,
      },
      data: {
        status,
      },
    });

    // Create history entry for status update
    await db.buyerHistory.create({
      data: {
        buyerId,
        action: 'STATUS_CHANGED',
        details: `Status changed from ${existingBuyer.status} to ${status}${note ? `: ${note}` : ''}`,
        changedById: session.user.id,
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer status:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { message: 'Validation error', errors: error.errors },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}