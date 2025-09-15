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
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const session = await getServerSession(authOptions);

  // Redirect to login if not authenticated
  if (!session) {
    redirect('/auth/signin');
  }

  // Parse search params for filtering
  const search = typeof searchParams.search === 'string' ? searchParams.search : '';
  const city = typeof searchParams.city === 'string' ? searchParams.city : undefined;
  const propertyType = typeof searchParams.propertyType === 'string' ? searchParams.propertyType : undefined;
  const bhk = typeof searchParams.bhk === 'string' ? searchParams.bhk : undefined;
  const purpose = typeof searchParams.purpose === 'string' ? searchParams.purpose : undefined;
  const timeline = typeof searchParams.timeline === 'string' ? searchParams.timeline : undefined;
  const source = typeof searchParams.source === 'string' ? searchParams.source : undefined;
  const status = typeof searchParams.status === 'string' ? searchParams.status : undefined;
  const minBudget = typeof searchParams.minBudget === 'string' ? searchParams.minBudget : undefined;
  const maxBudget = typeof searchParams.maxBudget === 'string' ? searchParams.maxBudget : undefined;
  const page = typeof searchParams.page === 'string' ? parseInt(searchParams.page) : 1;
  const limit = typeof searchParams.limit === 'string' ? parseInt(searchParams.limit) : 10;

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
          <Button>
            Add New Lead
          </Button>
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
            minBudget={minBudget}
            maxBudget={maxBudget}
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
              minBudget={minBudget}
              maxBudget={maxBudget}
              page={page}
              limit={limit}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}