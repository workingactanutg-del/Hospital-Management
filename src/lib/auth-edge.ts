import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { authConfig } from "./auth.config"

/**
 * Edge-compatible auth config.
 */
export const { auth: middlewareAuth } = NextAuth({
  ...authConfig,
  providers: [
    Credentials({
      authorize: () => null, // Authorization only happens in Node.js
    }),
  ],
})

