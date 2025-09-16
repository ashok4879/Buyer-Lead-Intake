import { Suspense } from 'react';
import Link from 'next/link';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';

import { BuyerList } from '@/components/buyers/buyer-list';
import { BuyerFilters } from '@/components/buyers/buyer-filters';
import { Button } from '@/components/ui/button';

export const metadata = {
  title: 'Buyer Leads',
  description: 'View and manage your buyer leads',
};

export default async function BuyersPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // ✅ await before using
  const params = await searchParams;

  const session = await getServerSession(authOptions);
  if (!session) {
    redirect('/auth/signin');
  }

  const search = typeof params.search === 'string' ? params.search : '';
  const city = typeof params.city === 'string' ? params.city : undefined;
  const propertyType =
    typeof params.propertyType === 'string' ? params.propertyType : undefined;
  const bhk = typeof params.bhk === 'string' ? params.bhk : undefined;
  const purpose =
    typeof params.purpose === 'string' ? params.purpose : undefined;
  const timeline =
    typeof params.timeline === 'string' ? params.timeline : undefined;
  const source = typeof params.source === 'string' ? params.source : undefined;
  const status = typeof params.status === 'string' ? params.status : undefined;

  const minBudgetStr =
    typeof params.minBudget === 'string' ? params.minBudget : undefined;
  const maxBudgetStr =
    typeof params.maxBudget === 'string' ? params.maxBudget : undefined;

  const page = typeof params.page === 'string' ? parseInt(params.page, 10) : 1;
  const limit = typeof params.limit === 'string' ? parseInt(params.limit, 10) : 10;

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Buyer Leads</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your buyer leads
          </p>
        </div>
        <Link href="/buyers/new">
          <Button>Add New Lead</Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <BuyerFilters
            search={search}
            city={city}
            propertyType={propertyType}
            bhk={bhk}
            purpose={purpose}
            timeline={timeline}
            source={source}
            status={status}
            minBudget={minBudgetStr}
            maxBudget={maxBudgetStr}
          />
        </div>

        <div className="md:col-span-3">
          <Suspense fallback={<div>Loading...</div>}>
            <BuyerList
              search={search}
              city={city}
              propertyType={propertyType}
              bhk={bhk}
              purpose={purpose}
              timeline={timeline}
              source={source}
              status={status}
              minBudget={minBudgetStr}
              maxBudget={maxBudgetStr}
              page={page}
              limit={limit}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
