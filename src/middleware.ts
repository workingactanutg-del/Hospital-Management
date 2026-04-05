import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { middlewareAuth } from "@/lib/auth-edge"

export default middlewareAuth((req: NextRequest & { auth?: { user?: { role?: string } } | null }) => {
  const { pathname } = req.nextUrl
  const session = req.auth
  const role = session?.user?.role

  // Public routes
  const publicRoutes = ["/login", "/register", "/api/auth", "/api/doctors"]
  if (publicRoutes.some((r) => pathname.startsWith(r))) {
    return NextResponse.next()
  }

  // Protected dashboard routes
  if (pathname.startsWith("/patient") || pathname.startsWith("/doctor") || pathname.startsWith("/admin")) {
    if (!session) {
      return NextResponse.redirect(new URL("/login", req.url))
    }

    // Direct, explicit role-to-dashboard mapping to avoid infinite loops
    const correctDashboard = 
      role === "ADMIN" ? "/admin/dashboard" : 
      role === "DOCTOR" ? "/doctor/dashboard" : 
      role === "PATIENT" ? "/patient/dashboard" : 
      "/login"

    // If the role is unexpected or the user is in the wrong dashboard, send them to the correct one
    if (
      (pathname.startsWith("/admin") && role !== "ADMIN") ||
      (pathname.startsWith("/doctor") && role !== "DOCTOR") ||
      (pathname.startsWith("/patient") && role !== "PATIENT") ||
      (!["ADMIN", "DOCTOR", "PATIENT"].includes(role || ""))
    ) {
      return NextResponse.redirect(new URL(correctDashboard, req.url))
    }
  }

  return NextResponse.next()
})



export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
