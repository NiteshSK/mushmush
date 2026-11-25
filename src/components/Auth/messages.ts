/** Error codes that NextAuth adds as `?error=` when it sends a shopper back to sign-in or to /auth/error. */
const GOOGLE_FAILED = "We couldn’t finish signing in with Google. Please try again.";
const MESSAGES: Record<string, string> = {
  OAuthSignin: GOOGLE_FAILED,
  OAuthCallback: GOOGLE_FAILED,
  OAuthCreateAccount: GOOGLE_FAILED,
  Callback: GOOGLE_FAILED,
  OAuthAccountNotLinked: "This email already has a Kosvana account with a password. Sign in with your email and password.",
  AccessDenied: "Google sign-in was cancelled or not allowed. Try again, or sign in with your email and password.",
  CredentialsSignin: "That email and password don’t match. Check both and try again.",
  SessionRequired: "Please sign in to continue.",
  Configuration: "Sign-in is unavailable right now. Please try again in a few minutes.",
  Verification: "This sign-in link has expired or was already used.",
};
const DEFAULT_MESSAGE = "We couldn’t sign you in. Please try again.";

export const WRONG_PASSWORD = MESSAGES.CredentialsSignin;

/** A message for a NextAuth error code, or null when there is no code. */
export function authErrorMessage(code: string | null | undefined): string | null {
  if (!code) return null;
  return Object.prototype.hasOwnProperty.call(MESSAGES, code) ? MESSAGES[code] : DEFAULT_MESSAGE;
}
