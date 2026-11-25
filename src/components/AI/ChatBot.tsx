"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { Loader2, MessageCircle, Send, X } from "lucide-react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSession } from "next-auth/react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useRouter } from "next/navigation";
import { toast, useToasterStore } from "react-hot-toast";
import { useAppSelector } from "@/redux/store";
import { selectCartItems } from "@/redux/features/cart-slice";
import ChatProductCard, { type ChatProduct } from "./ChatProductCard";
import ChatCheckout from "./ChatCheckout";
import ChatPayment from "./ChatPayment";
import { useWishlist } from "@/app/context/WishlistContext";
import { OPEN_CHAT_EVENT } from "./open-chat";
import s from "../Pantry/chat.module.css";

// ─── Types ───────────────────────────────────────────
type ChatView = "chat" | "shop" | "wishlist" | "checkout" | "payment";

interface OrderData {
  orderNumber: string;
  orderId: string;
  total: number;
  customerName: string;
  email: string;
  paymentToken: string;
}

const PANEL_ID = "kosvana-chat";
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

const PROMPTS = [
  { label: "Dried mushrooms", prompt: "Show me your dried mushrooms" },
  { label: "Spices", prompt: "Show me your spices" },
  { label: "Dry fruits", prompt: "What dry fruits do you have?" },
  { label: "Seeds", prompt: "Show me your seeds" },
  { label: "Fresh mushrooms in Dehradun", prompt: "Which fresh mushrooms do you deliver in Dehradun?" },
  { label: "Mushroom growing training", prompt: "Tell me about mushroom cultivation training" },
  { label: "Contact Kosvana", prompt: "Where are you located and how can I contact you?" },
];

const VIEWS: { view: ChatView; label: string }[] = [
  { view: "chat", label: "Chat" },
  { view: "shop", label: "Shop" },
  { view: "wishlist", label: "Wishlist" },
];

const matches = (query: string) => typeof window.matchMedia === "function" && window.matchMedia(query).matches;

// Test mocks of react-hot-toast leave this hook out.
const useToasts: () => { toasts: { visible: boolean }[] } = typeof useToasterStore === "function" ? useToasterStore : () => ({ toasts: [] });

/** True while a toast shows. The launcher moves up on phones so it does not cover it. */
function useToastShowing() {
  return useToasts().toasts.some((t) => t.visible);
}

/** True while a pantry dialog or the bag drawer is open somewhere outside the chat. */
function useOtherDialogOpen(root: React.RefObject<HTMLElement>) {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (typeof MutationObserver === "undefined") return;
    const check = () => setOpen(Array.from(document.querySelectorAll('dialog[open], [role="dialog"][aria-modal="true"]'))
      .some((element) => !root.current?.contains(element)));
    check();
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true, attributeFilter: ["open", "aria-modal"] });
    return () => observer.disconnect();
  }, [root]);
  return open;
}

const FIELD = 'input:not([type="checkbox"]):not([type="radio"]):not([type="button"]):not([type="submit"]):not([type="hidden"]), select, textarea, [contenteditable="true"]';

/** True while a form field outside the chat has focus on a narrow screen, where the launcher could cover it. */
function useFieldFocusOutside(root: React.RefObject<HTMLElement>) {
  const [focused, setFocused] = useState(false);
  useEffect(() => {
    const onFocusIn = (event: FocusEvent) => {
      const target = event.target;
      setFocused(target instanceof Element && target.matches(FIELD) && !root.current?.contains(target) && matches("(max-width: 767px)"));
    };
    const onFocusOut = () => setFocused(false);
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, [root]);
  return focused;
}

const CONTROL = "button, a[href], input, select, textarea, [role='button']";

/** True when a page control lies under the box. Points are at most 24px apart, so a small icon button cannot slip between them. */
function coversControl(left: number, top: number, width: number, height: number, own: Element) {
  const steps = Math.max(2, Math.ceil(width / 24));
  const xs = Array.from({ length: steps + 1 }, (_, i) => left + 1 + ((width - 2) * i) / steps);
  return xs.some((x) => [top + 1, top + height / 2, top + height - 1].some((y) => {
    const hit = document.elementsFromPoint(x, y).find((node) => !own.contains(node));
    const control = hit?.closest(CONTROL);
    // A tall block link, such as a product photo, stays usable around the launcher.
    return !!control && !(control.tagName === "A" && control.getBoundingClientRect().height > 120);
  }));
}

interface Placement { lift: number; covering: boolean; compact: boolean; nudgeBlocked: boolean }

/**
 * Keeps the launcher off buttons, links and fields such as a product's Add button.
 * At the top of the page it moves up in 8px steps to the first free spot (`lift`).
 * When scrolling stops over a control, the labelled pill shrinks to its icon if that is clear (`compact`),
 * or else fades out until the next stop is clear (`covering`), so any overlap lasts only while the shopper scrolls.
 * `nudgeBlocked` is true when the phone nudge would sit on a control.
 */
function useLauncherPlacement(root: React.RefObject<HTMLElement>, launcher: React.RefObject<HTMLElement>, nudge: React.RefObject<HTMLElement>) {
  const [place, setPlace] = useState<Placement>({ lift: 0, covering: false, compact: false, nudgeBlocked: false });
  const liftRef = useRef(0);
  const compactRef = useRef(false);
  const fullWidthRef = useRef(0);
  useEffect(() => {
    if (typeof document.elementsFromPoint !== "function") return;
    let frame = 0;
    let idle = 0;
    const measure = () => {
      frame = 0;
      const el = launcher.current;
      const own = root.current;
      if (!el || !own || el.hidden) return;
      // offset* values ignore the transform, so this is the resting position. The launcher is anchored on the right.
      const { offsetLeft: left, offsetTop: top, offsetWidth: width, offsetHeight: height } = el;
      const right = left + width;
      const phone = matches("(max-width: 640px)");
      // While compact, the button is only its icon; keep checking the full pill so it can grow back.
      if (phone || !compactRef.current) fullWidthRef.current = width;
      const full = fullWidthRef.current;
      const covers = (up: number, w: number) => coversControl(right - w, top - up, w, height, own);
      if (window.scrollY <= 4) {
        let lift = 0;
        while (lift <= 96 && covers(lift, full)) lift += 8;
        liftRef.current = lift > 96 ? 0 : lift; // no free spot nearby: stay put
      }
      const lift = liftRef.current;
      const fullCovers = covers(lift, full);
      const compact = fullCovers && !phone && full > height && !covers(lift, height);
      const covering = fullCovers && !compact;
      compactRef.current = compact;
      const tag = nudge.current;
      // The nudge moves with the launcher, so check its resting box at the new lift.
      const nudgeBlocked = !!tag && tag.offsetWidth > 0 && coversControl(tag.offsetLeft, tag.offsetTop - lift, tag.offsetWidth, tag.offsetHeight, own);
      setPlace((p) => (p.lift === lift && p.covering === covering && p.compact === compact && p.nudgeBlocked === nudgeBlocked
        ? p : { lift, covering, compact, nudgeBlocked }));
    };
    const schedule = () => { if (!frame && !idle) frame = requestAnimationFrame(measure); };
    const onScroll = () => {
      window.clearTimeout(idle);
      idle = window.setTimeout(() => { idle = 0; schedule(); }, 150);
    };
    schedule();
    const observer = new MutationObserver(schedule); // content such as products renders after the first paint
    observer.observe(document.body, { childList: true, subtree: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", schedule);
      window.clearTimeout(idle);
      if (frame) cancelAnimationFrame(frame);
    };
  }, [root, launcher, nudge]);
  return place;
}

const NUDGE_KEY = "kosvana:chat-nudge";
const NUDGE_DELAY = 1500;
const NUDGE_TIME = 6000;

/**
 * A one-time "Questions? Ask us" tag beside the phone launcher.
 * It shows shortly after load, once per browser session, only while `clear` is true,
 * and collapses after NUDGE_TIME, on dismiss, or when `clear` turns false.
 */
function useNudge(clear: boolean) {
  const [state, setState] = useState<"wait" | "ready" | "show" | "done">("wait");
  useEffect(() => {
    let seen = false;
    try { seen = sessionStorage.getItem(NUDGE_KEY) === "1"; } catch { /* storage blocked: show it this time */ }
    if (seen || !matches("(max-width: 640px)")) { setState("done"); return; }
    const timer = window.setTimeout(() => setState((s) => (s === "wait" ? "ready" : s)), NUDGE_DELAY);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    if (state === "ready" && clear) setState("show");
    else if (state === "show" && !clear) setState("done");
  }, [state, clear]);
  const dismiss = useCallback(() => {
    setState("done");
    try { sessionStorage.setItem(NUDGE_KEY, "1"); } catch { /* ignore */ }
  }, []);
  useEffect(() => {
    if (state !== "show") return;
    try { sessionStorage.setItem(NUDGE_KEY, "1"); } catch { /* ignore */ }
    const timer = window.setTimeout(() => setState("done"), NUDGE_TIME);
    const onKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") setState("done"); };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      window.clearTimeout(timer);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [state]);
  return { rendered: state !== "done", showing: state === "show", dismiss };
}

const contactIcons = {
  whatsapp: "M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z",
  email: "M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z",
  phone: "M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z",
};

// ─── Main Component ──────────────────────────────────
const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [view, setView] = useState<ChatView>("chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const launcherRef = useRef<HTMLButtonElement>(null);
  const nudgeRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const wasOpen = useRef(false);
  const returnFocus = useRef<HTMLElement | null>(null);
  const { data: session } = useSession();
  const router = useRouter();
  const { items: wishlistItems, loading: wishlistLoading } = useWishlist();
  const bagCount = useAppSelector(selectCartItems).reduce((sum, item) => sum + item.quantity, 0);
  const otherDialogOpen = useOtherDialogOpen(rootRef);
  const toastShowing = useToastShowing();
  const { lift, covering, compact, nudgeBlocked } = useLauncherPlacement(rootRef, launcherRef, nudgeRef);
  const fieldFocused = useFieldFocusOutside(rootRef);
  const launcherHidden = isOpen || otherDialogOpen || fieldFocused;
  const nudge = useNudge(!launcherHidden && !covering && !toastShowing && !nudgeBlocked);

  // Shop state
  const [products, setProducts] = useState<ChatProduct[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProduct, setSelectedProduct] = useState<ChatProduct | null>(null);

  // Payment state
  const [orderData, setOrderData] = useState<OrderData | null>(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({ api: "/api/ai-chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";
  const close = useCallback(() => setIsOpen(false), []);
  const { dismiss: dismissNudge } = nudge;
  const open = useCallback(() => {
    const active = document.activeElement;
    returnFocus.current = active instanceof HTMLElement && active !== document.body ? active : null;
    dismissNudge();
    setIsOpen(true);
  }, [dismissNudge]);

  // Any page can open the chat with openChat() from ./open-chat.
  useEffect(() => {
    const onOpen = () => { if (!isOpen) open(); };
    window.addEventListener(OPEN_CHAT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_CHAT_EVENT, onOpen);
  }, [isOpen, open]);

  useEffect(() => {
    if (isOpen && view === "chat") messagesEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, isOpen, view]);

  // Focus moves into the panel when it opens. On close it returns to the element that opened the chat,
  // or to the launcher if that element has left the page.
  useEffect(() => {
    if (isOpen) {
      wasOpen.current = true;
      // Phones: focus the panel, not the input, so the keyboard does not cover the welcome prompts.
      const target = matches("(min-width: 641px)") && inputRef.current ? inputRef.current : panelRef.current;
      target?.focus();
    } else if (wasOpen.current) {
      wasOpen.current = false;
      const back = returnFocus.current;
      returnFocus.current = null;
      if (back && back.isConnected && back !== launcherRef.current) back.focus();
      else launcherRef.current?.focus();
    }
  }, [isOpen]);

  // While open: Escape closes, focus stays inside, and on phones the page behind does not scroll.
  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") { event.preventDefault(); close(); }
    };
    const onFocusIn = (event: FocusEvent) => {
      const panel = panelRef.current;
      if (panel && event.target instanceof Node && !panel.contains(event.target)) panel.focus();
    };
    const phone = matches("(max-width: 640px)");
    const overflow = document.body.style.overflow;
    if (phone) document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("focusin", onFocusIn);
      if (phone) document.body.style.overflow = overflow;
    };
  }, [isOpen, close]);

  const trapTab = (event: React.KeyboardEvent) => {
    const panel = panelRef.current;
    if (event.key !== "Tab" || !panel) return;
    const items = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => !el.closest("[hidden]"));
    if (items.length === 0) { event.preventDefault(); return; }
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;
    if (event.shiftKey && (active === first || active === panel)) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && active === last) { event.preventDefault(); first.focus(); }
  };

  // Fetch products when shop tab opens
  const fetchProducts = useCallback(async (query?: string) => {
    setLoadingProducts(true);
    try {
      let url: string;
      if (query?.trim()) {
        const params = new URLSearchParams({ q: query, limit: "20" });
        url = `/api/products/search?${params}`;
      } else {
        const params = new URLSearchParams({ limit: "20", inStock: "true" });
        url = `/api/products?${params}`;
      }
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products || []);
      }
    } catch {
      // silently fail
    } finally {
      setLoadingProducts(false);
    }
  }, []);

  useEffect(() => {
    if (view === "shop" && products.length === 0) fetchProducts();
  }, [view, products.length, fetchProducts]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const content = input;
    setInput("");
    await sendMessage({ text: content });
  };

  // On mount: check if user returned from sign-in with a pending product
  useEffect(() => {
    if (!session?.user) return;
    const pending = localStorage.getItem("chatbot_pending_product");
    if (!pending) return;
    try {
      const product = JSON.parse(pending) as ChatProduct;
      localStorage.removeItem("chatbot_pending_product");
      setSelectedProduct(product);
      setIsOpen(true);
      setView("checkout");
      toast.success(`Signed in. Continue checkout for ${product.title}.`);
    } catch {
      localStorage.removeItem("chatbot_pending_product");
    }
  }, [session]);

  const handleBuy = (product: ChatProduct) => {
    setSelectedProduct(product);
    if (session?.user) {
      setView("checkout");
    } else {
      // Save product so we can restore checkout after sign-in
      localStorage.setItem("chatbot_pending_product", JSON.stringify(product));
      // Close chatbox first so the redirect looks clean
      setIsOpen(false);
      toast(`Sign in to buy ${product.title}. Opening sign-in…`, { duration: 2500 });
      // Brief delay so user reads the toast before navigating
      setTimeout(() => {
        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
      }, 800);
    }
  };

  const handleProceedToPayment = (data: OrderData) => {
    setOrderData(data);
    setView("payment");
  };

  const handlePaymentComplete = () => {
    setSelectedProduct(null);
    setOrderData(null);
    setView("chat");
  };

  const handleSearchProducts = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts(searchQuery);
  };

  const switchView = (newView: ChatView) => {
    if (newView === "chat" || newView === "shop" || newView === "wishlist") {
      setView(newView);
    }
  };

  // ─── Link renderer shared by all markdown ──────────
  const markdownComponents = {
    a: ({ node, children, ...props }: any) => {
      const href: string = props.href || "";
      const kind = href.includes("wa.me") ? "whatsapp" : href.startsWith("mailto:") ? "email" : href.startsWith("tel:") ? "phone" : null;
      if (kind) {
        const external = kind === "whatsapp" ? { target: "_blank", rel: "noopener noreferrer" } : {};
        const label = kind === "whatsapp" ? "WhatsApp" : kind === "email" ? "Email" : "Call";
        return (
          <a {...props} {...external} className={s.contactLink}>
            <svg viewBox="0 0 24 24" aria-hidden="true"><path d={contactIcons[kind]} fillRule="evenodd" /></svg>
            {children ?? label}
          </a>
        );
      }
      return <a {...props} target="_blank" rel="noopener noreferrer">{children}</a>;
    },
  };

  // ─── Render message parts (text first, then product suggestions) ────
  const renderMessageParts = (parts: any[]) => {
    const isTool = (part: any) => typeof part.type === "string" && part.type.startsWith("tool-");
    const ordered = parts.filter((part) => !isTool(part)).concat(parts.filter(isTool));
    return ordered.map((part: any, i: number) => {
      if (part.type === "text" && part.text) {
        return (
          <ReactMarkdown key={i} remarkPlugins={[remarkGfm]} components={markdownComponents}>
            {part.text}
          </ReactMarkdown>
        );
      }
      // AI SDK v5: tool parts have type "tool-{toolName}" and state "output-available"
      if (part.type === "tool-searchProducts" && part.state === "output-available") {
        const toolProducts: ChatProduct[] = part.output || [];
        if (toolProducts.length === 0) return null;
        return (
          <div key={i} className={s.suggestions}>
            <ul className={s.productList} aria-label="Suggested products">
              {toolProducts.map((product) => (
                <li key={product.id}><ChatProductCard product={product} onBuy={handleBuy} onOpen={close} /></li>
              ))}
            </ul>
            <button type="button" onClick={() => switchView("shop")} className={s.textAction}>
              Browse more in the Shop tab
            </button>
          </div>
        );
      }
      // Fallback: handle tool parts in loading/streaming state
      if (isTool(part) && part.state !== "output-available") {
        return (
          <p key={i} className={s.pending}>
            <Loader2 aria-hidden="true" className={s.spin} />
            Searching the pantry…
          </p>
        );
      }
      return null;
    });
  };

  const browsing = view === "chat" || view === "shop" || view === "wishlist";
  const liftStyle = lift ? ({ "--lift": `${lift}px` } as React.CSSProperties) : undefined;

  // ─── Render ────────────────────────────────────────
  return (
    <div ref={rootRef} className={s.chat}>
      <button
        ref={launcherRef}
        type="button"
        className={s.launcher}
        onClick={open}
        hidden={launcherHidden}
        aria-haspopup="dialog"
        aria-label="Ask Kosvana"
        data-lifted={toastShowing ? "true" : undefined}
        data-covering={covering ? "true" : undefined}
        data-compact={compact ? "true" : undefined}
        style={liftStyle}
      >
        <MessageCircle aria-hidden="true" />
        <span className={s.launcherLabel} aria-hidden="true">Ask Kosvana</span>
      </button>

      {/* Phones only: a one-time visual hint. Screen readers already hear the launcher, so it is aria-hidden and not focusable. */}
      {nudge.rendered && !launcherHidden && (
        <div ref={nudgeRef} className={s.nudge} aria-hidden="true" data-show={nudge.showing ? "true" : undefined} style={liftStyle} onClick={open}>
          <span className={s.nudgeText}>Questions? Ask us</span>
          <span
            className={s.nudgeClose}
            title="Dismiss"
            onClick={(event) => { event.stopPropagation(); nudge.dismiss(); }}
          >
            <X />
          </span>
        </div>
      )}

      {isOpen && (
        <>
          <div className={s.backdrop} onClick={close} aria-hidden="true" />
          <div
            ref={panelRef}
            id={PANEL_ID}
            className={s.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby={`${PANEL_ID}-title`}
            tabIndex={-1}
            onKeyDown={trapTab}
          >
            <header className={s.head}>
              <div>
                <h2 id={`${PANEL_ID}-title`} className={s.title}>Ask <em>Kosvana</em></h2>
                <p className={s.scope}>
                  <span>Pantry across India</span><i aria-hidden="true" /><span className={s.srOnly}>. </span><span>Fresh mushrooms in Dehradun</span>
                </p>
              </div>
              <button type="button" className={s.iconButton} onClick={close} aria-label="Close chat">
                <X aria-hidden="true" />
              </button>
            </header>

            {browsing && (
              <nav className={s.tabs} aria-label="Chat sections">
                {VIEWS.map(({ view: v, label }) => (
                  <button key={v} type="button" className={s.tab} aria-pressed={view === v} onClick={() => switchView(v)}>
                    {label}
                    {v === "wishlist" && wishlistItems.length > 0 && (
                      <span className={s.tabCount}><span className={s.srOnly}>, </span>{wishlistItems.length}</span>
                    )}
                  </button>
                ))}
              </nav>
            )}

            {/* ─── Chat View ─── */}
            {view === "chat" && (
              <div className={s.scroll}>
                <div className={s.log} role="log" aria-label="Conversation">
                  {messages.length === 0 && (
                    <section className={s.welcome} aria-labelledby={`${PANEL_ID}-welcome`}>
                      <p className={s.kicker}>Herbertpur, Dehradun</p>
                      <h3 id={`${PANEL_ID}-welcome`}>Ask about the pantry</h3>
                      <p>Find a pack, compare sizes and prices, or ask about delivery to your PIN code. Buy here or add to your bag.</p>
                      <p>Dried mushrooms, spices, dry fruits and seeds ship across India. Fresh mushrooms are sold in Dehradun only.</p>
                      <div className={s.prompts}>
                        {PROMPTS.map((chip) => (
                          <button key={chip.label} type="button" className={s.prompt} disabled={isLoading} onClick={() => sendMessage({ text: chip.prompt })}>
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </section>
                  )}

                  {messages.map((msg) => (
                    <div key={msg.id} className={s.message} data-from={msg.role === "user" ? "user" : "assistant"}>
                      <p className={s.speaker}>{msg.role === "user" ? "You" : "Kosvana"}</p>
                      <div className={s.body}>{renderMessageParts(msg.parts)}</div>
                    </div>
                  ))}

                  {isLoading && messages[messages.length - 1]?.role === "user" && (
                    <div className={s.message} data-from="assistant">
                      <p className={s.speaker}>Kosvana</p>
                      <p className={s.pending}><Loader2 aria-hidden="true" className={s.spin} />Looking through the pantry…</p>
                    </div>
                  )}
                  {error && (
                    <p className={s.error} role="alert">Kosvana could not answer just now. Send your message again, or browse the Shop tab.</p>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            {/* ─── Shop View ─── */}
            {view === "shop" && (
              <div className={s.scroll}>
                <form onSubmit={handleSearchProducts} className={s.search} role="search">
                  <label htmlFor={`${PANEL_ID}-search`} className={s.label}>Search the pantry</label>
                  <div className={s.field}>
                    <input
                      id={`${PANEL_ID}-search`}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Cumin, walnuts, shiitake…"
                      className={s.textInput}
                      autoComplete="off"
                      enterKeyHint="search"
                    />
                    {searchQuery && (
                      <button type="button" className={s.clear} aria-label="Clear search" onClick={() => { setSearchQuery(""); fetchProducts(); }}>
                        <X aria-hidden="true" />
                      </button>
                    )}
                    <button type="submit" className={s.fieldButton}>Search</button>
                  </div>
                </form>

                <div aria-live="polite">
                  {loadingProducts ? (
                    <p className={s.loading}><Loader2 aria-hidden="true" className={s.spin} />Opening the pantry…</p>
                  ) : products.length === 0 ? (
                    <div className={s.state}>
                      <h3>No products found</h3>
                      <p>Try another word, such as cumin or walnuts, or ask in Chat.</p>
                    </div>
                  ) : (
                    <div className={s.results}>
                      <ul className={s.productList} aria-label="Products">
                        {products.map((product) => (
                          <li key={product.id}><ChatProductCard product={product} onBuy={handleBuy} onOpen={close} /></li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ─── Wishlist View ─── */}
            {view === "wishlist" && (
              <div className={s.scroll}>
                {!session?.user ? (
                  <div className={s.state}>
                    <h3>Your wishlist</h3>
                    <p>Sign in to see the products you saved.</p>
                    <button
                      type="button"
                      className={s.primary}
                      onClick={() => {
                        setIsOpen(false);
                        router.push(`/auth/signin?callbackUrl=${encodeURIComponent(window.location.href)}`);
                      }}
                    >
                      Sign in
                    </button>
                  </div>
                ) : wishlistLoading ? (
                  <p className={s.loading}><Loader2 aria-hidden="true" className={s.spin} />Loading your wishlist…</p>
                ) : wishlistItems.length === 0 ? (
                  <div className={s.state}>
                    <h3>Your wishlist is empty</h3>
                    <p>Save a product with the heart on its card. It stays here for later.</p>
                    <button type="button" className={s.textAction} onClick={() => switchView("shop")}>
                      Browse the Shop tab
                    </button>
                  </div>
                ) : (
                  <div className={s.results}>
                  <ul className={s.productList} aria-label="Saved products">
                    {wishlistItems.map((item: any) => {
                      const p = item.product;
                      if (!p) return null;
                      const chatProduct: ChatProduct = {
                        id: p.id,
                        title: p.title,
                        slug: p.slug,
                        price: p.price,
                        discountedPrice: p.discountedPrice || null,
                        discountPercentage: p.discountedPrice ? Math.round(((p.price - p.discountedPrice) / p.price) * 100) : 0,
                        hasDiscount: !!p.discountedPrice && p.discountedPrice < p.price,
                        inStock: p.inStock,
                        imgs: p.imgs || { thumbnails: [], previews: [] },
                        averageRating: p.averageRating || 0,
                        reviewCount: p.reviewCount || 0,
                        measurementValue: p.measurementValue,
                        measurementType: p.measurementType,
                        stockQuantity: p.stockQuantity,
                      };
                      return <li key={p.id}><ChatProductCard product={chatProduct} onBuy={handleBuy} onOpen={close} /></li>;
                    })}
                  </ul>
                  </div>
                )}
              </div>
            )}

            {/* ─── Checkout View ─── */}
            {view === "checkout" && selectedProduct && (
              <ChatCheckout
                product={selectedProduct}
                onBack={() => setView("shop")}
                onProceedToPayment={handleProceedToPayment}
                userInfo={session?.user ? { name: session.user.name, email: session.user.email } : undefined}
              />
            )}

            {/* ─── Payment View ─── */}
            {view === "payment" && orderData && (
              <ChatPayment
                orderNumber={orderData.orderNumber}
                total={orderData.total}
                customerName={orderData.customerName}
                email={orderData.email}
                paymentToken={orderData.paymentToken}
                onBack={() => setView("checkout")}
                onPaymentComplete={handlePaymentComplete}
              />
            )}

            {browsing && bagCount > 0 && (
              <div className={s.bagBar}>
                <span>{bagCount} {bagCount === 1 ? "item" : "items"} in your bag</span>
                <Link href="/cart" className={s.textAction} onClick={close}>View bag</Link>
              </div>
            )}

            {/* Chat Input */}
            {view === "chat" && (
              <>
                <form onSubmit={handleFormSubmit} className={s.composer}>
                  <label htmlFor={`${PANEL_ID}-input`} className={s.srOnly}>Message Kosvana</label>
                  <input
                    ref={inputRef}
                    id={`${PANEL_ID}-input`}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Ask about a product or delivery"
                    className={s.input}
                    autoComplete="off"
                    enterKeyHint="send"
                  />
                  <button type="submit" className={s.send} disabled={!input.trim() || isLoading} aria-label="Send message">
                    <Send aria-hidden="true" />
                  </button>
                </form>
                <p className={s.note}>AI answers can be wrong. Your bag and checkout show the final price.</p>
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default ChatBot;
