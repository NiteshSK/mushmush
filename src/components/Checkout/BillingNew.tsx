"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AddressFormModal from "./AddressFormModal";
import Link from "next/link";
import { INDIAN_STATES } from "@/lib/constants";

interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
}

interface BillingNewProps {
  onAddressChange?: (address: Address | null) => void;
}

const BillingNew: React.FC<BillingNewProps> = ({ onAddressChange }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    } else {
      setLoading(false);
      setUseNewAddress(true);
    }
  }, [session]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        const userAddresses = data.addresses || [];
        setAddresses(userAddresses);
        
        // Auto-select default address
        if (userAddresses.length > 0) {
          const defaultAddr = userAddresses.find((a: Address) => a.isDefault) || userAddresses[0];
          setSelectedAddressId(defaultAddr.id);
          onAddressChange?.(defaultAddr);
        } else {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setUseNewAddress(true);
      setSelectedAddressId("");
      onAddressChange?.(null);
    } else {
      setUseNewAddress(false);
      setSelectedAddressId(addressId);
      const selected = addresses.find(a => a.id === addressId);
      onAddressChange?.(selected || null);
    }
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) return "Phone number is required";
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit Indian mobile number";
    return "";
  };

  const validateZip = (zip: string) => {
    const zipRegex = /^\d{6}$/;
    if (!zip) return "PIN code is required";
    if (!zipRegex.test(zip)) return "PIN code must be exactly 6 digits";
    return "";
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email is required";
    if (!emailRegex.test(email)) return "Please enter a valid email address";
    return "";
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 10);
    e.target.value = value;
    const error = validatePhone(value);
    setErrors(prev => ({ ...prev, phone: error }));
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    e.target.value = value;
    const error = validateZip(value);
    setErrors(prev => ({ ...prev, zip: error }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateEmail(value);
    setErrors(prev => ({ ...prev, email: error }));
  };

  if (loading) {
    return (
      <div className="mt-9">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Billing Details
        </h2>
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-20 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="mt-9">
        <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
          Billing Details
        </h2>
        <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
          
          {/* Contact Information */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <h3 className="font-medium text-lg mb-4">Contact Information</h3>
            
            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8 mb-5">
              <div className="w-full">
                <label htmlFor="firstName" className="block mb-2.5">
                  First Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  id="firstName"
                  required
                  placeholder="Your first name"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
              <div className="w-full">
                <label htmlFor="lastName" className="block mb-2.5">
                  Last Name <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  id="lastName"
                  required
                  placeholder="Your last name"
                  className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                />
              </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
              <div className="w-full">
                <label htmlFor="email" className="block mb-2.5">
                  Email Address <span className="text-red">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  placeholder="your.email@example.com"
                  onChange={handleEmailChange}
                  className={`rounded-md border ${errors.email ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>
              <div className="w-full">
                <label htmlFor="phone" className="block mb-2.5">
                  Phone <span className="text-red">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  id="phone"
                  required
                  placeholder="10-digit mobile number"
                  maxLength={10}
                  pattern="[6-9]\d{9}"
                  onChange={handlePhoneChange}
                  className={`rounded-md border ${errors.phone ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                )}
              </div>
            </div>
          </div>

          {/* Billing Address */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-medium text-lg">Billing Address</h3>
              {!session && (
                <Link
                  href="/auth/signin"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  Sign in to save addresses
                </Link>
              )}
            </div>

            {/* Saved Addresses */}
            {session && addresses.length > 0 && (
              <div className="space-y-3 mb-4">
                {addresses.map((address) => (
                  <label
                    key={address.id}
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      selectedAddressId === address.id
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="billingAddress"
                        value={address.id}
                        checked={selectedAddressId === address.id}
                        onChange={() => handleAddressSelect(address.id)}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3 flex-1">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{address.street}</span>
                          {address.isDefault && (
                            <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              Default
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {address.city}, {address.state} - {address.zip}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}

                {/* Use New Address Option */}
                <label
                  className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    useNewAddress
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-start">
                    <input
                      type="radio"
                      name="billingAddress"
                      value="new"
                      checked={useNewAddress}
                      onChange={() => handleAddressSelect("new")}
                      className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                    />
                    <div className="ml-3">
                      <span className="font-medium text-gray-900">Use a different address</span>
                      <p className="text-sm text-gray-600 mt-1">
                        Enter a new billing address
                      </p>
                    </div>
                  </div>
                </label>

                {addresses.length < 5 && (
                  <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="w-full p-3 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-blue-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Add New Address
                  </button>
                )}
              </div>
            )}

            {/* New Address Form (shown when no saved addresses or "use new" selected) */}
            {(useNewAddress || (!session) || (session && addresses.length === 0)) && (
              <div className="space-y-5">
                <div>
                  <label htmlFor="billingAddress" className="block mb-2.5">
                    Street Address <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingAddress"
                    id="billingAddress"
                    required
                    placeholder="House number and street name"
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  />
                </div>

                <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                  <div className="w-full">
                    <label htmlFor="billingCity" className="block mb-2.5">
                      City <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="billingCity"
                      id="billingCity"
                      required
                      placeholder="Enter city name"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                  <div className="w-full">
                    <label htmlFor="billingState" className="block mb-2.5">
                      State <span className="text-red">*</span>
                    </label>
                    <select
                      name="billingState"
                      id="billingState"
                      required
                      className="w-full bg-gray-1 rounded-md border border-gray-3 text-dark py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    >
                      <option value="">Select State</option>
                      {INDIAN_STATES.map((state) => (
                        <option key={state} value={state}>
                          {state}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="w-full lg:w-1/2 lg:pr-4">
                  <label htmlFor="billingZip" className="block mb-2.5">
                    PIN Code <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    name="billingZip"
                    id="billingZip"
                    required
                    placeholder="6-digit PIN code"
                    maxLength={6}
                    pattern="\d{6}"
                    onChange={handleZipChange}
                    className={`rounded-md border ${errors.zip ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
                  />
                  {errors.zip && (
                    <p className="text-red-500 text-xs mt-1">{errors.zip}</p>
                  )}
                </div>

                {/* Save Address Checkbox (only for logged-in users) */}
                {session && (
                  <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <input
                      type="checkbox"
                      name="saveBillingAddress"
                      id="saveBillingAddress"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="saveBillingAddress" className="ml-3 text-sm text-gray-700">
                      <span className="font-medium">Save this address</span> for future orders
                    </label>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      <AddressFormModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchAddresses}
      />
    </>
  );
};

export default BillingNew;
