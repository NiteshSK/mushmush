import React, { useState } from "react";

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

const Shipping = () => {
  const [dropdown, setDropdown] = useState(false);
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  const validatePhone = (phone: string) => {
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phone) return "Phone number is required";
    if (!/^\d+$/.test(phone)) return "Phone number must contain only digits";
    if (!phoneRegex.test(phone)) return "Please enter a valid 10-digit Indian mobile number";
    return "";
  };

  const validateZip = (zip: string) => {
    const zipRegex = /^\d{6}$/;
    if (!zip) return "PIN code is required";
    if (!/^\d+$/.test(zip)) return "PIN code must contain only digits";
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
    setErrors(prev => ({ ...prev, shippingPhone: error }));
  };

  const handleZipChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 6);
    e.target.value = value;
    const error = validateZip(value);
    setErrors(prev => ({ ...prev, shippingZip: error }));
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const error = validateEmail(value);
    setErrors(prev => ({ ...prev, shippingEmail: error }));
  };

  return (
    <div className="bg-white shadow-1 rounded-[10px] mt-7.5">
      <div
        onClick={() => setDropdown(!dropdown)}
        className="cursor-pointer flex items-center gap-2.5 font-medium text-lg text-dark py-5 px-5.5"
      >
        Ship to a different address?
        <svg
          className={`fill-current ease-out duration-200 ${
            dropdown && "rotate-180"
          }`}
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M4.06103 7.80259C4.30813 7.51431 4.74215 7.48092 5.03044 7.72802L10.9997 12.8445L16.9689 7.72802C17.2572 7.48092 17.6912 7.51431 17.9383 7.80259C18.1854 8.09088 18.1521 8.5249 17.8638 8.772L11.4471 14.272C11.1896 14.4927 10.8097 14.4927 10.5523 14.272L4.1356 8.772C3.84731 8.5249 3.81393 8.09088 4.06103 7.80259Z"
            fill=""
          />
        </svg>
      </div>

      {/* <!-- dropdown menu --> */}
      <div className={`p-4 sm:p-8.5 ${dropdown ? "block" : "hidden"}`}>

        <div className="mb-5">
          <label htmlFor="shippingAddress" className="block mb-2.5">
            Street Address
            <span className="text-red">*</span>
          </label>

          <input
            type="text"
            name="shippingAddress"
            required={dropdown}
            placeholder="House number and street name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />

          <div className="mt-5">
            <input
              type="text"
              name="shippingAddress2"
              placeholder="Apartment, suite, unit, etc. (optional)"
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        <div className="mb-5">
          <label htmlFor="shippingCity" className="block mb-2.5">
            City <span className="text-red">*</span>
          </label>

          <input
            type="text"
            name="shippingCity"
            required={dropdown}
            placeholder="Enter city name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        <div className="mb-5">
          <label htmlFor="shippingState" className="block mb-2.5">
            State <span className="text-red">*</span>
          </label>

          <select
            name="shippingState"
            required={dropdown}
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

        <div className="mb-5">
          <label htmlFor="shippingZip" className="block mb-2.5">
            PIN Code <span className="text-red">*</span>
          </label>

          <input
            type="text"
            name="shippingZip"
            required={dropdown}
            placeholder="6-digit PIN code"
            maxLength={6}
            pattern="\d{6}"
            onChange={handleZipChange}
            className={`rounded-md border ${errors.shippingZip ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
          />
          {errors.shippingZip && (
            <p className="text-red-500 text-xs mt-1">{errors.shippingZip}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="shippingPhone" className="block mb-2.5">
            Phone <span className="text-red">*</span>
          </label>

          <input
            type="tel"
            name="shippingPhone"
            required={dropdown}
            placeholder="10-digit mobile number"
            maxLength={10}
            pattern="[6-9]\d{9}"
            onChange={handlePhoneChange}
            className={`rounded-md border ${errors.shippingPhone ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
          />
          {errors.shippingPhone && (
            <p className="text-red-500 text-xs mt-1">{errors.shippingPhone}</p>
          )}
        </div>

        <div className="mb-5">
          <label htmlFor="shippingEmail" className="block mb-2.5">
            Email Address <span className="text-red">*</span>
          </label>

          <input
            type="email"
            name="shippingEmail"
            required={dropdown}
            placeholder="your.email@example.com"
            onChange={handleEmailChange}
            className={`rounded-md border ${errors.shippingEmail ? 'border-red-500' : 'border-gray-3'} bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20`}
          />
          {errors.shippingEmail && (
            <p className="text-red-500 text-xs mt-1">{errors.shippingEmail}</p>
          )}
        </div>

        {/* Save Address Checkbox */}
        <div className="flex items-center p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <input
            type="checkbox"
            name="saveShippingAddress"
            id="saveShippingAddress"
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="saveShippingAddress" className="ml-3 text-sm text-gray-700">
            <span className="font-medium">Save this address</span> for future orders (You can save up to 5 addresses)
          </label>
        </div>
      </div>
    </div>
  );
};

export default Shipping;
