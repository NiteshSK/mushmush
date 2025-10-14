// src/components/Checkout/Billing.tsx

"use client";
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

const Billing = () => {
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

  return (
    <div className="mt-9">
      <h2 className="font-medium text-dark text-xl sm:text-2xl mb-5.5">
        Billing details
      </h2>
      <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5">
        {/* First Name & Last Name */}
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

        {/* Email */}
        <div className="mb-5">
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

        {/* Phone */}
        <div className="mb-5">
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

        {/* Street Address */}
        <div className="mb-5">
          <label htmlFor="address" className="block mb-2.5">
            Street Address <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="address"
            id="address"
            required
            placeholder="House number and street name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* City */}
        <div className="mb-5">
          <label htmlFor="town" className="block mb-2.5">
            City <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="town"
            id="town"
            required
            placeholder="Enter city name"
            className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
          />
        </div>

        {/* State */}
        <div className="mb-5">
          <label htmlFor="country" className="block mb-2.5">
            State <span className="text-red">*</span>
          </label>
          <select
            name="country"
            id="country"
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

        {/* PIN Code */}
        <div className="mb-5">
          <label htmlFor="zip" className="block mb-2.5">
            PIN Code <span className="text-red">*</span>
          </label>
          <input
            type="text"
            name="zip"
            id="zip"
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

      </div>
    </div>
  );
};

export default Billing;