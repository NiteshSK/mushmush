// These claims come from NextAuth's verified Google OpenID Connect profile at sign-in.
export type GoogleWorkspaceIdentity = { subject: string; email: string; hostedDomain: string };

export function googleWorkspaceIdentity(
  account: { provider?: string; providerAccountId?: string } | null | undefined,
  profile: { sub?: unknown; email?: unknown; hd?: unknown; email_verified?: unknown } | undefined
): GoogleWorkspaceIdentity | null {
  if (account?.provider !== "google" || !account.providerAccountId || profile?.sub !== account.providerAccountId ||
      profile.email_verified !== true || typeof profile.email !== "string" || typeof profile.hd !== "string") return null;
  const email = profile.email.trim().toLowerCase();
  const hostedDomain = profile.hd.trim().toLowerCase();
  if (!hostedDomain || !email) return null;
  return { subject: account.providerAccountId, email, hostedDomain };
}

export function matchesWorkspace(identity: GoogleWorkspaceIdentity | null | undefined, accountEmail: string | null, domain: string | undefined) {
  const expected = domain?.trim().toLowerCase();
  if (!expected || !identity?.subject || !accountEmail) return false;
  return identity.hostedDomain === expected && identity.email === accountEmail.trim().toLowerCase() &&
    identity.email.slice(identity.email.lastIndexOf("@") + 1) === expected;
}

export function managedStaffMode() {
  return process.env.STAFF_AUTH_MODE === "managed-google";
}
export function needsManagedSignIn(role: string | undefined) {
  return managedStaffMode() && (role === "ADMIN" || role === "STAFF");
}
