// src/app/buyers/[id]/page.tsx
import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import BuyerDetail from '@/components/buyers/buyer-detail';
import { BuyerHistory } from '@/components/buyers/buyer-history';

export const metadata = {
  title: 'Buyer Detail',
  description: 'View and manage buyer lead details',
};

// Helper function to fetch buyer
async function getBuyer(id: string) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/signin');
  }

  const buyer = await prisma.buyer.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: { changedAt: 'desc' },
        include: { changedBy: true },
      },
    },
  });

  if (!buyer) {
    notFound(); // Will show 404 page
  }

  return buyer;
}

export default async function BuyerDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  // ✅ Await params before using
  const { id } = await params;

  // Fetch buyer data
  const buyer = await getBuyer(id);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{buyer.fullName}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Buyer Details */}
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading buyer details...</div>}>
            <BuyerDetail params={{ id: buyer.id }} />
          </Suspense>
        </div>

        {/* Buyer History */}
        <div>
          <Suspense fallback={<div>Loading history...</div>}>
            <BuyerHistory history={buyer.history} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
