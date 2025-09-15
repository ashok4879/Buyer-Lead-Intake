export default function VerifyRequest() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Check your email
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          A sign in link has been sent to your email address.
        </p>
        <p className="mt-2 text-center text-sm text-gray-600">
          Please check your email (including spam folder) for the magic link.
        </p>
      </div>
    </div>
  );
}