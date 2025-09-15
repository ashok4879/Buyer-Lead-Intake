import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { parse } from 'papaparse';
import { z } from 'zod';

// POST /api/buyers/import - Import buyers from CSV
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

    // Get form data with CSV file
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json(
        { message: 'No file provided' },
        { status: 400 }
      );
    }

    // Check file type
    if (!file.name.endsWith('.csv')) {
      return NextResponse.json(
        { message: 'Only CSV files are supported' },
        { status: 400 }
      );
    }

    // Parse CSV file
    const csvText = await file.text();
    const { data, errors } = parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });

    if (errors.length > 0) {
      return NextResponse.json(
        { message: 'Error parsing CSV file', errors },
        { status: 400 }
      );
    }

    // Validate CSV data
    const buyerSchema = z.object({
      fullName: z.string().min(1, 'Full name is required'),
      email: z.string().email().optional().nullable(),
      phone: z.string().optional().nullable(),
      city: z.string().optional().nullable(),
      propertyType: z.string().optional().nullable(),
      bhk: z.string().optional().nullable(),
      purpose: z.string().optional().nullable(),
      timeline: z.string().optional().nullable(),
      budget: z.string().optional().nullable(),
      source: z.string().optional().nullable(),
      status: z.string().optional().nullable(),
      notes: z.string().optional().nullable(),
    });

    const validatedData = [];
    const invalidRows = [];

    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      try {
        const validRow = buyerSchema.parse(row);
        validatedData.push(validRow);
      } catch (error) {
        invalidRows.push({ row: i + 2, errors: error.errors }); // +2 for header row and 0-indexing
      }
    }

    if (invalidRows.length > 0) {
      return NextResponse.json(
        { message: 'Invalid data in CSV file', invalidRows },
        { status: 400 }
      );
    }

    // Import buyers
    const importedBuyers = [];

    for (const buyer of validatedData) {
      const newBuyer = await db.buyer.create({
        data: {
          fullName: buyer.fullName,
          email: buyer.email || null,
          phone: buyer.phone || null,
          city: buyer.city || null,
          propertyType: buyer.propertyType || null,
          bhk: buyer.bhk || null,
          purpose: buyer.purpose || null,
          timeline: buyer.timeline || null,
          budget: buyer.budget || null,
          source: buyer.source || null,
          status: buyer.status || 'New',
          notes: buyer.notes || null,
          ownerId: session.user.id,
        },
      });

      // Create buyer history entry
      await db.buyerHistory.create({
        data: {
          buyerId: newBuyer.id,
          changedById: session.user.id,
          action: 'Created',
          details: 'Imported from CSV',
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
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}