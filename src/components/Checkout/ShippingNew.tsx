"use client";
import React, { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import AddressFormModal from "./AddressFormModal";

const INDIAN_STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh",
  "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand",
  "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
  "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab",
  "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

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

interface ShippingNewProps {
  billingAddress?: Address | null;
  onAddressChange?: (address: Address | null) => void;
}

const ShippingNew: React.FC<ShippingNewProps> = ({ billingAddress, onAddressChange }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string>("");
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
    } else {
      setLoading(false);
    }
  }, [session]);

  useEffect(() => {
    if (sameAsBilling && billingAddress) {
      onAddressChange?.(billingAddress);
    }
  }, [sameAsBilling, billingAddress]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        const userAddresses = data.addresses || [];
        setAddresses(userAddresses);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      setUseNewAddress(false);
      setSelectedAddressId("");
      onAddressChange?.(billingAddress || null);
    } else {
      // Auto-select first saved address if available
      if (addresses.length > 0) {
        const defaultAddr = addresses.find(a => a.isDefault) || addresses[0];
        setSelectedAddressId(defaultAddr.id);
        onAddressChange?.(defaultAddr);
      } else {
        setUseNewAddress(true);
        onAddressChange?.(null);
      }
    }
  };

  const handleAddressSelect = (addressId: string) => {
    if (addressId === "new") {
      setUseNewAddress(true);
      setSelectedAddressId("");
      setSameAsBilling(false);
      onAddressChange?.(null);
    } else {
      setUseNewAddress(false);
      setSelectedAddressId(addressId);
      setSameAsBilling(false);
      const selected = addresses.find(a => a.id === addressId);
      onAddressChange?.(selected || null);
    }
  };

  const validateZip = (zip: string) => {
    const zipRegex = /^\d{6}$/;
    if (!zip) return "PIN code is required";
    if (!zipRegex.test(zip)) return "PIN code must be exactly 6 digits";
    return "";
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    e.target.value = value;
    const error = validateZip(value);
    setErrors(prev => ({ ...prev, zip: error }));
  };

  if (loading) {
    return (
      <div className="bg-white shadow-1 rounded-[10px] mt-7.5 p-4 sm:p-8.5 animate-pulse">
        <h3 className="font-medium text-lg mb-4">Shipping Address</h3>
        <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
        <div className="p-4 sm:p-8.5">
          <h3 className="font-medium text-lg mb-4">Shipping Address</h3>

          {/* Same as Billing Checkbox */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                name="sameAsBilling"
                checked={sameAsBilling}
                onChange={(e) => handleSameAsBillingChange(e.target.checked)}
                className="mt-0.5 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <div className="ml-3">
                <span className="font-medium text-gray-900">Ship to billing address</span>
                <p className="text-sm text-gray-600 mt-1">
                  Use the same address for shipping
                </p>
              </div>
            </label>
          </div>

          {/* Show address options only if not same as billing */}
          {!sameAsBilling && (
            <>
              {/* Saved Addresses */}
              {session && addresses.length > 0 && (
                <div className="space-y-3 mb-4">
                  {addresses.map((address) => (
                    <label
                      key={address.id}
                      className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${selectedAddressId === address.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-gray-300"
                        }`}
                    >
                      <div className="flex items-start">
                        <input
                          type="radio"
                          name="shippingAddress"
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
                    className={`block p-4 border-2 rounded-lg cursor-pointer transition-all ${useNewAddress
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                      }`}
                  >
                    <div className="flex items-start">
                      <input
                        type="radio"
                        name="shippingAddress"
                        value="new"
                        checked={useNewAddress}
                        onChange={() => handleAddressSelect("new")}
                        className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="font-medium text-gray-900">Use a different address</span>
                        <p className="text-sm text-gray-600 mt-1">
                          Enter a new shipping address
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

              {/* New Address Form */}
              {(useNewAddress || (!session) || (session && addresses.length === 0)) && (
                <div className="space-y-5">
                  <div>
                    <label htmlFor="shippingAddress" className="block mb-2.5">
                      Street Address <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingAddress"
                      id="shippingAddress"
                      required
                      placeholder="House number and street name"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div className="flex flex-col lg:flex-row gap-5 sm:gap-8">
                    <div className="w-full">
                      <label htmlFor="shippingCity" className="block mb-2.5">
                        City <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="shippingCity"
                        id="shippingCity"
                        required
                        placeholder="Enter city name"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                    <div className="w-full">
                      <label htmlFor="shippingState" className="block mb-2.5">
                        State <span className="text-red">*</span>
                      </label>
                      <select
                        name="shippingState"
                        id="shippingState"
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
                    <label htmlFor="shippingZip" className="block mb-2.5">
                      PIN Code <span className="text-red">*</span>
                    </label>
                    <input
                      type="text"
                      name="shippingZip"
                      id="shippingZip"
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
                        name="saveShippingAddress"
                        id="saveShippingAddress"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <label htmlFor="saveShippingAddress" className="ml-3 text-sm text-gray-700">
                        <span className="font-medium">Save this address</span> for future orders
                      </label>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
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

export default ShippingNew;
