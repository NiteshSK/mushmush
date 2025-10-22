"use client";
import React, { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";

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

interface AddressSelectorProps {
  onAddressSelect: (address: Address | null) => void;
  selectedAddressId?: string;
}

const AddressSelector: React.FC<AddressSelectorProps> = ({ onAddressSelect, selectedAddressId }) => {
  const { data: session } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [useNewAddress, setUseNewAddress] = useState(false);

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
        if (userAddresses.length > 0 && !selectedAddressId) {
          const defaultAddr = userAddresses.find((a: Address) => a.isDefault) || userAddresses[0];
          onAddressSelect(defaultAddr);
        }
        
        // If no addresses, show new address form
        if (userAddresses.length === 0) {
          setUseNewAddress(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddressChange = (addressId: string) => {
    if (addressId === "new") {
      setUseNewAddress(true);
      onAddressSelect(null);
    } else {
      setUseNewAddress(false);
      const selected = addresses.find(a => a.id === addressId);
      onAddressSelect(selected || null);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        <div className="h-20 bg-gray-200 rounded"></div>
      </div>
    );
  }

  // Guest checkout or no saved addresses
  if (!session || addresses.length === 0) {
    return (
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Shipping Address</h3>
          {!session && (
            <Link
              href="/auth/signin"
              className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in to save addresses
            </Link>
          )}
        </div>
        {session && addresses.length === 0 && (
          <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              You don't have any saved addresses yet.{" "}
              <Link href="/addresses" className="font-medium underline">
                Add an address
              </Link>{" "}
              to make future checkouts faster.
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Select Shipping Address</h3>
          <p className="text-sm text-gray-500 mt-1">
            {addresses.length} of 5 addresses saved
          </p>
        </div>
        <Link
          href="/addresses"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          Manage Addresses
        </Link>
      </div>

      <div className="space-y-3">
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
                name="savedAddress"
                value={address.id}
                checked={selectedAddressId === address.id}
                onChange={() => handleAddressChange(address.id)}
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
                <p className="text-sm text-gray-600">{address.country}</p>
              </div>
            </div>
          </label>
        ))}

        {/* Option to use new address */}
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
              name="savedAddress"
              value="new"
              checked={useNewAddress}
              onChange={() => handleAddressChange("new")}
              className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
            />
            <div className="ml-3">
              <span className="font-medium text-gray-900">Use a new address</span>
              <p className="text-sm text-gray-600 mt-1">
                Enter a different shipping address
              </p>
            </div>
          </div>
        </label>
      </div>

      <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
        <p className="text-sm text-gray-600">
          {addresses.length < 5 ? (
            <>
              💡 You can save up to 5 addresses. You have {5 - addresses.length} slot{5 - addresses.length !== 1 ? 's' : ''} remaining.{" "}
              <Link href="/addresses" className="text-blue-600 hover:text-blue-700 font-medium">
                Manage addresses
              </Link>
            </>
          ) : (
            <>
              ⚠️ You have reached the maximum limit of 5 addresses.{" "}
              <Link href="/addresses" className="text-blue-600 hover:text-blue-700 font-medium">
                Delete an address
              </Link>
              {" "}to add a new one.
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AddressSelector;
