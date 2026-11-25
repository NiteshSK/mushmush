import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { type AccountPath, signInHref } from "./links";

/** Server check for account pages: a signed-out visitor goes to sign-in and returns to this page afterwards. */
export async function requireSignIn(path: AccountPath) {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect(signInHref(path));
  return session;
}
