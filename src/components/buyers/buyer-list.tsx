'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';

import { formatCurrency, formatDate, parseTagsString } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/status-badge';
import { TagChip } from '@/components/ui/tag-chip';

interface BuyerListProps {
  search?: string;
  city?: string;
  propertyType?: string;
  bhk?: string;
  purpose?: string;
  timeline?: string;
  source?: string;
  status?: string;
  minBudget?: string;
  maxBudget?: string;
  page?: number;
  limit?: number;
}

interface Buyer {
  id: string;
  name: string;
  email: string;
  phone: string;
  budget: number;
  city: string;
  propertyType: string;
  bhk: string;
  purpose: string;
  timeline: string;
  source: string;
  status: string;
  tags: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function BuyerList({
  search,
  city,
  propertyType,
  bhk,
  purpose,
  timeline,
  source,
  status,
  minBudget,
  maxBudget,
  page = 1,
  limit = 10,
}: BuyerListProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page,
    limit,
    totalPages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch buyers when filters change
  useEffect(() => {
    const fetchBuyers = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Build query string from filters
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (city) params.append('city', city);
        if (propertyType) params.append('propertyType', propertyType);
        if (bhk) params.append('bhk', bhk);
        if (purpose) params.append('purpose', purpose);
        if (timeline) params.append('timeline', timeline);
        if (source) params.append('source', source);
        if (status) params.append('status', status);
        if (minBudget) params.append('minBudget', minBudget);
        if (maxBudget) params.append('maxBudget', maxBudget);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await fetch(`/api/buyers?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch buyers');
        }

        const data = await response.json();
        setBuyers(data.buyers);
        setPagination(data.pagination);
      } catch (err) {
        console.error('Error fetching buyers:', err);
        setError('Failed to load buyers. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBuyers();
  }, [
    search,
    city,
    propertyType,
    bhk,
    purpose,
    timeline,
    source,
    status,
    minBudget,
    maxBudget,
    page,
    limit,
  ]);

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`${pathname}?${params.toString()}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
        <p>{error}</p>
        <Button 
          variant="outline" 
          className="mt-2"
          onClick={() => router.refresh()}
        >
          Try Again
        </Button>
      </div>
    );
  }

  if (buyers.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow p-6 text-center">
        <h3 className="text-lg font-medium mb-2">No buyers found</h3>
        <p className="text-gray-500 mb-4">
          {Object.keys(searchParams).length > 0
            ? 'Try adjusting your filters to see more results.'
            : 'Get started by adding your first buyer lead.'}
        </p>
        <Link href="/buyers/new">
          <Button>Add New Lead</Button>
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requirements
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tags
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Added
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {buyers.map((buyer) => (
                <tr 
                  key={buyer.id} 
                  className="hover:bg-gray-50 cursor-pointer"
                  onClick={() => router.push(`/buyers/${buyer.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {buyer.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">{buyer.email}</div>
                    <div className="text-sm text-gray-500">{buyer.phone}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {buyer.city.replace('_', ' ')} | {buyer.propertyType.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-gray-500">
                      {buyer.bhk.replace('_', ' ')} | {buyer.purpose.replace('_', ' ')}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {formatCurrency(buyer.budget)}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={buyer.status} />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {parseTagsString(buyer.tags).map((tag, index) => (
                        <TagChip key={index} tag={tag} />
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {formatDate(buyer.createdAt)}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <div className="text-sm text-gray-700">
            Showing <span className="font-medium">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-medium">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-medium">{pagination.total}</span> results
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page === 1}
            >
              Previous
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (pageNum) => (
                <Button
                  key={pageNum}
                  variant={pageNum === pagination.page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page === pagination.totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}