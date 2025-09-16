'use client';
import { useState } from 'react';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
export function UserMenu() {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const toggleMenu = () => setIsOpen(!isOpen);
  if (status === 'loading') {
    return <div className="h-10 w-10 rounded-full bg-gray-200 animate-pulse"></div>;
  }
  if (status === 'unauthenticated') {
    return (
      <Link
        href="/auth/signin"
        className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
      >
        Sign in
      </Link>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={toggleMenu}
        className="flex items-center space-x-2 focus:outline-none"
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
          {session?.user?.name?.charAt(0) || session?.user?.email?.charAt(0) || '?'}
        </div>
        <span className="hidden md:inline-block">
          {session?.user?.name || session?.user?.email?.split('@')[0]}
        </span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
          <div className="py-1" role="menu" aria-orientation="vertical">
            <Link
              href="/buyers"
              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
              onClick={() => setIsOpen(false)}
            >
              My Leads
            </Link>
            
            {/* Admin links */}
            {session?.user?.role === 'ADMIN' && (
              <>
                <div className="border-t border-gray-100 my-1"></div>
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  Admin Dashboard
                </Link>
                <Link
                  href="/admin/users"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  role="menuitem"
                  onClick={() => setIsOpen(false)}
                >
                  User Management
                </Link>
              </>
            )}
            
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: '/' });
              }}
              className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              role="menuitem"
            >
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}