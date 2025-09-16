import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export default async function Home() {
  "use server"; // helps Next.js understand this is a server component

  // ✅ Await session properly
  const session = await getServerSession(authOptions);

  // Optional: redirect if not logged in
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="bg-white">
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Buyer Lead Intake Application
            </h1>
            <p className="mt-6 text-lg leading-8 text-gray-600">
              Efficiently capture, manage, and track buyer leads with our comprehensive lead management system.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/buyers"
                className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
              >
                View Leads
              </Link>
              <Link
                href="/buyers/new"
                className="rounded-md bg-green-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600"
              >
                Add New Lead
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
