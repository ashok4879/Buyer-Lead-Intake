import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { buyerFormSchema } from '@/lib/validations/buyer';
import { db } from '@/lib/db';

// Helper type for route context
type RouteContext = { params: Promise<{ id: string }> };

// GET /api/buyers/[id] - Get a single buyer
export async function GET(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: buyerId } = await context.params;

    const buyer = await db.buyer.findUnique({
      where: { id: buyerId },
      include: {
        history: {
          orderBy: { createdAt: 'desc' },
          include: {
            user: { select: { name: true, email: true } },
          },
        },
      },
    });

    if (!buyer) return NextResponse.json({ message: 'Buyer not found' }, { status: 404 });

    if (buyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to access this buyer' },
        { status: 403 }
      );
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/buyers/[id] - Update a buyer
export async function PUT(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: buyerId } = await context.params;

    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) return NextResponse.json({ message: 'Buyer not found' }, { status: 404 });

    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to modify this buyer' },
        { status: 403 }
      );
    }

    const body = await req.json();
    const validatedData = buyerFormSchema.parse(body);

    const changes: string[] = [];
    for (const [key, value] of Object.entries(validatedData)) {
      if (existingBuyer[key] !== value && key !== 'notes') {
        changes.push(`${key}: ${existingBuyer[key]} → ${value}`);
      }
    }

    const updatedBuyer = await db.buyer.update({
      where: { id: buyerId },
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        budget: validatedData.budget,
        city: validatedData.city,
        propertyType: validatedData.propertyType,
        bhk: validatedData.bhk,
        purpose: validatedData.purpose,
        timeline: validatedData.timeline,
        source: validatedData.source,
        status: validatedData.status,
        tags: validatedData.tags || '',
        notes: validatedData.notes || '',
      },
    });

    if (changes.length > 0 || existingBuyer.notes !== validatedData.notes) {
      await db.buyerHistory.create({
        data: {
          buyerId,
          action: 'UPDATED',
          details: changes.length > 0 ? `Updated: ${changes.join(', ')}` : 'Notes updated',
          changedById: session.user.id,
        },
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
    if (error instanceof Error && error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation error', errors: (error as { errors: unknown[] }).errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/buyers/[id] - Delete a buyer
export async function DELETE(req: NextRequest, context: RouteContext) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { id: buyerId } = await context.params;

    const existingBuyer = await db.buyer.findUnique({ where: { id: buyerId } });
    if (!existingBuyer) return NextResponse.json({ message: 'Buyer not found' }, { status: 404 });

    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to delete this buyer' },
        { status: 403 }
      );
    }

    await db.buyerHistory.deleteMany({ where: { buyerId } });
    await db.buyer.delete({ where: { id: buyerId } });

    return NextResponse.json({ message: 'Buyer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
