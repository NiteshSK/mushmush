"use client";
import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import CustomSelect from "./CustomSelect";
import { menuData } from "./menuData";
import Dropdown from "./Dropdown";
import { useAppSelector } from "@/redux/store";
import { useSelector } from "react-redux";
import { selectTotalPrice } from "@/redux/features/cart-slice";
import { useCartModalContext } from "@/app/context/CartSidebarModalContext";
import { useWishlist } from "@/app/context/WishlistContext";
import Image from "next/image";

const Header = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [navigationOpen, setNavigationOpen] = useState(false);
  const [stickyMenu, setStickyMenu] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("0");
  const { openCartModal } = useCartModalContext();
  const { data: session, status, update } = useSession();
  const router = useRouter();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const product = useAppSelector((state) => state.cartReducer.items);
  const totalPrice = useSelector(selectTotalPrice);
  const { items: wishlistItems } = useWishlist();

  const handleOpenCartModal = () => {
    openCartModal();
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const searchParams = new URLSearchParams();
      searchParams.set('search', searchQuery.trim());
      if (selectedCategory !== "0") {
        searchParams.set('category', selectedCategory);
      }
      router.push(`/search?${searchParams.toString()}`);
    }
  };

  // Sticky menu
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

  // Force session refresh on mount and when status changes
  useEffect(() => {
    if (status === "unauthenticated") {
      update();
    }
  }, [status, update]);

  // Close user menu when clicking outside
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

  const options = [
    { label: "All Mushrooms", value: "0" },
    { label: "Edible", value: "1" },
    { label: "Medicinal", value: "2" },
    { label: "Tinctures", value: "3" },
  ];

  return (
    <header
      className={`fixed left-0 top-10 w-full z-9999 bg-white transition-all ease-in-out duration-300 transform ${stickyMenu && "shadow"
        }`}
    >
      <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
        <div
          className={`flex items-center justify-between ease-out duration-200 ${stickyMenu ? "py-4" : "py-6"
            }`}
        >
          {/* Logo */}
          <Link className="flex-shrink-0" href="/">
            <Image
              src="/images/logo/logo.png"
              alt="Logo"
              width={128}
              height={7}
              className="object-contain"
            />
          </Link>

          {/* Desktop Search Bar */}
          <div className="hidden lg:block flex-1 max-w-[600px] mx-8">
            <form onSubmit={handleSearch}>
              <div className="flex items-center w-full bg-white border border-gray-300 rounded-full px-4 py-2 hover:border-gray-400 transition-colors">
                <button
                  type="submit"
                  id="search-btn"
                  aria-label="Search"
                  className="flex items-center justify-center text-gray-500 hover:text-dark transition-colors"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </button>
                <input
                  onChange={(e) => setSearchQuery(e.target.value)}
                  value={searchQuery}
                  type="search"
                  name="search"
                  id="search"
                  placeholder="Search for..."
                  autoComplete="off"
                  className="w-full bg-transparent pl-3 text-sm text-dark placeholder-gray-400 outline-none"
                />
              </div>
            </form>
          </div>

          {/* Right side icons */}
          <div className="flex items-center gap-7.5">
            <div className="flex items-center gap-2.5">
              {/* ── Account pill ── */}
              {status === "loading" ? (
                <div className="animate-pulse bg-gray-200 rounded-full h-9 w-24"></div>
              ) : session ? (
                <div className="relative" ref={userMenuRef}>
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2.5 border border-gray-300 rounded-full px-6 py-3 text-base font-medium text-dark hover:border-gray-400 transition-colors"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                    {session.user?.name?.split(' ')[0] || 'Account'}
                  </button>
                  {/* User Dropdown Menu */}
                  {userMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg border border-gray-200 py-2 z-50">
                      <Link href="/account" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>My Account</Link>
                      <Link href="/orders" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>My Orders</Link>
                      <Link href="/wishlist" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={() => setUserMenuOpen(false)}>Wishlist</Link>
                      <hr className="my-2" />
                      <button onClick={() => { setUserMenuOpen(false); signOut(); }} className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100">Sign Out</button>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/signin" className="flex items-center gap-2.5 border border-gray-300 rounded-full px-6 py-3 text-base font-medium text-dark hover:border-gray-400 transition-colors">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Account
                </Link>
              )}

              {/* ── Cart pill ── */}
              <button
                onClick={handleOpenCartModal}
                className="flex items-center gap-2.5 bg-[#1a1a1a] text-white rounded-full px-6 py-3 text-base font-medium hover:bg-[#333] transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1" />
                  <circle cx="20" cy="21" r="1" />
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
                </svg>
                ₹{totalPrice} ({product.length})
              </button>
            </div>

            {/* Hamburger Toggle BTN */}
            <button
              id="Toggle"
              aria-label="Toggler"
              className="xl:hidden block"
              onClick={() => setNavigationOpen(!navigationOpen)}
            >
              <span className="block relative cursor-pointer w-5.5 h-5.5">
                <span className="du-block absolute right-0 w-full h-full">
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-[0] ${!navigationOpen && "!w-full delay-300"
                      }`}
                  ></span>
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-150 ${!navigationOpen && "!w-full delay-400"
                      }`}
                  ></span>
                  <span
                    className={`block relative top-0 left-0 bg-dark rounded-sm w-0 h-0.5 my-1 ease-in-out duration-200 delay-200 ${!navigationOpen && "!w-full delay-500"
                      }`}
                  ></span>
                </span>
                <span className="block absolute right-0 w-full h-full rotate-45">
                  <span
                    className={`block bg-dark rounded-sm ease-in-out duration-200 delay-300 absolute left-2.5 top-0 w-0.5 h-full ${!navigationOpen && "!h-0 delay-[0] "
                      }`}
                  ></span>
                  <span
                    className={`block bg-dark rounded-sm ease-in-out duration-200 delay-400 absolute left-0 top-2.5 w-full h-0.5 ${!navigationOpen && "!h-0 dealy-200"
                      }`}
                  ></span>
                </span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-3">
        <div className="max-w-[1170px] mx-auto px-4 sm:px-7.5 xl:px-0">
          <div className="flex items-center justify-between">
            {/* Main Nav */}
            <div
              className={`w-[288px] absolute right-4 top-full xl:static xl:w-auto h-0 xl:h-auto invisible xl:visible xl:flex items-center justify-between z-50 ${navigationOpen &&
                `!visible bg-white shadow-lg border border-gray-3 !h-auto max-h-[400px] overflow-y-scroll rounded-md p-5`
                }`}
            >
              <nav>
                <ul className="flex xl:items-center flex-col xl:flex-row gap-5 xl:gap-6">
                  {menuData.map((menuItem, i) =>
                    menuItem.submenu ? (
                      <Dropdown
                        key={i}
                        menuItem={menuItem}
                        stickyMenu={stickyMenu}
                        setNavigationOpen={setNavigationOpen}
                      />
                    ) : (
                      <li
                        key={i}
                        className="group relative"
                      >
                        <Link
                          href={menuItem.path}
                          className={`group/link relative hover:text-[#4B6BFB] text-custom-sm font-medium text-[#333] flex transition-colors duration-200 ${stickyMenu ? "xl:py-4" : "xl:py-5"
                            }`}
                          onClick={() => setNavigationOpen(false)}
                        >
                          <span className="absolute top-0 left-0 w-full h-[3px] bg-[#4B6BFB] scale-x-0 group-hover/link:scale-x-100 transition-transform duration-300 origin-center"></span>
                          {menuItem.title}
                        </Link>
                      </li>
                    )
                  )}
                </ul>
              </nav>
            </div>

            {/* Nav Right */}
            <div className="hidden xl:block">
              <ul className="flex items-center gap-5.5">
                <li className="py-4">
                  <Link
                    href="/recently-viewed"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-[#333] hover:text-[#111] transition-colors duration-200"
                  >
                    <svg
                      className="fill-current"
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        d="M2.45313 7.55556H1.70313V7.55556L2.45313 7.55556ZM2.45313 8.66667L1.92488 9.19908C2.21729 9.4892 2.68896 9.4892 2.98137 9.19908L2.45313 8.66667ZM4.10124 8.08797C4.39528 7.79623 4.39715 7.32135 4.10541 7.02731C3.81367 6.73327 3.3388 6.73141 3.04476 7.02315L4.10124 8.08797ZM1.86149 7.02315C1.56745 6.73141 1.09258 6.73327 0.800843 7.02731C0.509102 7.32135 0.510968 7.79623 0.805009 8.08797L1.86149 7.02315ZM12.1973 5.05946C12.4143 5.41232 12.8762 5.52252 13.229 5.30558C13.5819 5.08865 13.6921 4.62674 13.4752 4.27388L12.1973 5.05946ZM8.0525 1.25C4.5514 1.25 1.70313 4.06755 1.70313 7.55556H3.20313C3.20313 4.90706 5.3687 2.75 8.0525 2.75V1.25ZM1.70313 7.55556L1.70313 8.66667L3.20313 8.66667L3.20313 7.55556L1.70313 7.55556ZM2.98137 9.19908L4.10124 8.08797L3.04476 7.02315L1.92488 8.13426L2.98137 9.19908ZM2.98137 8.13426L1.86149 7.02315L0.805009 8.08797L1.92488 9.19908L2.98137 8.13426ZM13.4752 4.27388C12.3603 2.46049 10.3479 1.25 8.0525 1.25V2.75C9.80904 2.75 11.346 3.67466 12.1973 5.05946L13.4752 4.27388Z"
                        fill=""
                      />
                      <path
                        d="M13.5427 7.33337L14.0699 6.79996C13.7777 6.51118 13.3076 6.51118 13.0155 6.79996L13.5427 7.33337ZM11.8913 7.91107C11.5967 8.20225 11.5939 8.67711 11.8851 8.97171C12.1763 9.26631 12.6512 9.26908 12.9458 8.9779L11.8913 7.91107ZM14.1396 8.9779C14.4342 9.26908 14.9091 9.26631 15.2003 8.97171C15.4914 8.67711 15.4887 8.20225 15.1941 7.91107L14.1396 8.9779ZM3.75812 10.9395C3.54059 10.587 3.07849 10.4776 2.72599 10.6951C2.3735 10.9127 2.26409 11.3748 2.48163 11.7273L3.75812 10.9395ZM7.9219 14.75C11.4321 14.75 14.2927 11.9352 14.2927 8.44449H12.7927C12.7927 11.0903 10.6202 13.25 7.9219 13.25V14.75ZM14.2927 8.44449V7.33337H12.7927V8.44449H14.2927ZM13.0155 6.79996L11.8913 7.91107L12.9458 8.9779L14.0699 7.86679L13.0155 6.79996ZM13.0155 7.86679L14.1396 8.9779L15.1941 7.91107L14.0699 6.79996L13.0155 7.86679ZM2.48163 11.7273C3.60082 13.5408 5.62007 14.75 7.9219 14.75V13.25C6.15627 13.25 4.61261 12.3241 3.75812 10.9395L2.48163 11.7273Z"
                        fill=""
                      />
                    </svg>
                    Recently Viewed
                  </Link>
                </li>
                <li className="py-4">
                  <Link
                    href="/wishlist"
                    className="flex items-center gap-1.5 font-medium text-custom-sm text-[#333] hover:text-[#111] transition-colors duration-200 relative"
                  >
                    <span className="relative">
                      <svg
                        className="fill-current"
                        width="16"
                        height="16"
                        viewBox="0 0 16 16"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M5.97441 12.6073L6.43872 12.0183L5.97441 12.6073ZM7.99992 3.66709L7.45955 4.18719C7.60094 4.33408 7.79604 4.41709 7.99992 4.41709C8.2038 4.41709 8.3989 4.33408 8.54028 4.18719L7.99992 3.66709ZM10.0254 12.6073L10.4897 13.1962L10.0254 12.6073ZM6.43872 12.0183C5.41345 11.21 4.33627 10.4524 3.47904 9.48717C2.64752 8.55085 2.08325 7.47831 2.08325 6.0914H0.583252C0.583252 7.94644 1.3588 9.35867 2.35747 10.4832C3.33043 11.5788 4.57383 12.4582 5.51009 13.1962L6.43872 12.0183ZM2.08325 6.0914C2.08325 4.75102 2.84027 3.63995 3.85342 3.17683C4.81929 2.73533 6.15155 2.82823 7.45955 4.18719L8.54028 3.14699C6.84839 1.38917 4.84732 1.07324 3.22983 1.8126C1.65962 2.53035 0.583252 4.18982 0.583252 6.0914H2.08325ZM5.51009 13.1962C5.84928 13.4636 6.22932 13.7618 6.61834 13.9891C7.00711 14.2163 7.47619 14.4167 7.99992 14.4167V12.9167C7.85698 12.9167 7.65939 12.8601 7.37512 12.694C7.0911 12.5281 6.79171 12.2965 6.43872 12.0183L5.51009 13.1962ZM10.4897 13.1962C11.426 12.4582 12.6694 11.5788 13.6424 10.4832C14.641 9.35867 15.4166 7.94644 15.4166 6.0914H13.9166C13.9166 7.47831 13.3523 8.55085 12.5208 9.48717C11.6636 10.4524 10.5864 11.21 9.56112 12.0183L10.4897 13.1962ZM15.4166 6.0914C15.4166 4.18982 14.3402 2.53035 12.77 1.8126C11.1525 1.07324 9.15145 1.38917 7.45955 3.14699L8.54028 4.18719C9.84828 2.82823 11.1805 2.73533 12.1464 3.17683C13.1596 3.63995 13.9166 4.75102 13.9166 6.0914H15.4166ZM9.56112 12.0183C9.20813 12.2965 8.90874 12.5281 8.62471 12.694C8.34044 12.8601 8.14285 12.9167 7.99992 12.9167V14.4167C8.52365 14.4167 8.99273 14.2163 9.3815 13.9891C9.77052 13.7618 10.1506 13.4636 10.4897 13.1962L9.56112 12.0183Z"
                          fill=""
                        />
                      </svg>
                      {wishlistItems.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-red text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-medium animate-pulse">
                          {wishlistItems.length}
                        </span>
                      )}
                    </span>
                    Wishlist
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header >
  );
};

export default Header;