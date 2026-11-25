"use client";

import { createContext, type ReactNode, useContext, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { Mail, MapPin, Menu, MessageCircle, Search, ShoppingBag, UserRound } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import { selectCartItems } from "@/redux/features/cart-slice";
import { trackVisitAction } from "@/lib/visit-analytics";
import PantryDialog, { type Panel } from "./PantryDialog";
import BagDrawer from "../Cart/BagDrawer";
import { CONTACT } from "../Help/ContactOptions";
import { openChat } from "../AI/open-chat";
import styles from "./pantry.module.css";

const PanelContext = createContext<(panel: Panel) => void>(() => {});

/** Opens the shared menu, search or delivery dialog from anywhere inside the pantry shell. */
export const useOpenPanel = () => useContext(PanelContext);

type Props = {
  children: ReactNode;
  /** Marks the matching main-navigation link as the current page. */
  current?: "shop" | "training" | "story";
  skipTo?: { href: string; label: string };
  /** Where "Browse the pantry" in the delivery dialog leads. Omit to keep the shopper on this page. */
  browseHref?: string;
};

// Pages where "Sign in" should not send the shopper back after signing in.
const NO_RETURN = /^\/(?:auth\/|signin|signup|forgot-password|reset-password)|^\/?$/;

/** Sign-in link that brings the shopper back to the page they were on. */
export function signInHere(pathname: string | null) {
  return pathname && !NO_RETURN.test(pathname) ? `/auth/signin?callbackUrl=${encodeURIComponent(pathname)}` : "/auth/signin";
}

export default function PantryShell({ children, current, skipTo = { href: "#main", label: "Skip to content" }, browseHref }: Props) {
  const [panel, setPanel] = useState<Panel | null>(null);
  const openPanel = (next: Panel) => {
    if (next === "delivery") trackVisitAction("delivery_check");
    setPanel(next);
  };
  const items = useAppSelector(selectCartItems);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const count = mounted ? items.reduce((sum, item) => sum + item.quantity, 0) : 0;
  const pathname = usePathname();
  // Training pages are marked from the address, so every /training page highlights the menu item.
  const active = current ?? (pathname?.startsWith("/training") ? "training" : undefined);
  const here = (page: Props["current"]) => active === page ? "page" as const : undefined;
  // The bag link opens a drawer so shoppers keep their place; /cart and /checkout already show the bag.
  const [bagOpen, setBagOpen] = useState(false);
  const signedIn = useSession()?.status === "authenticated";
  const drawer = mounted && !/^\/(cart|checkout)\/?$/.test(window.location.pathname);

  return (
    <PanelContext.Provider value={openPanel}>
      <div className={styles.pantry}>
        <a href={skipTo.href} className={styles.skip}>{skipTo.label}</a>
        <div className={styles.deliveryStrip}>
          <button onClick={() => openPanel("delivery")} aria-label="Pantry across India. Fresh mushrooms in Dehradun. Check delivery by PIN code">
            <span>Pantry across India</span><i aria-hidden="true" /><span>Fresh mushrooms in Dehradun</span>
          </button>
        </div>
        <header className={styles.masthead}>
          <div className={styles.headerInner}>
            <nav aria-label="Main navigation" className={styles.desktopNav}>
              <Link href="/shop" aria-current={here("shop")}>Shop</Link><Link href="/training" aria-current={here("training")}>Training</Link><Link href="/about-us" aria-current={here("story")}>Our story</Link>
            </nav>
            <button className={styles.mobileMenu} aria-label="Open navigation" onClick={() => setPanel("menu")}><Menu /></button>
            <Link href="/" className={styles.signature} aria-label="Kosvana home">
              <Image src="/images/logo/logo_transparent.png" alt="Kosvana" width={141} height={65} priority />
            </Link>
            <div className={styles.tools}>
              <button aria-label="Search the shop" onClick={() => setPanel("search")}><Search /><span>Search</span></button>
              {signedIn
                ? <Link href="/account" aria-label="Your account"><UserRound /><span>Account</span></Link>
                : <Link href={signInHere(pathname)} aria-label="Sign in"><UserRound /><span>Sign in</span></Link>}
              <Link href="/cart" aria-label={`View bag, ${count} ${count === 1 ? "item" : "items"}`} aria-haspopup={drawer ? "dialog" : undefined}
                onClick={event => { if (!drawer || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return; event.preventDefault(); trackVisitAction("bag_open"); setBagOpen(true); }}><ShoppingBag /><span>Bag</span>{count > 0 && <b>{count}</b>}</Link>
            </div>
          </div>
        </header>
        {children}
        <footer className={styles.footer}>
          <div className={styles.footerInner}>
            <div className={styles.footerBrand}>
              <Link href="/" className={styles.footerLogo} aria-label="Kosvana home"><Image src="/images/logo/logo_transparent.png" alt="Kosvana" width={126} height={58} /></Link>
              <p className={styles.footerLine}>Mushrooms grown by hand in Herbertpur. A pantry sent across India.</p>
              <address>
                <a href={CONTACT.maps} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" />{CONTACT.address}<span className={styles.srOnly}> (opens in a new tab)</span></a>
                <a href={CONTACT.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />WhatsApp {CONTACT.phoneLabel}<span className={styles.srOnly}> (opens in a new tab)</span></a>
                <a href={`mailto:${CONTACT.email}`}><Mail aria-hidden="true" />{CONTACT.email}</a>
              </address>
            </div>
            <nav aria-label="Shop" className={styles.footerCol}>
              <h2>Shop</h2>
              <ul>
                <li><Link href="/shop">All products</Link></li>
                <li><Link href="/shop?category=spices">Spices</Link></li>
                <li><Link href="/shop?category=dry-fruits">Dry fruits</Link></li>
                <li><Link href="/shop?category=seeds">Seeds</Link></li>
                <li><Link href="/shop?category=edible,medicinal,powders,tinctures">Mushrooms</Link></li>
                <li><Link href="/#grow">Spawn and grow bags</Link></li>
              </ul>
            </nav>
            <nav aria-label="Customer service" className={styles.footerCol}>
              <h2>Help</h2>
              <ul>
                <li><button type="button" onClick={() => openPanel("delivery")}>Delivery</button></li>
                <li><button type="button" onClick={() => openChat()}>Ask Kosvana</button></li>
                <li><Link href="/faqs">FAQs</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </nav>
            <nav aria-label="About Kosvana" className={styles.footerCol}>
              <h2>Kosvana</h2>
              <ul>
                <li><Link href="/about-us">Our story</Link></li>
                <li><Link href="/training">Training</Link></li>
                <li><Link href="/blogs">Journal</Link></li>
                <li><Link href="/news">News</Link></li>
              </ul>
            </nav>
            <nav aria-label="Account" className={styles.footerCol}>
              <h2>Account</h2>
              <ul>
                {signedIn ? <>
                  <li><Link href="/account">My account</Link></li>
                  <li><Link href="/orders">Orders</Link></li>
                  <li><Link href="/wishlist">Wishlist</Link></li>
                </> : <>
                  <li><Link href={signInHere(pathname)}>Sign in</Link></li>
                  <li><Link href="/auth/signup">Create account</Link></li>
                </>}
              </ul>
            </nav>
          </div>
          <div className={styles.footerBase}>
            <p>© {new Date().getFullYear()} {CONTACT.name}</p>
            <nav aria-label="Legal"><Link href="/terms">Terms</Link><Link href="/privacy">Privacy</Link></nav>
          </div>
        </footer>
        {panel && <PantryDialog panel={panel} onClose={() => setPanel(null)} browseHref={browseHref} signedIn={signedIn} signInHref={signInHere(pathname)} />}
        {bagOpen && <BagDrawer onClose={() => setBagOpen(false)} />}
        <Toaster position="bottom-center" />
      </div>
    </PanelContext.Provider>
  );
}
