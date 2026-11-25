"use client";
import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { ArrowUpRight, Menu, X } from "lucide-react";
import { Toaster } from "react-hot-toast";
import { useModalDialog } from "@/components/Cart/useModalDialog";
import { canWork, pageDuties } from "@/lib/staff-permissions";

type Actor = { role: string; staffDuties?: string[]; name?: string | null; email?: string | null };
const groups = [
  { title: "", items: [["Today","/admin"]] },
  { title: "Store operations", items: [["Orders","/admin/orders"],["Products","/admin/products"],["Inventory","/admin/inventory"],["Delivery coverage","/admin/shipping"],["Visit analytics","/admin/analytics"]] },
  { title: "Training", items: [["Programs","/admin/training-programs"],["Registrations","/admin/training-registrations"],["Training payments","/admin/payment-verification"]] },
  { title: "Marketing & content", items: [["Discounts","/admin/discounts"],["Coupons","/admin/coupons"],["Banners","/admin/promotional-banners"],["Journal","/admin/blogs"],["News","/admin/news"],["Tags","/admin/tags"]] },
  { title: "Settings & access", items: [["People","/admin/users"],["Reconciliation","/admin/operations"],["Settings","/admin/settings"]] }
];
const active = (pathname: string, href: string) => href === pathname || (href !== "/admin" && pathname.startsWith(href + "/"));

function StaffMenu({ actor, pathname, close }: { actor: Actor; pathname: string; close?: () => void }) {
  return <div className="flex flex-col h-full">
    <div className="flex items-center justify-between px-5 h-16 shrink-0 border-b border-gray-3">
      <span className="font-serif text-3xl text-forest">Kosvana</span>
      {close && <button onClick={close} aria-label="Close navigation" className="p-2" data-autofocus><X size={21}/></button>}
    </div>
    <nav aria-label="Staff navigation" className="flex-1 min-h-0 overflow-y-auto px-3 py-3">
      {groups.map(group => {
        const items = group.items.filter(([,href]) => canWork(actor, ...pageDuties(href)));
        if (!items.length) return null;
        return <div key={group.title} className={group.title ? "mt-4" : ""}>
          {group.title && <p className="text-xs font-semibold uppercase tracking-wider text-gray-6 px-3 mb-1">{group.title}</p>}
          {items.map(([name,href]) => <Link key={href} href={href} onClick={close} aria-current={active(pathname,href) ? "page" : undefined}
            className={"block py-2 px-3 rounded-md text-sm font-medium " + (active(pathname, href) ? "bg-forest text-white" : "text-dark hover:bg-gray-2")}>{name}</Link>)}
        </div>;
      })}
    </nav>
    <div className="px-5 py-3 border-t border-gray-3 flex justify-between items-center gap-2">
      <span className="text-sm truncate">{actor.name || actor.email}</span><button type="button" className="text-sm underline shrink-0" onClick={() => signOut({callbackUrl:"/"})}>Sign out</button>
    </div>
  </div>;
}
function MobileMenu({ children, close }: { children: ReactNode; close: () => void }) {
  const dialog = useModalDialog();
  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)");
    const changed = () => { if (desktop.matches) close(); };
    desktop.addEventListener("change", changed);
    return () => desktop.removeEventListener("change", changed);
  }, [close]);
  return <dialog id="staff-mobile-nav" ref={dialog} aria-label="Staff navigation" onCancel={close}
    onClick={event => { if (event.target === dialog.current) close(); }}
    className="fixed inset-y-0 left-0 m-0 w-72 h-[100dvh] max-h-[100dvh] max-w-[90vw] p-0 rounded-none backdrop:bg-black/40">
    {children}
  </dialog>;
}
export default function AdminLayout({ children, initialActor }: { children:ReactNode; initialActor:Actor }) {
  const pathname = usePathname() || "/admin";
  const router = useRouter();
  const { data, status } = useSession();
  const actor = status === "loading" ? initialActor : data?.user;
  const allowed = canWork(actor, ...pageDuties(pathname));
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (status === "unauthenticated") router.replace("/auth/signin?callbackUrl=" + encodeURIComponent(pathname + window.location.search));
    else if (status === "authenticated" && !allowed) router.replace(actor?.role === "STAFF" && actor.staffDuties?.length ? "/admin" : "/");
  }, [status, allowed, pathname, router, actor?.role, actor?.staffDuties?.length]);
  if (!allowed || !actor) return <p role="status">Checking staff access…</p>;
  const section = groups.flatMap(group => group.items).find(([, href]) => active(pathname, href))?.[0];
  return <div className="min-h-screen bg-gray-1 [&_.text-dark-4]:text-dark-3 [&_.text-dark-5]:text-dark-3 [&_input::placeholder]:text-dark-3 [&_textarea::placeholder]:text-dark-3">
    <aside className="fixed inset-y-0 left-0 z-40 w-60 bg-white border-r border-gray-3 hidden lg:block"><StaffMenu actor={actor} pathname={pathname}/></aside>
    {open && <MobileMenu close={() => setOpen(false)}><StaffMenu actor={actor} pathname={pathname} close={() => setOpen(false)}/></MobileMenu>}
    <div className="lg:pl-60"><header className="bg-white border-b border-gray-3 flex items-center justify-between px-4 sm:px-6 h-16">
      <div className="flex gap-3 items-center"><button aria-label="Open staff navigation" aria-expanded={open} aria-controls={open ? "staff-mobile-nav" : undefined}
        onClick={() => setOpen(true)} className="lg:hidden p-2"><Menu size={20}/></button>
        <span className="font-medium">{pathname === "/admin" ? "Staff workspace" : section || "Staff workspace"}</span></div>
      <Link href="/" className="text-sm font-medium text-forest inline-flex items-center gap-1">View store <ArrowUpRight size={15}/></Link>
    </header><main className="p-3 sm:p-6">{children}</main></div><Toaster/>
  </div>;
}
