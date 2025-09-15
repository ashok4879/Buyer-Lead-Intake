import Link from 'next/link';
import { UserMenu } from '../auth/user-menu';

export function Navbar() {
  return (
    <header className="bg-white shadow">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8" aria-label="Top">
        <div className="flex w-full items-center justify-between border-b border-gray-200 py-6 lg:border-none">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              Buyer Lead App
            </Link>
            <div className="ml-10 hidden space-x-8 lg:block">
              <Link href="/buyers" className="text-base font-medium text-gray-700 hover:text-gray-900">
                Leads
              </Link>
              <Link href="/buyers/new" className="text-base font-medium text-gray-700 hover:text-gray-900">
                New Lead
              </Link>
              <Link href="/buyers/import" className="text-base font-medium text-gray-700 hover:text-gray-900">
                Import/Export
              </Link>
            </div>
          </div>
          <div className="ml-10 space-x-4">
            <UserMenu />
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-x-6 py-4 lg:hidden">
          <Link href="/buyers" className="text-base font-medium text-gray-700 hover:text-gray-900">
            Leads
          </Link>
          <Link href="/buyers/new" className="text-base font-medium text-gray-700 hover:text-gray-900">
            New Lead
          </Link>
          <Link href="/buyers/import" className="text-base font-medium text-gray-700 hover:text-gray-900">
            Import/Export
          </Link>
        </div>
      </nav>
    </header>
  );
}