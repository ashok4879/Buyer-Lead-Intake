import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma as db } from '@/lib/db';
import { StatusSchema } from '@/lib/validations/buyer';
import { z } from 'zod';

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const buyerId = params.id;

    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) {
      return NextResponse.json({ message: 'Buyer not found' }, { status: 404 });
    }

    // Verify ownership or admin
    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    // Parse request
    const body = await req.json();
    const schema = z.object({
      status: StatusSchema,
      note: z.string().optional(),
    });
    const { status, note } = schema.parse(body);

    // Update buyer
    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: { status },
    });

    // Create history
    await db.buyerHistory.create({
      data: {
        buyerId,
        changedById: session.user.id,
        diff: {
          action: 'STATUS_CHANGED',
          from: existingBuyer.status,
          to: status,
          note: note ?? null,
        },
      },
    });

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer status:', error);
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: 'Validation error', errors: error.format() }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
