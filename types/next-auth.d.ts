import type { GoogleWorkspaceIdentity } from "@/lib/staff-identity"
import { DefaultSession, DefaultUser } from "next-auth"
import { UserRole } from "@prisma/client"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: UserRole
      staffDuties?: string[]
      verifiedStaffWorkspace?: boolean
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    id: string
    role: UserRole
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    staffGoogleIdentity?: GoogleWorkspaceIdentity | null
    id: string
    role: UserRole
  }
}
