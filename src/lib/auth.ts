import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { compare } from "bcryptjs"
import { prisma } from "./prisma"
import { UserRole } from "@prisma/client"

// Build providers array conditionally to avoid runtime errors when env vars are missing
const providers = [
  ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
    ? [
        GoogleProvider({
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        }),
      ]
    : []),
  CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email }
        });

        if (!user || !user.password) {
          return null;
        }

        const isPasswordValid = await compare(credentials.password, user.password);

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id.toString(),
          email: user.email,
          name: user.name,
          role: user.role,
        };
      }
    }),
];

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma) as any,
  providers,
  secret: process.env.NEXTAUTH_SECRET || "fallback-secret-for-development",
  debug: process.env.NODE_ENV !== "production",
  events: {
    createUser: async ({ user }) => {
      try {
        const adminEmail = process.env.ADMIN_EMAIL;
        if (adminEmail && user.email) {
          const { sendEmail, emailTemplates } = await import('./email');
          const notification = emailTemplates.newUserSignup(
            user.name || 'Google User',
            user.email,
            new Date()
          );
          await sendEmail({
            to: adminEmail,
            subject: notification.subject,
            html: notification.html,
            text: notification.text,
          });
          console.log(`Admin notification sent for OAuth signup: ${user.email}`);
        }
      } catch (error) {
        console.error('Failed to send admin notification for OAuth signup:', error);
      }
    },
  },
  callbacks: {
    async signIn({ user, account, profile, email, credentials }) {
      if (user?.id) {
        try {
          // CRITICAL: Invalidate all existing NextAuth sessions for single device login
          await prisma.session.updateMany({
            where: { 
              userId: user.id,
              expires: { gt: new Date() } // Only active sessions
            },
            data: { 
              expires: new Date() // Expire immediately
            }
          });
          
          // Single device login - only NextAuth sessions are managed
          
          console.log(`Single device login: invalidated all existing sessions for user: ${user.id}`);
        } catch (error) {
          console.error('Single device login error:', error);
          // Don't block login if session management fails
        }
      }
      return true;
    },
    session: async ({ session, token }) => {
      if (session?.user && token?.sub) {
        session.user.id = token.sub;
        session.user.role = token.role as UserRole;
      }
      return session;
    },
    jwt: async ({ user, token }) => {
      if (user) {
        token.sub = user.id;
        token.role = (user as any).role;
      }
      return token
    },
  },
  session: {
    strategy: "jwt" as const,
    maxAge: 15 * 60, // 15 minutes (900 seconds)
    updateAge: 0, // Update session on every request to trigger validation
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
