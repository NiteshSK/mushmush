"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Breadcrumb from "@/components/Common/Breadcrumb";
import { INDIAN_STATES, MAX_ADDRESSES_PER_USER } from "@/lib/constants";
import { validateStreet, validateCity, validatePincode } from "@/lib/validation";

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

const inputClass =
  "rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-forest/20";

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    type: "BOTH",
    isDefault: false,
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin");
      return;
    }

    if (session?.user) {
      fetchAddresses();
    }
  }, [session, status, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses || []);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
      toast.error("Failed to load addresses");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { [key: string]: string } = {};

    const streetErr = validateStreet(formData.street);
    if (streetErr) newErrors.street = streetErr;

    const cityErr = validateCity(formData.city);
    if (cityErr) newErrors.city = cityErr;

    if (!formData.state) newErrors.state = 'State is required';

    const pinErr = validatePincode(formData.zip);
    if (pinErr) newErrors.zip = pinErr;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setSaving(true);
    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : "/api/addresses";

      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(editingAddress ? "Address updated!" : "Address added!");
        setShowModal(false);
        resetForm();
        fetchAddresses();
      } else {
        toast.error(data.error || "Failed to save address");
      }
    } catch (error) {
      console.error("Error saving address:", error);
      toast.error("Failed to save address");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        toast.success("Address deleted!");
        fetchAddresses();
      } else {
        toast.error("Failed to delete address");
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      toast.error("Failed to delete address");
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDefault: true }),
      });

      if (response.ok) {
        toast.success("Default address updated!");
        fetchAddresses();
      } else {
        toast.error("Failed to set default address");
      }
    } catch (error) {
      console.error("Error setting default:", error);
      toast.error("Failed to set default address");
    }
  };

  const openAddModal = () => {
    resetForm();
    setEditingAddress(null);
    setShowModal(true);
  };

  const openEditModal = (address: Address) => {
    setFormData({
      street: address.street,
      city: address.city,
      state: address.state,
      zip: address.zip,
      country: address.country,
      type: address.type,
      isDefault: address.isDefault,
    });
    setEditingAddress(address);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      street: "",
      city: "",
      state: "",
      zip: "",
      country: "India",
      type: "BOTH",
      isDefault: false,
    });
    setErrors({});
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-[#F6F7FB] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-forest"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <>
      <Breadcrumb title="My Addresses" pages={["My Addresses"]} />

      <section className="overflow-hidden py-20 bg-[#F6F7FB]">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
            <div>
              <p className="text-dark-5">
                Manage your saved shipping addresses (up to {MAX_ADDRESSES_PER_USER})
              </p>
            </div>
            <button
              onClick={openAddModal}
              disabled={addresses.length >= MAX_ADDRESSES_PER_USER}
              className={`inline-flex items-center gap-2 font-medium text-sm py-2.5 px-6 rounded-md transition-colors ${
                addresses.length >= MAX_ADDRESSES_PER_USER
                  ? "bg-gray-3 text-dark-5 cursor-not-allowed"
                  : "bg-forest text-white hover:bg-dark"
              }`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Add New Address
            </button>
          </div>

          {/* Addresses */}
          {addresses.length === 0 ? (
            <div className="bg-white shadow-1 rounded-[10px] p-12 text-center">
              <div className="w-20 h-20 mx-auto mb-5 bg-forest/10 rounded-full flex items-center justify-center">
                <svg
                  className="w-10 h-10 text-forest"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <h3 className="font-medium text-lg text-dark mb-2">
                No addresses yet
              </h3>
              <p className="text-dark-5 mb-6">
                Add your first shipping address to make checkout faster.
              </p>
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-forest text-white font-medium text-sm py-2.5 px-6 rounded-md hover:bg-dark transition-colors"
              >
                Add Address
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {addresses.map((address) => (
                <div
                  key={address.id}
                  className={`bg-white shadow-1 rounded-[10px] overflow-hidden transition-all ${
                    address.isDefault
                      ? "ring-2 ring-forest"
                      : "hover:shadow-lg"
                  }`}
                >
                  {/* Card Header */}
                  <div className="flex items-center justify-between border-b border-gray-3 py-4 px-5 sm:px-7">
                    <div className="flex items-center gap-2.5">
                      <svg
                        className="w-4.5 h-4.5 text-dark-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      <span className="font-medium text-dark text-sm">
                        {address.type === "SHIPPING"
                          ? "Shipping"
                          : address.type === "BILLING"
                          ? "Billing"
                          : "Shipping & Billing"}
                      </span>
                    </div>
                    {address.isDefault && (
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-forest bg-forest/10 px-2.5 py-1 rounded-full">
                        Default
                      </span>
                    )}
                  </div>

                  {/* Card Body */}
                  <div className="p-5 sm:p-7">
                    <p className="font-medium text-dark mb-1">
                      {address.street}
                    </p>
                    <p className="text-dark-5 text-sm">
                      {address.city}, {address.state} &mdash; {address.zip}
                    </p>
                    <p className="text-dark-5 text-sm">{address.country}</p>

                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-5 pt-4 border-t border-gray-3">
                      <button
                        onClick={() => openEditModal(address)}
                        className="text-sm font-medium text-forest hover:text-dark transition-colors"
                      >
                        Edit
                      </button>
                      {!address.isDefault && (
                        <>
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-sm font-medium text-dark-5 hover:text-dark transition-colors"
                          >
                            Set as Default
                          </button>
                          <button
                            onClick={() => handleDelete(address.id)}
                            className="text-sm font-medium text-red hover:text-red-dark transition-colors"
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Address count */}
          {addresses.length > 0 && (
            <p className="text-xs text-dark-5 mt-4">
              {addresses.length} of {MAX_ADDRESSES_PER_USER} addresses saved
            </p>
          )}
        </div>
      </section>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-[10px] shadow-1 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="border-b border-gray-3 py-5 px-5 sm:px-8 flex items-center justify-between">
              <h2 className="font-medium text-xl text-dark">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-dark-5 hover:text-dark transition-colors"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleSubmit} className="p-5 sm:p-8 space-y-4.5">
              <div>
                <label className="block text-sm font-medium text-dark mb-1.5">
                  Street Address <span className="text-red">*</span>
                </label>
                <input
                  type="text"
                  value={formData.street}
                  onChange={(e) => {
                    setFormData({ ...formData, street: e.target.value });
                    if (errors.street) setErrors(prev => ({ ...prev, street: '' }));
                  }}
                  className={`${inputClass} ${errors.street ? '!border-red-500' : ''}`}
                  placeholder="House no, Building name, Street"
                />
                {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    City <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => {
                      setFormData({ ...formData, city: e.target.value });
                      if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                    }}
                    className={`${inputClass} ${errors.city ? '!border-red-500' : ''}`}
                    placeholder="Enter city"
                  />
                  {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    State <span className="text-red">*</span>
                  </label>
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      setFormData({ ...formData, state: e.target.value });
                      if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
                    }}
                    className={`${inputClass} ${errors.state ? '!border-red-500' : ''}`}
                  >
                    <option value="">Select State</option>
                    {INDIAN_STATES.map((state) => (
                      <option key={state} value={state}>
                        {state}
                      </option>
                    ))}
                  </select>
                  {errors.state && <p className="text-red-500 text-xs mt-1">{errors.state}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    PIN Code <span className="text-red">*</span>
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={formData.zip}
                    onChange={(e) => {
                      setFormData({
                        ...formData,
                        zip: e.target.value.replace(/\D/g, ""),
                      });
                      if (errors.zip) setErrors(prev => ({ ...prev, zip: '' }));
                    }}
                    className={`${inputClass} ${errors.zip ? '!border-red-500' : ''}`}
                    placeholder="6-digit PIN code"
                  />
                  {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-dark mb-1.5">
                    Country
                  </label>
                  <input
                    type="text"
                    value="India"
                    disabled
                    className="rounded-md border border-gray-3 bg-gray-2 text-dark-5 w-full py-2.5 px-5"
                  />
                </div>
              </div>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.isDefault}
                  onChange={(e) =>
                    setFormData({ ...formData, isDefault: e.target.checked })
                  }
                  className="h-4 w-4 text-forest accent-forest rounded"
                />
                <span className="text-sm text-dark">
                  Set as default address
                </span>
              </label>

              <div className="flex items-center gap-3 pt-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 bg-forest text-white font-medium text-sm py-3 px-6 rounded-md hover:bg-dark transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {saving
                    ? "Saving..."
                    : editingAddress
                    ? "Update Address"
                    : "Add Address"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 text-sm font-medium text-dark-5 py-3 px-6 rounded-md border border-gray-3 hover:bg-gray-1 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
