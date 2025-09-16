import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { buyerFormSchema } from '@/lib/validations/buyer';
import { prisma } from '@/lib/db';
import { parseTagsString } from '@/lib/utils';

// Helper to safely parse budget strings
const parseBudget = (value: string | null | undefined): number | undefined => {
  if (!value) return undefined;
  const numeric = value.replace(/[^\d.]/g, ''); // remove ₹, commas, spaces
  return numeric ? Number(numeric) : undefined;
};

// POST /api/buyers - Create a new buyer
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const validatedData = buyerFormSchema.parse(body);

    const tags = parseTagsString(validatedData.tags || '');

    const buyer = await prisma.buyer.create({
      data: {
        fullName: validatedData.fullName,
        email: validatedData.email,
        phone: validatedData.phone,
        city: validatedData.city,
        propertyType: validatedData.propertyType,
        bhk: validatedData.bhk,
        purpose: validatedData.purpose,
        budgetMin: validatedData.budgetMin ?? null,
        budgetMax: validatedData.budgetMax ?? null,
        timeline: validatedData.timeline,
        source: validatedData.source,
        status: validatedData.status ?? 'New',
        tags: tags.join(','),
        notes: validatedData.notes ?? '',
        attachmentUrl: validatedData.attachmentUrl ?? null,
        ownerId: session.user.id,
      },
    });

    await prisma.buyerHistory.create({
      data: {
        buyerId: buyer.id,
        changedById: session.user.id,
        diff: { created: buyer },
      },
    });

    return NextResponse.json(buyer, { status: 201 });
  } catch (error: any) {
    console.error('Error creating buyer:', error);
    if (error.name === 'ZodError') {
      return NextResponse.json({ message: 'Validation error', errors: error.errors }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/buyers - Fetch buyers with filters
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const url = new URL(req.url);

    const search = url.searchParams.get('search') || '';
    const city = url.searchParams.get('city') || undefined;
    const propertyType = url.searchParams.get('propertyType') || undefined;
    const bhk = url.searchParams.get('bhk') || undefined;
    const purpose = url.searchParams.get('purpose') || undefined;
    const timeline = url.searchParams.get('timeline') || undefined;
    const source = url.searchParams.get('source') || undefined;
    const status = url.searchParams.get('status') || undefined;

    const budgetMin = parseBudget(url.searchParams.get('minBudget'));
    const budgetMax = parseBudget(url.searchParams.get('maxBudget'));

    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    const skip = (page - 1) * limit;

    const where: any = { ownerId: session.user.id };

    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { notes: { contains: search, mode: 'insensitive' } },
        { tags: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (city) where.city = city;
    if (propertyType) where.propertyType = propertyType;
    if (bhk) where.bhk = bhk;
    if (purpose) where.purpose = purpose;
    if (timeline) where.timeline = timeline;
    if (source) where.source = source;
    if (status) where.status = status;

    if (budgetMin !== undefined || budgetMax !== undefined) {
      where.AND = [];
      if (budgetMin !== undefined) where.AND.push({ budgetMin: { gte: budgetMin } });
      if (budgetMax !== undefined) where.AND.push({ budgetMax: { lte: budgetMax } });
    }

    const total = await prisma.buyer.count({ where });
    const buyers = await prisma.buyer.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      buyers,
      pagination: { total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('Error fetching buyers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
