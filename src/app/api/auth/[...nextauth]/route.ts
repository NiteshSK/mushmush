// Dynamic import to handle NextAuth compatibility with Next.js 15
import NextAuth from "next-auth"
import { authOptions } from "@/lib/auth"

// Create the handler with proper error handling
const handler = NextAuth(authOptions)

// Export for both GET and POST methods
export { handler as GET, handler as POST }
