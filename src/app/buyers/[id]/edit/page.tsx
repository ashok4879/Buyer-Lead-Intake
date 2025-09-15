import { notFound, redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';

import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { BuyerForm } from '@/components/forms/buyer-form';

export const metadata = {
  title: 'Edit Buyer',
  description: 'Edit buyer lead information',
};

async function getBuyer(id: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/api/auth/signin');
  }

  const buyer = await db.buyer.findUnique({
    where: { id },
  });

  if (!buyer) {
    notFound();
  }

  return buyer;
}

export default async function EditBuyerPage({
  params,
}: {
  params: { id: string };
}) {
  const buyer = await getBuyer(params.id);

  // Convert tags array to string for the form
  const buyerData = {
    ...buyer,
    tags: buyer.tags.join(', ')
  };

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-2">Edit Buyer</h1>
      <p className="text-gray-500 mb-8">Update buyer lead information</p>
      
      <div className="bg-white rounded-lg shadow p-6">
        <BuyerForm initialData={buyerData} isEditing={true} />
      </div>
    </div>
  );
}