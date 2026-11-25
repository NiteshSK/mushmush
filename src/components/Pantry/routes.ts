/**
 * Routes that render the Himalayan Pantry shell (<PantryShell>) instead of the
 * legacy banner, header, footer, top padding and preloader.
 *
 * Each rollout batch owns one list below. Add a route only after its page
 * renders <PantryShell>, otherwise the page loses its header. A pattern that
 * ends in "/*" matches that path and every path below it.
 */
const BROWSE = ["/", "/shop", "/search"];
const DECIDE: string[] = ["/shop-details", "/shop-details/*"]; // batch 2: product details
const REVIEW_AND_PAY: string[] = ["/cart", "/checkout", "/track"]; // batch 3: cart and checkout
const ACCOUNT = ["/wishlist", "/recently-viewed", "/account", "/my-account", "/addresses", "/orders"]; // batch 4: saved items, account, addresses, orders
const AUTH = ["/auth/signin", "/auth/signup", "/auth/forgot-password", "/auth/reset-password", "/auth/error"]; // batch 4: sign-in, sign-up, password recovery (/signin and /signup redirect here)
const HELP = ["/about-us", "/faqs", "/contact", "/mail-success", "/error"]; // batch 5: about, FAQs, contact, mail success, error
const READ = ["/blogs/*", "/news/*"]; // batch 6: blogs and news
const TRAINING = ["/training", "/training/*"]; // batch 6: training programs and schedules
const LEGAL = ["/terms", "/privacy"];

export const PANTRY_ROUTES = [...BROWSE, ...DECIDE, ...REVIEW_AND_PAY, ...ACCOUNT, ...AUTH, ...HELP, ...READ, ...TRAINING, ...LEGAL];

const matches = (pattern: string, pathname: string) =>
  pattern.endsWith("/*")
    ? pathname === pattern.slice(0, -2) || pathname.startsWith(pattern.slice(0, -1))
    : pathname === pattern;

export const isPantryRoute = (pathname: string | null | undefined) =>
  PANTRY_ROUTES.some(pattern => matches(pattern, pathname ?? ""));

/**
 * Routes that leave out the floating chat assistant. The owner wants the chat
 * on every page, so this is empty; the launcher itself is kept compact so it
 * does not cover Add buttons.
 */
const CHAT_FREE: string[] = [];
export const hidesChat = (pathname: string | null | undefined) =>
  CHAT_FREE.some(pattern => matches(pattern, pathname ?? ""));
