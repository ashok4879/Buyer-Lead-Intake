import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';

export const metadata = {
  title: 'Admin Dashboard',
  description: 'Admin dashboard for managing the application',
};

async function getStats() {
  const buyerCount = await db.buyer.count();
  const userCount = await db.user.count();

  const statusCounts = await db.buyer.groupBy({ by: ['status'], _count: true });
  const sourceCounts = await db.buyer.groupBy({ by: ['source'], _count: true });
  const cityCounts = await db.buyer.groupBy({ by: ['city'], _count: true });

  const recentBuyers = await db.buyer.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: { owner: { select: { name: true, email: true } } },
  });

  const recentHistory = await db.buyerHistory.findMany({
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      buyer: { select: { fullName: true } },
      user: { select: { name: true, email: true } },
    },
  });

  return {
    buyerCount,
    userCount,
    statusCounts,
    sourceCounts,
    cityCounts,
    recentBuyers,
    recentHistory,
  };
}

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/');
  }

  const stats = await getStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Converted': return 'bg-green-500';
      case 'Dropped': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-4xl font-extrabold mb-8 text-gray-900">Admin Dashboard</h1>

      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">Total Buyers</h2>
          <p className="text-3xl font-bold">{stats.buyerCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">Total Users</h2>
          <p className="text-3xl font-bold">{stats.userCount}</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">Conversion Rate</h2>
          <p className="text-3xl font-bold">
            {stats.statusCounts.find(s => s.status === 'Converted')
              ? Math.round((stats.statusCounts.find(s => s.status === 'Converted')!._count / stats.buyerCount) * 100)
              : 0}%
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-lg font-semibold mb-2">Active Leads</h2>
          <p className="text-3xl font-bold">
            {stats.buyerCount -
              (stats.statusCounts.find(s => s.status === 'Converted')?._count || 0) -
              (stats.statusCounts.find(s => s.status === 'Dropped')?._count || 0)}
          </p>
        </div>
      </div>

      {/* Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Status */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4">Status Distribution</h2>
          <div className="space-y-4">
            {stats.statusCounts.map((status) => {
              const width = (status._count / stats.buyerCount) * 100;
              return (
                <div key={status.status} className="flex items-center">
                  <span className="w-28 text-sm">{status.status}</span>
                  <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`${getStatusColor(status.status)} h-full rounded-full transition-all duration-500`}
                      style={{ width: `${width}%` }}
                      title={`${status._count} (${Math.round(width)}%)`}
                    ></div>
                  </div>
                  <span className="ml-4 text-sm font-medium">{status._count} ({Math.round(width)}%)</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Source */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4">Source Distribution</h2>
          <div className="space-y-4">
            {stats.sourceCounts.map((source) => {
              const width = (source._count / stats.buyerCount) * 100;
              return (
                <div key={source.source} className="flex items-center">
                  <span className="w-28 text-sm">{source.source}</span>
                  <div className="flex-1 h-5 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${width}%` }}
                      title={`${source._count} (${Math.round(width)}%)`}
                    ></div>
                  </div>
                  <span className="ml-4 text-sm font-medium">{source._count} ({Math.round(width)}%)</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Buyers & Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Buyers */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4">Recent Buyers</h2>
          <div className="divide-y">
            {stats.recentBuyers.map((buyer) => (
              <div key={buyer.id} className="py-3 animate-fadeIn">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-medium">{buyer.fullName}</p>
                    <p className="text-sm text-gray-500">{buyer.email || buyer.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      buyer.status === 'Converted' ? 'bg-green-100 text-green-800' :
                      buyer.status === 'Dropped' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {buyer.status}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">Owner: {buyer.owner.name || buyer.owner.email}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white rounded-xl shadow-lg p-6 hover:shadow-2xl transition-shadow duration-300">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          <div className="divide-y">
            {stats.recentHistory.map((history) => (
              <div key={history.id} className="py-3 animate-fadeIn">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{history.action}</p>
                    <p className="text-sm text-gray-500">{history.buyer.fullName}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">{new Date(history.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500">By: {history.user.name || history.user.email}</p>
                  </div>
                </div>
                {history.details && <p className="text-sm text-gray-600 mt-1">{history.details}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
