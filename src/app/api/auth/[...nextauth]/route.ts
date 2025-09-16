import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { cookies, headers } from "next/headers";

// Create the NextAuth handler
const handler = NextAuth(authOptions);

export async function GET(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;     // ✅ await params
  const cookieStore = await cookies();     // ✅ await cookies
  const headerStore = await headers();     // ✅ await headers

  return handler(req, { params, cookies: cookieStore, headers: headerStore });
}

export async function POST(req: Request, context: { params: Promise<{ nextauth: string[] }> }) {
  const params = await context.params;
  const cookieStore = await cookies();
  const headerStore = await headers();

  return handler(req, { params, cookies: cookieStore, headers: headerStore });
}
