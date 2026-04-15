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
  secret: (() => {
    const secret = process.env.NEXTAUTH_SECRET;
    if (!secret && process.env.NODE_ENV === 'production') {
      throw new Error('NEXTAUTH_SECRET environment variable is required in production');
    }
    return secret || 'dev-only-insecure-secret-do-not-use-in-prod';
  })(),
  debug: process.env.NODE_ENV !== "production",
  events: {
    createUser: async ({ user }) => {
      try {
        if (user.email) {
          const { sendEmail, emailTemplates, getConciergeEmails } = await import('./email');
          const recipients = getConciergeEmails();
          if (recipients.length > 0) {
            const notification = emailTemplates.newUserSignup(
              user.name || 'Google User',
              user.email,
              new Date()
            );
            await sendEmail({
              to: recipients,
              subject: notification.subject,
              html: notification.html,
              text: notification.text,
            });
          }
        }
      } catch (error) {
        console.error('Failed to send admin notification for OAuth signup:', error);
      }
    },
    signIn: async ({ user, account }) => {
      try {
        if (user?.id) {
          const now = new Date();

          // Update lastLoginAt in database
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: now },
          });

          // Send admin notification email
          if (user.email) {
            const { sendEmail, emailTemplates, getConciergeEmails } = await import('./email');
            const recipients = getConciergeEmails();
            if (recipients.length > 0) {
              const method = account?.provider === 'google' ? 'Google' : 'Email/Password';
              const notification = emailTemplates.userLogin(
                user.name || 'User',
                user.email,
                now,
                method,
              );
              await sendEmail({
                to: recipients,
                subject: notification.subject,
                html: notification.html,
                text: notification.text,
              });
            }
          }
        }
      } catch (error) {
        console.error('Failed to track login:', error);
        // Don't block login if tracking fails
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
    maxAge: 15 * 60, // 15 minutes — auto logout after inactivity
    updateAge: 0, // Refresh on every request (keeps session alive while user is active)
  },
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production'
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax' as const,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
}
