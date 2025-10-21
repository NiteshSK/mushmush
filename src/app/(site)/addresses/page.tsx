"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

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

export default function AddressesPage() {
  const { data: session, status } = useSession();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const router = useRouter();

  const [formData, setFormData] = useState({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    type: "BOTH",
    isDefault: false
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

    // Validate phone-like zip code (6 digits for India)
    if (!/^\d{6}$/.test(formData.zip)) {
      toast.error("ZIP code must be 6 digits");
      return;
    }

    try {
      const url = editingAddress
        ? `/api/addresses/${editingAddress.id}`
        : "/api/addresses";
      
      const method = editingAddress ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
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
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this address?")) return;

    try {
      const response = await fetch(`/api/addresses/${id}`, {
        method: "DELETE"
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
        body: JSON.stringify({ isDefault: true })
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
      isDefault: address.isDefault
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
      isDefault: false
    });
  };

  if (status === "loading" || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
            <p className="mt-2 text-gray-600">
              Manage your shipping addresses (Maximum 5 addresses)
            </p>
          </div>
          <button
            onClick={openAddModal}
            disabled={addresses.length >= 5}
            className={`px-6 py-3 rounded-lg font-medium transition-colors ${
              addresses.length >= 5
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue text-white hover:bg-blue-dark"
            }`}
          >
            Add New Address
          </button>
        </div>

        {/* Addresses List */}
        {addresses.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center">
            <div className="text-6xl mb-4">📍</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No addresses yet</h3>
            <p className="text-gray-600 mb-6">
              Add your first shipping address to make checkout faster.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue hover:bg-blue-dark"
            >
              Add Address
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {addresses.map((address) => (
              <div
                key={address.id}
                className={`bg-white rounded-lg shadow p-6 relative ${
                  address.isDefault ? "ring-2 ring-blue-500" : ""
                }`}
              >
                {address.isDefault && (
                  <div className="absolute top-4 right-4">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Default
                    </span>
                  </div>
                )}

                <div className="mb-4">
                  <p className="font-medium text-gray-900">{address.street}</p>
                  <p className="text-gray-600">
                    {address.city}, {address.state} - {address.zip}
                  </p>
                  <p className="text-gray-600">{address.country}</p>
                </div>

                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => openEditModal(address)}
                    className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Edit
                  </button>
                  {!address.isDefault && (
                    <>
                      <button
                        onClick={() => handleSetDefault(address.id)}
                        className="text-sm text-green-600 hover:text-green-700 font-medium"
                      >
                        Set as Default
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                {editingAddress ? "Edit Address" : "Add New Address"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.street}
                    onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="House no, Building name, Street"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      State *
                    </label>
                    <select
                      required
                      value={formData.state}
                      onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      PIN Code *
                    </label>
                    <input
                      type="text"
                      required
                      pattern="\d{6}"
                      maxLength={6}
                      value={formData.zip}
                      onChange={(e) => setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="6-digit PIN code"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Country
                    </label>
                    <input
                      type="text"
                      value="India"
                      disabled
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formData.isDefault}
                    onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
                    Set as default address
                  </label>
                </div>

                <div className="flex items-center space-x-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    {editingAddress ? "Update Address" : "Add Address"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
