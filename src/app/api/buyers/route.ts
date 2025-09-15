import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { buyerFormSchema } from '@/lib/validations/buyer';
import { prisma } from '@/lib/db';
import { parseTagsString } from '@/lib/utils';

// POST /api/buyers - Create a new buyer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = buyerFormSchema.parse(body);

    // Parse tags string into array
    const tags = parseTagsString(validatedData.tags || '');

    // Create buyer in database
    const buyer = await prisma.buyer.create({
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
        tags: tags,
        notes: validatedData.notes || '',
        ownerId: session.user.id,
      },
    });

    // Create history entry for new buyer
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        action: 'CREATED',
        details: 'Buyer lead created',
        changedById: session.user.id,
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error) {
    console.error('Error creating buyer:', error);
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

// GET /api/buyers - Get all buyers (with filtering)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get query parameters
    const url = new URL(req.url);
    const search = url.searchParams.get('search') || '';
    const city = url.searchParams.get('city') || undefined;
    const propertyType = url.searchParams.get('propertyType') || undefined;
    const bhk = url.searchParams.get('bhk') || undefined;
    const purpose = url.searchParams.get('purpose') || undefined;
    const timeline = url.searchParams.get('timeline') || undefined;
    const source = url.searchParams.get('source') || undefined;
    const status = url.searchParams.get('status') || undefined;
    const minBudget = url.searchParams.get('minBudget') ? Number(url.searchParams.get('minBudget')) : undefined;
    const maxBudget = url.searchParams.get('maxBudget') ? Number(url.searchParams.get('maxBudget')) : undefined;
    
    // Pagination
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build where clause for filtering
    const where: any = {
      ownerId: session.user.id,
    };

    // Add search filter (search in name, email, phone, notes)
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add other filters
    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (bhk) where.bhk = bhk;
    if (purpose) where.purpose = purpose;
    if (timeline) where.timeline = timeline;
    if (source) where.source = source;
    if (status) where.status = status;
    
    // Add budget range filter
    if (minBudget !== undefined || maxBudget !== undefined) {
      where.budget = {};
      if (minBudget !== undefined) where.budget.gte = minBudget;
      if (maxBudget !== undefined) where.budget.lte = maxBudget;
    }

    // Get total count for pagination
    const total = await prisma.buyer.count({ where });

    // Get buyers with pagination and sorting
    const buyers = await prisma.buyer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      buyers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/buyers - Update an existing buyer
export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated
    if (!session?.user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validatedData = buyerFormSchema.parse(body);

    // Check if buyer exists and belongs to the user
    const existingBuyer = await prisma.buyer.findUnique({
      where: {
        id: validatedData.id,
      },
    });

    if (!existingBuyer || existingBuyer.ownerId !== session.user.id) {
      return NextResponse.json(
        { message: 'Buyer not found or unauthorized' },
        { status: 404 }
      );
    }

    // Parse tags string into array
    const tags = parseTagsString(validatedData.tags || '');

    // Update buyer in database
    const buyer = await prisma.buyer.update({
      where: {
        id: validatedData.id,
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
        tags: tags,
        notes: validatedData.notes || '',
      },
    });

    // Create history entry for updated buyer
    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        action: 'UPDATED',
        details: 'Buyer lead updated',
        changedById: session.user.id,
      },
    });

    return NextResponse.json(buyer, { status: 200 });
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