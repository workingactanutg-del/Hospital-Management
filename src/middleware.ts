import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

/**
 * Minimal middleware — NO Edge session reading.
 * Auth protection is handled server-side by layouts/pages using auth() from auth.ts.
 * This avoids Edge runtime incompatibilities with NextAuth v5 + Prisma adapter.
 */
export function middleware(req: NextRequest) {
  // Allow everything through — server components handle auth redirects
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
