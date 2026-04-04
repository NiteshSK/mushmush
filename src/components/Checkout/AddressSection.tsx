"use client";
import React, { useState, useEffect } from "react";
import { INDIAN_STATES, MAX_ADDRESSES_PER_USER } from "@/lib/constants";
import toast from "react-hot-toast";

export interface Address {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
}

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
}

interface AddressSectionProps {
  /** Pre-fetched saved addresses (empty for guests) */
  addresses: Address[];
  /** Currently selected saved address ID */
  selectedId: string | null;
  /** Called when user selects a saved address or null (new address mode) */
  onSelect: (address: Address | null) => void;
  /** Called when pincode changes (for delivery check) */
  onPincodeChange: (pincode: string) => void;
  /** Whether this is a guest checkout */
  isGuest: boolean;
  /** Label: "Delivery Address" or "Billing Address" */
  label?: string;
  /** Called when addresses list changes (after saving new) */
  onAddressesChange?: (addresses: Address[]) => void;
}

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

const AddressForm = ({
  onSubmit,
  onCancel,
  onPincodeChange,
  showCancel,
}: {
  onSubmit: (data: AddressFormData) => void;
  onCancel?: () => void;
  onPincodeChange: (pin: string) => void;
  showCancel: boolean;
}) => {
  const [form, setForm] = useState<AddressFormData>({ street: "", city: "", state: "", zip: "" });

  const update = (field: keyof AddressFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (field === "zip") {
      const clean = value.replace(/\D/g, "").slice(0, 6);
      if (clean.length === 6) onPincodeChange(clean);
    }
  };

  const handleSubmit = () => {
    if (!form.street || !form.city || !form.state || !form.zip) {
      toast.error("Please fill all address fields");
      return;
    }
    if (!/^\d{6}$/.test(form.zip)) {
      toast.error("Please enter a valid 6-digit PIN code");
      return;
    }
    onSubmit(form);
  };

  return (
    <div className="space-y-4 mt-4">
      <div>
        <label className="block text-sm font-medium text-dark mb-1.5">
          Street Address <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={form.street}
          onChange={(e) => update("street", e.target.value)}
          placeholder="House number and street name"
          className={inputClass}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">
            City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            value={form.city}
            onChange={(e) => update("city", e.target.value)}
            placeholder="Enter city"
            className={inputClass}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-dark mb-1.5">
            State <span className="text-red">*</span>
          </label>
          <select
            value={form.state}
            onChange={(e) => update("state", e.target.value)}
            className={inputClass}
          >
            <option value="">Select State</option>
            {INDIAN_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="max-w-[200px]">
        <label className="block text-sm font-medium text-dark mb-1.5">
          PIN Code <span className="text-red">*</span>
        </label>
        <input
          type="text"
          value={form.zip}
          onChange={(e) => update("zip", e.target.value.replace(/\D/g, "").slice(0, 6))}
          placeholder="6-digit PIN"
          maxLength={6}
          className={inputClass}
        />
      </div>

      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={handleSubmit}
          className="bg-forest text-white text-sm font-medium py-2.5 px-6 rounded-md hover:bg-dark transition-colors"
        >
          Use This Address
        </button>
        {showCancel && onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="text-sm font-medium text-gray-500 py-2.5 px-6 rounded-md border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};

const AddressSection: React.FC<AddressSectionProps> = ({
  addresses,
  selectedId,
  onSelect,
  onPincodeChange,
  isGuest,
  label = "Delivery Address",
  onAddressesChange,
}) => {
  const [showNewForm, setShowNewForm] = useState(isGuest || addresses.length === 0);
  const [savingAddress, setSavingAddress] = useState(false);

  // Auto-trigger pincode check when a saved address is selected
  useEffect(() => {
    if (selectedId) {
      const addr = addresses.find((a) => a.id === selectedId);
      if (addr?.zip) onPincodeChange(addr.zip);
    }
  }, [selectedId]);

  const handleSelectSaved = (address: Address) => {
    setShowNewForm(false);
    onSelect(address);
  };

  const handleNewAddressClick = () => {
    setShowNewForm(true);
    onSelect(null);
  };

  const handleNewAddressSubmit = async (data: AddressFormData) => {
    // For guest: just use as-is (don't save to DB)
    if (isGuest) {
      const tempAddr: Address = {
        id: `temp-${Date.now()}`,
        ...data,
        country: "India",
        type: "SHIPPING",
        isDefault: false,
      };
      onSelect(tempAddr);
      setShowNewForm(false);
      return;
    }

    // For logged-in: save to DB
    if (addresses.length >= MAX_ADDRESSES_PER_USER) {
      toast.error(`You can save up to ${MAX_ADDRESSES_PER_USER} addresses. Please delete one first.`);
      // Still use it for this order without saving
      const tempAddr: Address = {
        id: `temp-${Date.now()}`,
        ...data,
        country: "India",
        type: "SHIPPING",
        isDefault: false,
      };
      onSelect(tempAddr);
      setShowNewForm(false);
      return;
    }

    setSavingAddress(true);
    try {
      const res = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...data,
          country: "India",
          type: "SHIPPING",
          isDefault: addresses.length === 0,
        }),
      });

      if (res.ok) {
        const { address: savedAddr } = await res.json();
        toast.success("Address saved");
        const updated = [...addresses, savedAddr];
        onAddressesChange?.(updated);
        onSelect(savedAddr);
        setShowNewForm(false);
      } else {
        const err = await res.json();
        toast.error(err.error || "Failed to save address");
      }
    } catch {
      toast.error("Error saving address");
    } finally {
      setSavingAddress(false);
    }
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
        <h3 className="font-medium text-xl text-dark">{label}</h3>
      </div>

      <div className="p-4 sm:p-8.5">
        {/* Saved addresses list */}
        {!isGuest && addresses.length > 0 && (
          <div className="space-y-3 mb-4">
            {addresses.map((addr) => (
              <label
                key={addr.id}
                className={`block p-4 border-2 rounded-[10px] cursor-pointer transition-all ${
                  selectedId === addr.id && !showNewForm
                    ? "border-forest bg-forest/5 shadow-sm"
                    : "border-gray-3 hover:border-forest/30"
                }`}
                onClick={() => handleSelectSaved(addr)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative mt-0.5">
                    <input
                      type="radio"
                      name={`address-${label}`}
                      checked={selectedId === addr.id && !showNewForm}
                      onChange={() => handleSelectSaved(addr)}
                      className="sr-only"
                    />
                    <div
                      className={`flex h-4 w-4 items-center justify-center rounded-full ${
                        selectedId === addr.id && !showNewForm
                          ? "border-4 border-forest"
                          : "border border-gray-4"
                      }`}
                    ></div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-dark text-sm">{addr.street}</span>
                      {addr.isDefault && (
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-forest bg-forest/10 px-2 py-0.5 rounded-full">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-dark-5 mt-0.5">
                      {addr.city}, {addr.state} &mdash; {addr.zip}
                    </p>
                  </div>
                </div>
              </label>
            ))}

            {/* Add new address option */}
            <label
              className={`block p-4 border-2 rounded-[10px] cursor-pointer transition-all ${
                showNewForm
                  ? "border-forest bg-forest/5 shadow-sm"
                  : "border-dashed border-gray-3 hover:border-forest/30"
              }`}
              onClick={handleNewAddressClick}
            >
              <div className="flex items-center gap-3">
                <div className="relative">
                  <input
                    type="radio"
                    name={`address-${label}`}
                    checked={showNewForm}
                    onChange={handleNewAddressClick}
                    className="sr-only"
                  />
                  <div
                    className={`flex h-4 w-4 items-center justify-center rounded-full ${
                      showNewForm
                        ? "border-4 border-forest"
                        : "border border-gray-4"
                    }`}
                  ></div>
                </div>
                <span className="text-sm font-medium text-dark">+ Add New Address</span>
              </div>
            </label>

            {/* Address count */}
            <p className="text-xs text-dark-5 mt-2">
              {addresses.length} of {MAX_ADDRESSES_PER_USER} addresses saved
            </p>
          </div>
        )}

        {/* New address form — shown for guests, or when "Add New" is selected */}
        {showNewForm && (
          <AddressForm
            onSubmit={handleNewAddressSubmit}
            onCancel={addresses.length > 0 ? () => {
              setShowNewForm(false);
              // Re-select first/default address
              const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
              if (defaultAddr) onSelect(defaultAddr);
            } : undefined}
            onPincodeChange={onPincodeChange}
            showCancel={addresses.length > 0}
          />
        )}

        {savingAddress && (
          <p className="text-sm text-dark-5 mt-2 animate-pulse">Saving address...</p>
        )}
      </div>
    </div>
  );
};

export default AddressSection;
