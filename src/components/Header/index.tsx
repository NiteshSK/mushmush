"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector, AppDispatch } from "@/redux/store";
import { useSelector, useDispatch } from "react-redux";
import { selectTotalPrice, removeAllItemsFromCart } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useWishlist } from "@/app/context/WishlistContext";
import Image from "next/image";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { openCartModal } = useCartModalContext();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch<AppDispatch>();
  const prevUserRef = useRef<string | null | undefined>(undefined);

  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const { items: wishlistItems } = useWishlist();
  const pathUrl = usePathname();

  // Clear cart when user changes (sign out → sign in as different user)
  useEffect(() => {
    const currentUser = session?.user?.email ?? null;
    if (prevUserRef.current !== undefined && prevUserRef.current !== currentUser) {
      dispatch(removeAllItemsFromCart());
    }
    prevUserRef.current = currentUser;
  }, [session?.user?.email, dispatch]);

  const handleSignOut = () => {
    dispatch(removeAllItemsFromCart());
    signOut({ callbackUrl: '/' });
  };

  const handleOpenCartModal = () => {
    openCartModal();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  const handleStickyMenu = () => {
    if (window.scrollY >= 80) {
      setStickyMenu(true);
    } else {
      setStickyMenu(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyMenu);
    return () => {
      window.removeEventListener("scroll", handleStickyMenu);
    };
  }, []);

  useEffect(() => {
    if (status === "unauthenticated") {
      update();
    }
  }, [status, update]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    if (userMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [userMenuOpen]);

  return (
    <header
      className={`fixed left-0 top-10 w-full z-9999 bg-white transition-all ease-in-out duration-300 ${stickyMenu ? "shadow-sm" : ""}`}
    >
      {/* Main header bar */}
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
        <div className={`flex items-center justify-between transition-all duration-200 ${stickyMenu ? "py-3" : "py-5"}`}>
          {/* Logo */}
          <Link className="flex-shrink-0" href="/">
            <Image
              src="/images/logo/logo.png"
              alt="Kosvana"
              width={120}
              height={7}
              className="object-contain"
            />
          </Link>

          {/* Center Nav — Desktop */}
          <nav className="hidden xl:block">
            <ul className="flex items-center gap-8">
              {menuData.map((menuItem, i) =>
                menuItem.submenu ? (
                  <Dropdown
                    key={i}
                    menuItem={menuItem}
                    stickyMenu={stickyMenu}
                    setNavigationOpen={setNavigationOpen}
                  />
                ) : (
                  <li key={i} className="group/nav">
                    <Link
                      href={menuItem.path}
                      className={`relative block text-sm font-medium text-dark hover:text-forest transition-colors duration-200 tracking-wide ${stickyMenu ? "py-4" : "py-5"} ${pathUrl === menuItem.path ? "!text-forest" : ""}`}
                    >
                      <span className={`absolute top-0 left-0 w-full h-[3px] rounded-b-[2px] bg-forest transition-transform duration-300 origin-center ${pathUrl === menuItem.path ? "scale-x-100" : "scale-x-0 group-hover/nav:scale-x-100"}`}></span>
                      {menuItem.title}
                    </Link>
                  </li>
                )
              )}
            </ul>
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-3">
            {/* Search — icon only on desktop, expands */}
            <form onSubmit={handleSearch} className="hidden lg:flex items-center">
              <div className="flex items-center border border-gray-200 rounded-full px-3 py-2 hover:border-gray-400 transition-colors">
                <button type="submit" aria-label="Search" className="text-gray-400 hover:text-dark transition-colors">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  type="search"
                  placeholder="Search..."
                  autoComplete="off"
                  className="w-32 focus:w-48 bg-transparent pl-2 text-sm text-dark placeholder-gray-400 outline-none transition-all duration-300"
                />
              </div>
            </form>

            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              aria-label="Wishlist"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistItems.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-forest text-white text-[9px] rounded-full w-4 h-4 flex items-center justify-center font-medium">
                  {wishlistItems.length}
                </span>
              )}
            </Link>

            {/* Account */}
            {status === "loading" ? (
              <div className="animate-pulse bg-gray-100 rounded-full h-10 w-10"></div>
            ) : session ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center justify-center w-10 h-10 rounded-full transition-colors"
                  aria-label="Account menu"
                >
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover ring-2 ring-forest/20"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-forest text-white text-xs font-semibold flex items-center justify-center uppercase">
                      {(session.user?.name || "U").charAt(0)}
                    </span>
                  )}
                </button>
                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-xs text-gray-500 uppercase tracking-wider">Account</p>
                      <p className="text-sm font-medium text-dark truncate">{session.user?.name || 'User'}</p>
                    </div>
                    <Link href="/account" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark transition-colors" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                    <Link href="/orders" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark transition-colors" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                    <Link href="/wishlist" className="block px-4 py-2.5 text-sm text-gray-600 hover:bg-gray-50 hover:text-dark transition-colors" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                    {session.user?.role === 'ADMIN' && (
                      <>
                        <hr className="my-1 border-gray-100" />
                        <Link href="/admin" className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-forest hover:bg-forest/5 transition-colors" onClick={() => setUserMenuOpen(false)}>
                          <span className="w-2 h-2 rounded-full bg-forest"></span>
                          Admin Dashboard
                        </Link>
                      </>
                    )}
                    <hr className="my-1 border-gray-100" />
                    <button onClick={() => { setUserMenuOpen(false); handleSignOut(); }} className="block w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">Sign Out</button>
                  </div>
                )}
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
                aria-label="Sign in"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              </Link>
            )}

            {/* Cart pill */}
            <button
              onClick={handleOpenCartModal}
              className="flex items-center gap-1.5 sm:gap-2 bg-forest text-white rounded-full px-3 sm:px-5 py-2.5 text-xs sm:text-sm font-medium hover:bg-dark transition-colors duration-300"
            >
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <span className="hidden sm:inline">&#8377;{totalPrice}</span>
              <span className="sm:hidden">{product.length}</span>
              <span className="hidden sm:inline">({product.length})</span>
            </button>

            {/* Mobile hamburger */}
            <button
              aria-label="Menu"
              className="xl:hidden flex items-center justify-center w-10 h-10 rounded-full hover:bg-gray-100 transition-colors"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              {navigationOpen ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Nav Drawer */}
      {navigationOpen && (
        <div className="xl:hidden border-t border-gray-100 bg-white">
          <div className="max-w-[1200px] mx-auto px-4 sm:px-6 py-6">
            {/* Mobile search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex items-center border border-gray-200 rounded-full px-4 py-2.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  type="search"
                  placeholder="Search products..."
                  autoComplete="off"
                  className="w-full bg-transparent pl-3 text-sm text-dark placeholder-gray-400 outline-none"
                />
              </div>
            </form>

            <nav>
              <ul className="flex flex-col gap-1">
                {menuData.map((menuItem, i) =>
                  menuItem.submenu ? (
                    <Dropdown
                      key={i}
                      menuItem={menuItem}
                      stickyMenu={stickyMenu}
                      setNavigationOpen={setNavigationOpen}
                    />
                  ) : (
                    <li key={i}>
                      <Link
                        href={menuItem.path}
                        className="block py-3 text-sm font-medium text-dark hover:text-forest transition-colors border-b border-gray-100"
                        onClick={() => setNavigationOpen(false)}
                      >
                        {menuItem.title}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* Mobile account link */}
            {session ? (
              <div className="mt-6 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-3 mb-4">
                  {session.user?.image ? (
                    <Image
                      src={session.user.image}
                      alt={session.user.name || "User"}
                      width={36}
                      height={36}
                      className="rounded-full object-cover ring-2 ring-forest/20"
                    />
                  ) : (
                    <span className="w-9 h-9 rounded-full bg-forest text-white text-xs font-semibold flex items-center justify-center uppercase">
                      {(session.user?.name || "U").charAt(0)}
                    </span>
                  )}
                  <div>
                    <p className="text-sm font-medium text-dark">{session.user?.name || "User"}</p>
                    <p className="text-xs text-gray-400 truncate max-w-[180px]">{session.user?.email}</p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {session.user?.role === 'ADMIN' && (
                    <Link
                      href="/admin"
                      className="w-full flex items-center justify-center gap-2 bg-forest text-white rounded-full py-2.5 text-sm font-medium hover:bg-dark transition-colors"
                      onClick={() => setNavigationOpen(false)}
                    >
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                      Admin Dashboard
                    </Link>
                  )}
                  <div className="flex gap-2">
                    <Link
                      href="/account"
                      className="flex-1 text-center bg-gray-100 text-dark rounded-full py-2.5 text-sm font-medium hover:bg-gray-200 transition-colors"
                      onClick={() => setNavigationOpen(false)}
                    >
                      My Account
                    </Link>
                    <button
                      onClick={() => { setNavigationOpen(false); handleSignOut(); }}
                      className="flex-1 text-center border border-gray-200 text-gray-500 rounded-full py-2.5 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <Link
                href="/auth/signin"
                className="mt-6 w-full flex justify-center items-center gap-2 bg-dark text-white rounded-full py-3 text-sm font-medium"
                onClick={() => setNavigationOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
