import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { parse } from 'papaparse';
import { z } from 'zod';

// --- ENUM definitions (must match Prisma schema) ---
const cityEnum = ['Chandigarh', 'Mohali', 'Zirakpur', 'Panchkula', 'Other'] as const;
const propertyTypeEnum = ['Apartment', 'Villa', 'Plot', 'Office', 'Retail'] as const;
const bhkEnum = ['Studio', 'One', 'Two', 'Three', 'Four'] as const;
const purposeEnum = ['Buy', 'Rent'] as const;
const timelineEnum = ['0-3m', '3-6m', '>6m', 'Exploring'] as const;
const sourceEnum = ['Website', 'Referral', 'Walk-in', 'Call', 'Other'] as const;
const statusEnum = ['New', 'Qualified', 'Contacted', 'Visited', 'Negotiation', 'Converted', 'Dropped'] as const;

// Zod schema for validation
const buyerSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  email: z.string().email().optional().nullable(),
  phone: z.string().optional().nullable(),
  city: z.enum(cityEnum).optional().nullable(),
  propertyType: z.enum(propertyTypeEnum).optional().nullable(),
  bhk: z.enum(bhkEnum).optional().nullable(),
  purpose: z.enum(purposeEnum).optional().nullable(),
  timeline: z.enum(timelineEnum).optional().nullable(),
  budget: z.string().optional().nullable(), // will parse into budgetMin/budgetMax
  source: z.enum(sourceEnum).optional().nullable(),
  status: z.enum(statusEnum).optional().nullable(),
  notes: z.string().optional().nullable(),
});

// --- Helper: parse budget ---
function parseBudget(budget: string | null | undefined): { budgetMin: number | null; budgetMax: number | null } {
  if (!budget) return { budgetMin: null, budgetMax: null };

  if (budget.includes('-')) {
    const [minStr, maxStr] = budget.split('-').map(v => v.trim());
    const min = parseInt(minStr, 10);
    const max = parseInt(maxStr, 10);
    return {
      budgetMin: isNaN(min) ? null : min,
      budgetMax: isNaN(max) ? null : max,
    };
  } else {
    const num = parseInt(budget.trim(), 10);
    return { budgetMin: isNaN(num) ? null : num, budgetMax: null };
  }
}

// --- POST /api/buyers/import ---
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Get CSV file
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ message: 'No file provided' }, { status: 400 });
    }

    if (!file.name.endsWith('.csv')) {
      return NextResponse.json({ message: 'Only CSV files are supported' }, { status: 400 });
    }

    // Parse CSV
    const csvText = await file.text();
    const { data, errors } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json({ message: 'Error parsing CSV file', errors }, { status: 400 });
    }

    // Validate rows
    const validatedData: z.infer<typeof buyerSchema>[] = [];
    const invalidRows: any[] = [];

    for (let i = 0; i < data.length; i++) {
      try {
        const validRow = buyerSchema.parse(data[i]);
        validatedData.push(validRow);
      } catch (error) {
        if (error instanceof z.ZodError) {
          invalidRows.push({ row: i + 2, errors: error.issues }); // row + header offset
        } else {
          invalidRows.push({ row: i + 2, errors: [{ message: 'Unknown error' }] });
        }
      }
    }

    if (invalidRows.length > 0) {
      return NextResponse.json({ message: 'Invalid data in CSV file', invalidRows }, { status: 400 });
    }

    // Import buyers
    const importedBuyers = [];

    for (const buyer of validatedData) {
      const { budgetMin, budgetMax } = parseBudget(buyer.budget);

      const newBuyer = await db.buyer.create({
        data: {
          fullName: buyer.fullName,
          email: buyer.email || null,
          phone: buyer.phone ?? null,
          city: buyer.city as any,
          propertyType: buyer.propertyType as any,
          bhk: buyer.bhk as any,
          purpose: buyer.purpose as any,
          timeline: buyer.timeline as any,
          budgetMin,
          budgetMax,
          source: buyer.source as any,
          status: (buyer.status as any) || 'New',
          notes: buyer.notes || null,
          ownerId: session.user.id,
        },
      });

      // Create buyer history
      await db.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedById: session.user.id,
          diff: { action: 'Created', details: 'Imported from CSV' },
        },
      });

      importedBuyers.push(newBuyer);
    }

    return NextResponse.json({
      message: `Successfully imported ${importedBuyers.length} buyers`,
      count: importedBuyers.length,
    });
  } catch (error) {
    console.error('Error importing buyers:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
