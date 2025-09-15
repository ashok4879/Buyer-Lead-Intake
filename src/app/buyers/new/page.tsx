import { BuyerForm } from '@/components/forms/buyer-form';

export const metadata = {
  title: 'Add New Buyer Lead',
  description: 'Add a new buyer lead to the system',
};

export default function NewBuyerPage() {
  return (
    <div className="container mx-auto py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Add New Buyer Lead</h1>
        <p className="text-muted-foreground mt-2">
          Fill in the details to add a new buyer lead to the system.
        </p>
      </div>
      <div className="bg-white p-6 rounded-lg shadow">
        <BuyerForm />
      </div>
    </div>
  );
}