'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [authType, setAuthType] = useState<'magic-link' | 'demo'>('magic-link');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);

    try {
      if (authType === 'magic-link') {
        await signIn('email', { email, callbackUrl: '/' });
      } else {
        const result = await signIn('credentials', {
          email,
          redirect: false,
        });

        if (result?.error) {
          throw new Error(result.error);
        }

        router.push('/');
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      console.error('Authentication error:', message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
            Sign in to your account
          </h2>
        </div>

        <div className="flex justify-center space-x-4 mb-6">
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${authType === 'magic-link' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setAuthType('magic-link')}
          >
            Magic Link
          </button>
          <button
            type="button"
            className={`px-4 py-2 rounded-md ${authType === 'demo' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
            onClick={() => setAuthType('demo')}
          >
            Demo Login
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">
              Email address
            </label>
            <div className="mt-1">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : authType === 'magic-link' ? 'Send Magic Link' : 'Sign In'}
            </button>
          </div>

          {authType === 'magic-link' && (
            <p className="mt-2 text-center text-sm text-gray-600">
              We'll email you a magic link for passwordless sign in
            </p>
          )}
        </form>
      </div>
    </div>
  );
}