"use client";
import React, { useState } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import AddressModal from "./AddressModal";
import Orders from "../Orders";
import { useSession, signOut } from "next-auth/react";
import { validateName, validatePasswordPolicy, passwordRequirementsText } from "@/lib/validation";
import toast from "react-hot-toast";

type ProfileErrors = { firstName?: string; lastName?: string };
type PasswordErrors = { oldPassword?: string; newPassword?: string; confirmNewPassword?: string };

const MyAccount = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [addressModal, setAddressModal] = useState(false);
  const { data: session } = useSession();

  // Profile form state
  const [profileErrors, setProfileErrors] = useState<ProfileErrors>({});
  const [profileSaving, setProfileSaving] = useState(false);

  // Password form state
  const [pwForm, setPwForm] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
  const [pwErrors, setPwErrors] = useState<PasswordErrors>({});
  const [pwSaving, setPwSaving] = useState(false);

  const openAddressModal = () => {
    setAddressModal(true);
  };

  const closeAddressModal = () => {
    setAddressModal(false);
  };

  const userName = session?.user?.name || "User";
  const userEmail = session?.user?.email || "";
  const userInitial = userName.charAt(0).toUpperCase();

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    )},
    { id: "orders", label: "Orders", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 01-8 0" />
      </svg>
    )},
    { id: "addresses", label: "Addresses", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    )},
    { id: "account-details", label: "Account Details", icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="12" cy="7" r="4" />
      </svg>
    )},
  ];

  return (
    <>
      <Breadcrumb title={"My Account"} pages={["my account"]} />

      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <div className="lg:max-w-[300px] w-full">
              <div className="bg-forest/5 rounded-2xl border border-forest/15 overflow-hidden">
                {/* User Profile */}
                <div className="p-6 border-b border-forest/10">
                  <div className="flex items-center gap-4">
                    {session?.user?.image ? (
                      <Image
                        src={session.user.image}
                        alt={userName}
                        width={48}
                        height={48}
                        className="rounded-full object-cover ring-2 ring-forest/20"
                      />
                    ) : (
                      <span className="w-12 h-12 rounded-full bg-forest text-white text-lg font-semibold flex items-center justify-center uppercase">
                        {userInitial}
                      </span>
                    )}
                    <div className="min-w-0">
                      <p className="font-medium text-sm text-dark truncate">{userName}</p>
                      <p className="text-xs text-gray-400 truncate">{userEmail}</p>
                    </div>
                  </div>
                </div>

                {/* Nav Tabs */}
                <div className="p-3">
                  <div className="flex flex-row lg:flex-col gap-1 overflow-x-auto lg:overflow-visible">
                    {tabs.map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-medium transition-colors whitespace-nowrap ${
                          activeTab === tab.id
                            ? "text-forest bg-white shadow-sm"
                            : "text-gray-500 hover:text-dark hover:bg-white/60"
                        }`}
                      >
                        {tab.icon}
                        {tab.label}
                      </button>
                    ))}

                    {/* Sign Out */}
                    <button
                      onClick={() => signOut({ callbackUrl: "/" })}
                      className="flex items-center gap-3 rounded-xl py-3 px-4 text-sm font-medium text-gray-400 hover:text-red-600 hover:bg-white/60 transition-colors whitespace-nowrap mt-1 lg:mt-2 lg:border-t lg:border-forest/10 lg:pt-4 lg:rounded-t-none"
                    >
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 min-w-0">

              {/* Dashboard Tab */}
              {activeTab === "dashboard" && (
                <div className="bg-forest/5 rounded-2xl border border-forest/15 p-6 sm:p-8">
                  <h2 className="font-medium text-xl text-dark mb-2">
                    Welcome back, {userName.split(" ")[0]}!
                  </h2>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    From your account dashboard you can view your recent orders,
                    manage your shipping and billing addresses, and edit your
                    password and account details.
                  </p>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6">
                    <button
                      onClick={() => setActiveTab("orders")}
                      className="bg-white rounded-xl p-4 border border-forest/10 hover:border-forest/30 transition-colors text-left"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5c8e61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                        <line x1="3" y1="6" x2="21" y2="6" />
                        <path d="M16 10a4 4 0 01-8 0" />
                      </svg>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Orders</p>
                      <p className="text-sm text-dark mt-0.5">View all orders</p>
                    </button>
                    <button
                      onClick={() => setActiveTab("addresses")}
                      className="bg-white rounded-xl p-4 border border-forest/10 hover:border-forest/30 transition-colors text-left"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5c8e61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Addresses</p>
                      <p className="text-sm text-dark mt-0.5">Manage addresses</p>
                    </button>
                    <button
                      onClick={() => setActiveTab("account-details")}
                      className="bg-white rounded-xl p-4 border border-forest/10 hover:border-forest/30 transition-colors text-left"
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#5c8e61" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-2">
                        <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <p className="text-xs font-medium uppercase tracking-wider text-gray-400">Account</p>
                      <p className="text-sm text-dark mt-0.5">Edit details</p>
                    </button>
                  </div>
                </div>
              )}

              {/* Orders Tab */}
              {activeTab === "orders" && (
                <div className="bg-forest/5 rounded-2xl border border-forest/15 overflow-hidden">
                  <Orders />
                </div>
              )}

              {/* Addresses Tab */}
              {activeTab === "addresses" && (
                <div className="grid sm:grid-cols-2 gap-6">
                  {/* Shipping Address */}
                  <div className="bg-forest/5 rounded-2xl border border-forest/15 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-forest/10">
                      <h3 className="font-medium text-base text-dark">Shipping Address</h3>
                      <button
                        className="text-gray-400 hover:text-forest transition-colors"
                        onClick={openAddressModal}
                        aria-label="Edit shipping address"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {userName}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        {userEmail}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        +91-7618362662
                      </p>
                      <p className="flex gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0 mt-0.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        NH 507, Herbertpur, Dehradun, 248142
                      </p>
                    </div>
                  </div>

                  {/* Billing Address */}
                  <div className="bg-forest/5 rounded-2xl border border-forest/15 overflow-hidden">
                    <div className="flex items-center justify-between p-5 border-b border-forest/10">
                      <h3 className="font-medium text-base text-dark">Billing Address</h3>
                      <button
                        className="text-gray-400 hover:text-forest transition-colors"
                        onClick={openAddressModal}
                        aria-label="Edit billing address"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-5 space-y-3">
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                          <circle cx="12" cy="7" r="4" />
                        </svg>
                        {userName}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                          <polyline points="22,6 12,13 2,6" />
                        </svg>
                        concierge@kosvana.com
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0">
                          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                        </svg>
                        +91-7618362662
                      </p>
                      <p className="flex gap-2.5 text-sm text-gray-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400 flex-shrink-0 mt-0.5">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        NH 507, Herbertpur, Dehradun, 248142
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Account Details Tab */}
              {activeTab === "account-details" && (
                <div className="space-y-8">
                  <div className="bg-forest/5 rounded-2xl border border-forest/15 p-6 sm:p-8">
                    <h3 className="font-medium text-lg text-dark mb-6">Personal Information</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const form = e.currentTarget;
                      const firstName = (form.elements.namedItem('firstName') as HTMLInputElement).value;
                      const lastName = (form.elements.namedItem('lastName') as HTMLInputElement).value;
                      const newErrors: ProfileErrors = {};
                      const fnErr = validateName(firstName, 'First name');
                      if (fnErr) newErrors.firstName = fnErr;
                      const lnErr = validateName(lastName, 'Last name');
                      if (lnErr) newErrors.lastName = lnErr;
                      if (Object.keys(newErrors).length > 0) { setProfileErrors(newErrors); return; }
                      setProfileErrors({});
                      setProfileSaving(true);
                      toast.success('Profile updated successfully');
                      setProfileSaving(false);
                    }}>
                      <div className="grid sm:grid-cols-2 gap-5 mb-5">
                        <div>
                          <label htmlFor="firstName" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                            First Name
                          </label>
                          <input
                            type="text"
                            name="firstName"
                            id="firstName"
                            placeholder="First name"
                            defaultValue={userName.split(" ")[0]}
                            onChange={() => profileErrors.firstName && setProfileErrors(prev => ({ ...prev, firstName: undefined }))}
                            className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${profileErrors.firstName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                          />
                          {profileErrors.firstName && <p className="text-xs text-red-500 mt-1.5">{profileErrors.firstName}</p>}
                        </div>
                        <div>
                          <label htmlFor="lastName" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                            Last Name
                          </label>
                          <input
                            type="text"
                            name="lastName"
                            id="lastName"
                            placeholder="Last name"
                            defaultValue={userName.split(" ").slice(1).join(" ")}
                            onChange={() => profileErrors.lastName && setProfileErrors(prev => ({ ...prev, lastName: undefined }))}
                            className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${profileErrors.lastName ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                          />
                          {profileErrors.lastName && <p className="text-xs text-red-500 mt-1.5">{profileErrors.lastName}</p>}
                        </div>
                      </div>
                      <div className="mb-6">
                        <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                          Email
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={userEmail}
                          disabled
                          className="w-full bg-gray-50 border border-forest/10 rounded-lg py-3 px-4 text-sm text-gray-400 cursor-not-allowed"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={profileSaving}
                        className="bg-forest text-white py-3 px-8 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
                      >
                        {profileSaving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </form>
                  </div>

                  <div className="bg-forest/5 rounded-2xl border border-forest/15 p-6 sm:p-8">
                    <h3 className="font-medium text-lg text-dark mb-6">Change Password</h3>
                    <form onSubmit={(e) => {
                      e.preventDefault();
                      const newErrors: PasswordErrors = {};
                      if (!pwForm.oldPassword) newErrors.oldPassword = 'Current password is required';
                      const pwResult = validatePasswordPolicy(pwForm.newPassword);
                      if (!pwResult.valid) newErrors.newPassword = pwResult.error;
                      if (pwForm.newPassword !== pwForm.confirmNewPassword) newErrors.confirmNewPassword = "Passwords don't match";
                      if (Object.keys(newErrors).length > 0) { setPwErrors(newErrors); return; }
                      setPwErrors({});
                      setPwSaving(true);
                      toast.success('Password changed successfully');
                      setPwForm({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
                      setPwSaving(false);
                    }}>
                      <div className="space-y-5 mb-6">
                        <div>
                          <label htmlFor="oldPassword" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                            Current Password
                          </label>
                          <input
                            type="password"
                            name="oldPassword"
                            id="oldPassword"
                            autoComplete="current-password"
                            placeholder="Enter current password"
                            value={pwForm.oldPassword}
                            onChange={(e) => { setPwForm(prev => ({ ...prev, oldPassword: e.target.value })); if (pwErrors.oldPassword) setPwErrors(prev => ({ ...prev, oldPassword: undefined })); }}
                            className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${pwErrors.oldPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                          />
                          {pwErrors.oldPassword && <p className="text-xs text-red-500 mt-1.5">{pwErrors.oldPassword}</p>}
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                            New Password
                          </label>
                          <input
                            type="password"
                            name="newPassword"
                            id="newPassword"
                            autoComplete="new-password"
                            placeholder="Enter new password"
                            value={pwForm.newPassword}
                            onChange={(e) => { setPwForm(prev => ({ ...prev, newPassword: e.target.value })); if (pwErrors.newPassword) setPwErrors(prev => ({ ...prev, newPassword: undefined })); }}
                            className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${pwErrors.newPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                          />
                          {pwErrors.newPassword && <p className="text-xs text-red-500 mt-1.5">{pwErrors.newPassword}</p>}
                        </div>
                        <div>
                          <label htmlFor="confirmNewPassword" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                            Confirm New Password
                          </label>
                          <input
                            type="password"
                            name="confirmNewPassword"
                            id="confirmNewPassword"
                            autoComplete="new-password"
                            placeholder="Confirm new password"
                            value={pwForm.confirmNewPassword}
                            onChange={(e) => { setPwForm(prev => ({ ...prev, confirmNewPassword: e.target.value })); if (pwErrors.confirmNewPassword) setPwErrors(prev => ({ ...prev, confirmNewPassword: undefined })); }}
                            className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${pwErrors.confirmNewPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                          />
                          {pwErrors.confirmNewPassword && <p className="text-xs text-red-500 mt-1.5">{pwErrors.confirmNewPassword}</p>}
                        </div>
                      </div>
                      <p className="text-xs text-gray-400 mb-4">{passwordRequirementsText}</p>
                      <button
                        type="submit"
                        disabled={pwSaving}
                        className="bg-forest text-white py-3 px-8 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
                      >
                        {pwSaving ? 'Changing...' : 'Change Password'}
                      </button>
                    </form>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <AddressModal isOpen={addressModal} closeModal={closeAddressModal} />
    </>
  );
};

export default MyAccount;
