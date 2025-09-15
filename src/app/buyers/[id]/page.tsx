import { Suspense } from 'react';
import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BuyerDetail } from '@/components/buyers/buyer-detail';
import { BuyerHistory } from '@/components/buyers/buyer-history';

export const metadata = {
  title: 'Buyer Detail',
  description: 'View and manage buyer lead details',
};

async function getBuyer(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const buyer = await db.buyer.findUnique({
    where: { id },
    include: {
      history: {
        orderBy: { createdAt: 'desc' },
        include: { user: true },
      },
    },
  });

  if (!buyer) {
    notFound();
  }

  return buyer;
}

export default async function BuyerDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const buyer = await getBuyer(params.id);

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">Buyer Details</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Suspense fallback={<div>Loading buyer details...</div>}>
            <BuyerDetail buyer={buyer} />
          </Suspense>
        </div>
        
        <div>
          <Suspense fallback={<div>Loading history...</div>}>
            <BuyerHistory history={buyer.history} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}