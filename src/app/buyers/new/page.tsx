'use client';

import { BuyerForm } from '@/components/forms/buyer-form';
import { addBuyer } from '@/lib/actions/buyer'; // ✅ Make sure this file exists and exports addBuyer

export default function NewBuyerPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-4">Add New Buyer Lead</h1>
      {/* Pass the server action to the client form */}
      <BuyerForm serverAction={addBuyer} />
    </div>
  );
}
