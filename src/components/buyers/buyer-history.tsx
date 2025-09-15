'use client';

import { BuyerHistory as BuyerHistoryType } from '@prisma/client';
import { formatDate } from '@/lib/utils';

type HistoryWithUser = BuyerHistoryType & {
  user: {
    name: string | null;
    email: string | null;
    image: string | null;
  } | null;
};

interface BuyerHistoryProps {
  history: HistoryWithUser[];
}

export function BuyerHistory({ history }: BuyerHistoryProps) {
  if (!history.length) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">History</h2>
        <p className="text-gray-500">No history available</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">History</h2>
      
      <div className="space-y-4">
        {history.map((entry) => (
          <div key={entry.id} className="border-b pb-4 last:border-0 last:pb-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                {entry.user?.image ? (
                  <img 
                    src={entry.user.image} 
                    alt={entry.user.name || 'User'} 
                    className="w-6 h-6 rounded-full mr-2"
                  />
                ) : (
                  <div className="w-6 h-6 bg-gray-200 rounded-full mr-2 flex items-center justify-center text-xs">
                    {entry.user?.name?.charAt(0) || 'U'}
                  </div>
                )}
                <span className="text-sm font-medium">
                  {entry.user?.name || entry.user?.email || 'Unknown user'}
                </span>
              </div>
              <span className="text-xs text-gray-500">
                {formatDate(entry.createdAt)}
              </span>
            </div>
            
            <div className="text-sm">
              <span className="font-medium">{entry.action}</span>
              {entry.note && (
                <p className="text-gray-600 mt-1">{entry.note}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}