// src/components/Checkout/Billing.js

"use client";
import React, { useState } from "react";

const Billing = () => {
  // Use state to manage form inputs
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    companyName: "",
    countryRegion: "Australia",
    streetAddress1: "",
    streetAddress2: "",
    townCity: "",
    country: "",
    phone: "",
    email: "",
  });

  // A single handler to update the state
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
              placeholder="Your first name"
              value={formData.firstName}
              onChange={handleInputChange}
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
              placeholder="Your last name"
              value={formData.lastName}
              onChange={handleInputChange}
              className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
            />
          </div>
        </div>

        {/* Other fields follow the same pattern... */}
        {/* ... (companyName, country/region, address, etc.) ... */}
        {/* NOTE: You would continue this pattern for all other inputs. */}

      </div>
    </div>
  );
};

export default Billing;