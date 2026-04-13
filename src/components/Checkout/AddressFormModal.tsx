"use client";
import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { INDIAN_STATES } from "@/lib/constants";
import { validateStreet, validateCity, validatePincode } from "@/lib/validation";

interface AddressFormData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  isDefault: boolean;
}

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  title?: string;
}

const AddressFormModal: React.FC<AddressFormModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = "Add New Address"
}) => {
  const [formData, setFormData] = useState<AddressFormData>({
    street: "",
    city: "",
    state: "",
    zip: "",
    country: "India",
    isDefault: false
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

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

    setLoading(true);
    try {
      const response = await fetch("/api/addresses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, type: "SHIPPING" })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Address added successfully!");
        onSuccess();
        onClose();
        // Reset form
        setFormData({
          street: "",
          city: "",
          state: "",
          zip: "",
          country: "India",
          isDefault: false
        });
        setErrors({});
      } else {
        // Handle specific error codes
        if (data.code === 'ADDRESS_LIMIT_REACHED') {
          toast.error(
            `${data.error}\n\nManage your addresses to delete one before adding new.`,
            { duration: 6000 }
          );
        } else if (data.code === 'DUPLICATE_ADDRESS') {
          toast.error(data.error, { duration: 4000 });
        } else {
          toast.error(data.error || "Failed to add address");
        }
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast.error("Failed to add address");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label htmlFor="street" className="block text-sm font-medium text-gray-700 mb-2">
              Street Address <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="street"
              value={formData.street}
              onChange={(e) => {
                setFormData({ ...formData, street: e.target.value });
                if (errors.street) setErrors(prev => ({ ...prev, street: '' }));
              }}
              className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${errors.street ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-forest-500'}`}
              placeholder="House no, Building name, Street"
            />
            {errors.street && <p className="text-red-500 text-xs mt-1">{errors.street}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="city"
                value={formData.city}
                onChange={(e) => {
                  setFormData({ ...formData, city: e.target.value });
                  if (errors.city) setErrors(prev => ({ ...prev, city: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${errors.city ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-forest-500'}`}
              />
              {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
            </div>

            <div>
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-2">
                State <span className="text-red-500">*</span>
              </label>
              <select
                id="state"
                value={formData.state}
                onChange={(e) => {
                  setFormData({ ...formData, state: e.target.value });
                  if (errors.state) setErrors(prev => ({ ...prev, state: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${errors.state ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-forest-500'}`}
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="zip" className="block text-sm font-medium text-gray-700 mb-2">
                PIN Code <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="zip"
                maxLength={6}
                value={formData.zip}
                onChange={(e) => {
                  setFormData({ ...formData, zip: e.target.value.replace(/\D/g, '') });
                  if (errors.zip) setErrors(prev => ({ ...prev, zip: '' }));
                }}
                className={`w-full px-4 py-2.5 border rounded-lg focus:ring-2 focus:border-transparent ${errors.zip ? 'border-red-500 focus:ring-red-200' : 'border-gray-300 focus:ring-forest-500'}`}
                placeholder="6-digit PIN code"
              />
              {errors.zip && <p className="text-red-500 text-xs mt-1">{errors.zip}</p>}
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-2">
                Country
              </label>
              <input
                type="text"
                id="country"
                value="India"
                disabled
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
              />
            </div>
          </div>

          <div className="flex items-center pt-2">
            <input
              type="checkbox"
              id="isDefault"
              checked={formData.isDefault}
              onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-forest-500 border-gray-300 rounded"
            />
            <label htmlFor="isDefault" className="ml-2 block text-sm text-gray-900">
              Set as default address
            </label>
          </div>

          <div className="flex items-center space-x-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={loading}
              className="inline-flex font-medium text-white bg-blue py-3 px-7 rounded-md ease-out duration-200 hover:bg-blue-dark"
            >
              {loading ? "Adding..." : "Add Address"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddressFormModal;
