import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { buyerFormSchema } from '@/lib/validations/buyer';
import { db } from '@/lib/db';

// GET /api/buyers/[id] - Get a single buyer
export async function GET(
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

    // Get buyer with history
    const buyer = await db.buyer.findUnique({
      where: {
        id: buyerId,
      },
      include: {
        history: {
          orderBy: {
            createdAt: 'desc',
          },
          include: {
            user: {
              select: {
                name: true,
                email: true,
              },
            },
          },
        },
      },
    });

    if (!buyer) {
      return NextResponse.json(
        { message: 'Buyer not found' },
        { status: 404 }
      );
    }
    
    // Verify ownership or admin status
    if (buyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to access this buyer' },
        { status: 403 }
      );
    }

    return NextResponse.json(buyer);
  } catch (error) {
    console.error('Error fetching buyer:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/buyers/[id] - Update a buyer
export async function PUT(
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

    // Check if buyer exists and belongs to user
    const existingBuyer = await db.buyer.findUnique({
      where: {
        id: buyerId,
      },
    });
    
    // Check if buyer exists
    // This check is now handled above
    
    // Verify ownership or admin status
    if (existingBuyer.ownerId !== session.user.id && session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'Unauthorized: You do not have permission to modify this buyer' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = buyerFormSchema.parse(body);

    // Track changes for history
    const changes: string[] = [];
    for (const [key, value] of Object.entries(validatedData)) {
      if (existingBuyer[key] !== value && key !== 'notes') {
        changes.push(`${key}: ${existingBuyer[key]} → ${value}`);
      }
    }

    // Update buyer in database
    const updatedBuyer = await db.buyer.update({
      where: {
        id: buyerId,
      },
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

    // Create history entry for update
    if (changes.length > 0 || existingBuyer.notes !== validatedData.notes) {
      await db.buyerHistory.create({
        data: {
          buyerId,
          action: 'UPDATED',
          details: changes.length > 0 
            ? `Updated: ${changes.join(', ')}` 
            : 'Notes updated',
          changedById: session.user.id,
        },
      });
    }

    return NextResponse.json(updatedBuyer);
  } catch (error) {
    console.error('Error updating buyer:', error);
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

// DELETE /api/buyers/[id] - Delete a buyer
export async function DELETE(
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
        { message: 'Unauthorized: You do not have permission to delete this buyer' },
        { status: 403 }
      );
    }

    if (!existingBuyer) {
      return NextResponse.json(
        { message: 'Buyer not found' },
        { status: 404 }
      );
    }

    // Delete buyer history first (cascade doesn't work with SQLite)
    await db.buyerHistory.deleteMany({
      where: {
        buyerId,
      },
    });

    // Delete buyer
    await db.buyer.delete({
      where: {
        id: buyerId,
      },
    });

    return NextResponse.json(
      { message: 'Buyer deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting buyer:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}