// src/app/buyers/[id]/page.tsx
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect, notFound } from 'next/navigation';
import { BuyerForm } from '@/components/forms/buyer-form';
import { formatCurrency } from '@/lib/utils';
export default async function BuyerDetailPage({ params }: { params: { id: string } }) {
  // Ensure user is logged in
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect('/auth/signin');

  const buyerId = params?.id;
  if (!buyerId) notFound();

  // Fetch buyer with history
  const buyer = await prisma.buyer.findUnique({
    where: { id: buyerId },
    include: {
      history: {
        orderBy: { changedAt: 'desc' },
        include: { changedBy: true },
      },
    },
  });

  if (!buyer) notFound();

  // Server action to update buyer
  async function updateBuyer(formData: FormData) {
    'use server';
    await prisma.buyer.update({
      where: { id: buyerId },
      data: {
        fullName: formData.get('fullName')?.toString() ?? '',
        email: formData.get('email')?.toString() ?? '',
        phone: formData.get('phone')?.toString() ?? '',
        notes: formData.get('notes')?.toString() ?? '',
        city: formData.get('city')?.toString() ?? buyer.city,
        propertyType: formData.get('propertyType')?.toString() ?? buyer.propertyType,
        purpose: formData.get('purpose')?.toString() ?? buyer.purpose,
        bhk: formData.get('bhk')?.toString() ?? buyer.bhk,
        timeline: formData.get('timeline')?.toString() ?? buyer.timeline,
        source: formData.get('source')?.toString() ?? buyer.source,
        status: formData.get('status')?.toString() ?? buyer.status,
        tags: formData.get('tags')?.toString() ?? buyer.tags,
        budgetMin: Number(formData.get('minBudget') ?? buyer.budgetMin ?? 0),
        budgetMax: Number(formData.get('maxBudget') ?? buyer.budgetMax ?? 0),
      },
    });
  }

  return (
    <div className="container py-8">
      <h1 className="text-3xl font-bold mb-8">{buyer.fullName}</h1>

      {/* Edit Buyer Form */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Edit Buyer</h2>
        <BuyerForm
          initialData={{
            fullName: buyer.fullName,
            email: buyer.email ?? '',
            phone: buyer.phone,
            notes: buyer.notes ?? '',
            city: buyer.city,
            propertyType: buyer.propertyType,
            purpose: buyer.purpose,
            bhk: buyer.bhk ?? '',
            timeline: buyer.timeline ?? '',
            source: buyer.source ?? '',
            status: buyer.status,
            minBudget: buyer.budgetMin?.toString() ?? '',
            maxBudget: buyer.budgetMax?.toString() ?? '',
            tags: buyer.tags ?? '',
          }}
          isEditing
          serverAction={updateBuyer}
        />
      </div>

      {/* History */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">History</h2>
        {buyer.history.length === 0 ? (
          <p>No history available</p>
        ) : (
          <ul className="space-y-2">
            {buyer.history.map((h) => (
              <li key={h.id} className="border p-2 rounded">
                <strong>{h.changedBy?.name || 'Unknown'}</strong> changed on{' '}
                {new Date(h.changedAt).toLocaleString()}
                <pre className="text-sm mt-1">{JSON.stringify(h.diff, null, 2)}</pre>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Budget Display */}
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Budget</h2>
        <p>
          Min Budget: <strong>{formatCurrency(buyer.budgetMin ?? 0)}</strong> <br />
          Max Budget: <strong>{formatCurrency(buyer.budgetMax ?? 0)}</strong>
        </p>
      </div>
    </div>
  );
}
