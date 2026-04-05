import type { NextAuthConfig } from "next-auth"

/**
 * Shared configuration for NextAuth (Auth.js) across Edge and Node environments.
 */
export const authConfig: NextAuthConfig = {
  providers: [], // Providers are added in respective Node/Edge modules
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = (user as { role?: string }).role
      }
      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  useSecureCookies: process.env.NODE_ENV === "production",
  trustHost: true,
  secret: process.env.AUTH_SECRET,
}
