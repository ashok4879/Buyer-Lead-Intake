'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      // Use credentials provider (Demo login)
      const result = await signIn('credentials', {
        redirect: false,
        email,
      });

      if (result?.error) throw new Error(result.error);

      // Success
      toast.success('Logged in successfully!');
      router.push('/');
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unknown error occurred';
      setErrorMessage(message);
      toast.error(`Login failed: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Sign in
        </h2>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm font-medium">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-blue-500"
            />
          </div>

          {errorMessage && <p className="text-red-500 text-sm">{errorMessage}</p>}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-blue-600 py-2 px-4 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-gray-600">
          Enter your email to log in. A demo account will be created if it doesn’t exist.
        </p>
      </div>
    </div>
  );
}
