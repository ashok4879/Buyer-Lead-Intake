import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { stringify } from 'csv-stringify/sync';

// GET /api/buyers/export - Export buyers to CSV
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
    const status = url.searchParams.get('status');
    const source = url.searchParams.get('source');
    const city = url.searchParams.get('city');
    const timeline = url.searchParams.get('timeline');

    // Build query
    const where: any = {};
    
    // If user is not admin, only show their own buyers
    if (session.user.role !== 'ADMIN') {
      where.ownerId = session.user.id;
    }

    // Add filters if provided
    if (status) where.status = status;
    if (source) where.source = source;
    if (city) where.city = city;
    if (timeline) where.timeline = timeline;

    // Get buyers
    const buyers = await db.buyer.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    // Format data for CSV
    const csvData = buyers.map(buyer => ({
      'Full Name': buyer.fullName,
      'Email': buyer.email || '',
      'Phone': buyer.phone || '',
      'City': buyer.city || '',
      'Property Type': buyer.propertyType || '',
      'BHK': buyer.bhk || '',
      'Purpose': buyer.purpose || '',
      'Timeline': buyer.timeline || '',
      'Budget': buyer.budget || '',
      'Source': buyer.source || '',
      'Status': buyer.status || '',
      'Notes': buyer.notes || '',
      'Created At': buyer.createdAt.toISOString(),
      'Updated At': buyer.updatedAt.toISOString(),
      'Owner': buyer.owner.name || buyer.owner.email || '',
    }));

    // Generate CSV
    const csv = stringify(csvData, {
      header: true,
    });

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'text/csv');
    headers.set('Content-Disposition', 'attachment; filename="buyers.csv"');

    return new NextResponse(csv, {
      status: 200,
      headers,
    });
  } catch (error) {
    console.error('Error exporting buyers:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}