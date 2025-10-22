// Clean Checkout component with OTP verification
"use client";
import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Link from "next/link";

import Breadcrumb from "../Common/Breadcrumb";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import AddressSelector from "./AddressSelector";
import Shipping from "./Shipping";

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

interface AddressData {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

const CheckoutWithOTP = () => {
  const router = useRouter();
  const { data: session } = useSession();
  
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectTotalPrice);
  
  // State management
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  
  // OTP Modal
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [checkoutData, setCheckoutData] = useState<any>(null);
  const [resendingOTP, setResendingOTP] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  
  // Address management
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [selectedBillingId, setSelectedBillingId] = useState<string>("");
  const [selectedShippingId, setSelectedShippingId] = useState<string>("");
  const [useNewBilling, setUseNewBilling] = useState(false);
  const [useNewShipping, setUseNewShipping] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [changeBillingAddress, setChangeBillingAddress] = useState(false);
  
  // Contact info
  const [contactInfo, setContactInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: ""
  });
  
  // Temporary compatibility variables (to be removed in full refactor)
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(true);
  const [otpSent, setOtpSent] = useState(false);
  const userPhone = contactInfo.phone;
  
  const shippingFee = 50.00;
  const total = subtotal + shippingFee;

  // Fetch saved addresses and user profile on mount
  useEffect(() => {
    if (session?.user) {
      fetchAddresses();
      fetchUserProfile();
    } else {
      setLoadingAddresses(false);
      setUseNewBilling(true);
      setUseNewShipping(true);
    }
  }, [session]);

  const fetchUserProfile = async () => {
    if (session?.user?.email) {
      try {
        const response = await fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`);
        if (response.ok) {
          const data = await response.json();
          setContactInfo({
            firstName: session.user.name?.split(' ')[0] || '',
            lastName: session.user.name?.split(' ').slice(1).join(' ') || '',
            email: session.user.email || '',
            phone: data.phone || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    }
  };

  const fetchAddresses = async () => {
    try {
      const response = await fetch("/api/addresses");
      if (response.ok) {
        const data = await response.json();
        const addresses = data.addresses || [];
        setSavedAddresses(addresses);
        
        if (addresses.length > 0) {
          // Auto-select default or first address for both billing and shipping
          const defaultAddr = addresses.find((a: Address) => a.isDefault) || addresses[0];
          setSelectedBillingId(defaultAddr.id);
          setSelectedShippingId(defaultAddr.id);
          setUseNewBilling(false);
          setUseNewShipping(false);
        } else {
          // First time user - need to add billing address
          setUseNewBilling(true);
          setUseNewShipping(true);
        }
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const handleSameAsBillingChange = (checked: boolean) => {
    setSameAsBilling(checked);
    if (checked) {
      // Use billing address for shipping
      setSelectedShippingId(selectedBillingId);
      setUseNewShipping(false);
    }
  };

  const handleChangeBillingToggle = (checked: boolean) => {
    setChangeBillingAddress(checked);
    if (!checked && savedAddresses.length > 0) {
      // Reset to saved address
      const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
      setSelectedBillingId(defaultAddr.id);
      setUseNewBilling(false);
    }
  };

  // Temporary handler for old AddressSelector component
  const handleAddressSelect = (address: Address | null) => {
    setSelectedAddress(address);
    setUseNewAddress(address === null);
  };

  // Handle checkout button click
  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🛒 Checkout button clicked!');
    console.log('💳 Payment method:', paymentMethod);
    
    // Get form data
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Log all form data for debugging
    console.log('📋 Form data:');
    Array.from(formData.entries()).forEach(([key, value]) => {
      console.log(`  ${key}: ${value}`);
    });
    
    // Get contact information - prioritize shipping fields if filled
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const email = (formData.get('email') || formData.get('shippingEmail')) as string;
    const phone = (formData.get('phone') || formData.get('shippingPhone')) as string;
    
    const customerName = `${firstName || ''} ${lastName || ''}`.trim();
    
    console.log('👤 First Name:', firstName);
    console.log('👤 Last Name:', lastName);
    console.log('👤 Customer Name:', customerName);
    console.log('📧 Email:', email);
    console.log('📞 Phone:', phone);
    
    if (!email) {
      const errorMsg = 'Please enter your email address in Contact Information';
      console.error('❌', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }
    
    if (!customerName || customerName === '') {
      const errorMsg = 'Please enter your first and last name in Contact Information';
      console.error('❌', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }
    
    if (!phone) {
      const errorMsg = 'Please enter your phone number in Contact Information';
      console.error('❌', errorMsg);
      setError(errorMsg);
      toast.error(errorMsg, { duration: 4000 });
      return;
    }
    
    // If COD, send OTP. Otherwise, proceed with UPI (to be implemented)
    if (paymentMethod === 'cash') {
      let addressData;

      // Priority: 1. Saved address (selectedBillingId), 2. Shipping section, 3. Billing section
      if (selectedBillingId && !useNewBilling) {
        // Using saved billing address
        const savedAddress = savedAddresses.find(addr => addr.id === selectedBillingId);
        if (savedAddress) {
          addressData = {
            street: savedAddress.street,
            city: savedAddress.city,
            state: savedAddress.state,
            zip: savedAddress.zip,
            country: savedAddress.country
          };
          console.log('✅ Using saved billing address:', savedAddress);
        } else {
          const errorMsg = 'Selected address not found. Please select a valid address.';
          console.error('❌', errorMsg);
          setError(errorMsg);
          toast.error(errorMsg, { duration: 4000 });
          return;
        }
      } else if (selectedAddress && !useNewAddress) {
        // Fallback: Using old selectedAddress (for compatibility)
        addressData = {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country
        };
        console.log('✅ Using selected address (legacy)');
      } else {
        // Check if shipping section was filled (Ship to different address)
        const shippingAddress = formData.get('shippingAddress') as string;
        const shippingCity = formData.get('shippingCity') as string;
        const shippingState = formData.get('shippingState') as string;
        const shippingZip = formData.get('shippingZip') as string;
        
        if (shippingAddress && shippingCity && shippingState) {
          // Use shipping address
          addressData = {
            street: shippingAddress,
            city: shippingCity,
            state: shippingState,
            zip: shippingZip || '000000',
            country: 'India'
          };
          console.log('✅ Using shipping address from "Ship to different address" section');
        } else {
          // Use billing address
          const address = formData.get('address') as string;
          const town = formData.get('town') as string;
          const state = formData.get('country') as string;
          const zip = formData.get('zip') as string;
          
          // Validate required fields
          if (!address || !town || !state) {
            const errorMsg = 'Please fill in all address fields (Street Address, City, State) in either Billing Address or "Ship to different address" section';
            console.error('❌', errorMsg);
            setError(errorMsg);
            toast.error(errorMsg, { duration: 4000 });
            setLoading(false);
            return;
          }
          
          addressData = {
            street: address,
            city: town,
            state: state,
            zip: zip || '000000',
            country: 'India'
          };
          console.log('✅ Using billing address');
        }
      }
      
      const storedData = {
        email,
        customerName,
        customerPhone: phone,
        billingAddress: addressData,
        shippingAddress: addressData,
        cartItems,
        subtotal,
        shippingFee,
        total,
        paymentMethod: 'COD',
        notes
      };
      
      setCheckoutData(storedData);
      console.log('💾 Stored checkout data:', storedData);
      
      setLoading(true);
      setError("");
      
      try {
        const response = await fetch('/api/checkout/send-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, customerName })
        });
        
        const data = await response.json();
        console.log('OTP Response:', data);
        
        if (response.ok) {
          setOtpSent(true);
          setShowOTPModal(true);
          console.log('✅ OTP sent! Check your email:', email);
          console.log('📧 If email not received, check server logs for the OTP');
          console.log('🔍 Modal state - showOTPModal:', true);
          toast.success(`OTP sent to ${email}! Valid for 5 minutes.`, { duration: 6000 });
        } else if (response.status === 429) {
          // Rate limit error
          console.error('Rate limit exceeded:', data);
          toast.error(data.error || 'Too many OTP requests. Please wait.', { duration: 5000 });
          if (data.retryAfter) {
            setResendTimer(data.retryAfter);
          }
        } else {
          console.error('Failed to send OTP:', data);
          setError(data.error || 'Failed to send OTP');
          toast.error(data.error || 'Failed to send OTP', { duration: 4000 });
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    } else {
      // UPI payment flow (to be implemented later)
      toast.error('UPI payment will be implemented soon. Please use Cash on Delivery for now.', { duration: 5000 });
    }
  };

  // Resend timer effect
  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  // Start resend timer when OTP modal opens
  useEffect(() => {
    if (showOTPModal) {
      setResendTimer(60); // 60 seconds cooldown
    }
  }, [showOTPModal]);

  // Handle resend OTP
  const handleResendOTP = async () => {
    if (!checkoutData || resendTimer > 0) return;
    
    setResendingOTP(true);
    setError("");
    
    try {
      const response = await fetch('/api/checkout/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: checkoutData.email, 
          customerName: checkoutData.customerName 
        })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        toast.success('New OTP sent! Valid for 5 minutes.', { duration: 4000 });
        setResendTimer(60); // Reset timer to 60 seconds
        setOtp(""); // Clear old OTP
      } else if (response.status === 429) {
        // Rate limit error
        toast.error(data.error || 'Too many OTP requests. Please wait.', { duration: 5000 });
        if (data.retryAfter) {
          setResendTimer(data.retryAfter);
        }
      } else {
        toast.error(data.error || 'Failed to resend OTP', { duration: 4000 });
      }
    } catch (err) {
      toast.error('Network error. Please try again.');
    } finally {
      setResendingOTP(false);
    }
  };

  // Handle verify OTP and place order
  const handleVerifyAndPlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otp || otp.length !== 6) {
      setError('Please enter a valid 6-digit OTP');
      return;
    }
    
    if (!checkoutData) {
      setError('Checkout data not found. Please try again.');
      return;
    }
    
    setLoading(true);
    setError("");
    
    try {
      const orderData = {
        ...checkoutData,
        otp
      };
      
      console.log('📦 Placing order with data:', orderData);
      
      const response = await fetch('/api/checkout/verify-and-place-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });
      
      const data = await response.json();
      
      if (response.ok) {
        // Show success message
        toast.success(`Order placed successfully! Order Number: ${data.order.orderNumber}`, { duration: 5000 });
        
        // Redirect to success page or orders page
        router.push(`/orders?success=true&orderNumber=${data.order.orderNumber}`);
      } else {
        setError(data.error || 'Failed to place order');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb title={"Checkout"} pages={["checkout"]} />
      <section className="overflow-hidden py-20 bg-gray-2">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <form onSubmit={handleCheckout}>
            <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-11">
              {/* Checkout Left Column */}
              <div className="lg:max-w-[670px] w-full">
                
                {/* Sign In Prompt for Guest Users */}
                {!session && (
                  <div className="bg-blue-50 border border-blue-200 rounded-[10px] p-4 sm:p-6 mb-7.5">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-blue-600 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <h4 className="font-medium text-blue-900 mb-1">Already have an account?</h4>
                        <p className="text-sm text-blue-700 mb-3">
                          Sign in to use saved addresses and track your orders easily.
                        </p>
                        <Link
                          href="/auth/signin"
                          className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          Sign In
                          <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
                
                {/* Contact Information - Always show */}
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5">
                  <h3 className="font-medium text-lg text-dark mb-5">Contact Information</h3>
                  
                  <div className="flex flex-col lg:flex-row gap-5 mb-5">
                    <div className="w-full">
                      <label htmlFor="firstName" className="block mb-2.5">
                        First Name <span className="text-red">*</span>
                      </label>
                      <input
                        type="text"
                        name="firstName"
                        id="firstName"
                        required
                        defaultValue={session?.user?.name?.split(' ')[0] || ''}
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
                        defaultValue={session?.user?.name?.split(' ').slice(1).join(' ') || ''}
                        placeholder="Your last name"
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label htmlFor="email" className="block mb-2.5">
                      Email Address <span className="text-red">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      required
                      defaultValue={session?.user?.email || ''}
                      placeholder="your.email@example.com"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block mb-2.5">
                      Phone <span className="text-red">*</span>
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      id="phone"
                      required
                      defaultValue={userPhone}
                      placeholder="10-digit mobile number"
                      maxLength={10}
                      pattern="[6-9]\d{9}"
                      className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                    />
                  </div>
                </div>
                
                {/* Address Selector for logged-in users */}
                {session && (
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5">
                    <AddressSelector 
                      onAddressSelect={handleAddressSelect}
                      selectedAddressId={selectedAddress?.id}
                    />
                  </div>
                )}
                
                {/* Show full billing address form only if using new address or not logged in */}
                {(useNewAddress || !session) && (
                  <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mb-7.5">
                    <h3 className="font-medium text-lg text-dark mb-5">Billing Address</h3>
                    
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
                        <option value="Andhra Pradesh">Andhra Pradesh</option>
                        <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                        <option value="Assam">Assam</option>
                        <option value="Bihar">Bihar</option>
                        <option value="Chhattisgarh">Chhattisgarh</option>
                        <option value="Goa">Goa</option>
                        <option value="Gujarat">Gujarat</option>
                        <option value="Haryana">Haryana</option>
                        <option value="Himachal Pradesh">Himachal Pradesh</option>
                        <option value="Jharkhand">Jharkhand</option>
                        <option value="Karnataka">Karnataka</option>
                        <option value="Kerala">Kerala</option>
                        <option value="Madhya Pradesh">Madhya Pradesh</option>
                        <option value="Maharashtra">Maharashtra</option>
                        <option value="Manipur">Manipur</option>
                        <option value="Meghalaya">Meghalaya</option>
                        <option value="Mizoram">Mizoram</option>
                        <option value="Nagaland">Nagaland</option>
                        <option value="Odisha">Odisha</option>
                        <option value="Punjab">Punjab</option>
                        <option value="Rajasthan">Rajasthan</option>
                        <option value="Sikkim">Sikkim</option>
                        <option value="Tamil Nadu">Tamil Nadu</option>
                        <option value="Telangana">Telangana</option>
                        <option value="Tripura">Tripura</option>
                        <option value="Uttar Pradesh">Uttar Pradesh</option>
                        <option value="Uttarakhand">Uttarakhand</option>
                        <option value="West Bengal">West Bengal</option>
                        <option value="Delhi">Delhi</option>
                      </select>
                    </div>

                    <div>
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
                        className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full py-2.5 px-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                      />
                    </div>
                  </div>
                )}
                
                <Shipping />
                <div className="bg-white shadow-1 rounded-[10px] p-4 sm:p-8.5 mt-7.5">
                  <label htmlFor="notes" className="block mb-2.5">Other Notes (optional)</label>
                  <textarea
                    name="notes"
                    id="notes"
                    rows={5}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Notes about your order, e.g. special notes for delivery."
                    className="rounded-md border border-gray-3 bg-gray-1 placeholder:text-dark-5 w-full p-5 outline-none duration-200 focus:border-transparent focus:shadow-input focus:ring-2 focus:ring-blue/20"
                  ></textarea>
                </div>
              </div>

              {/* Checkout Right Column (Your Order Summary) */}
              <div className="max-w-[455px] w-full">
                <div className="bg-white shadow-1 rounded-[10px]">
                  <div className="border-b border-gray-3 py-5 px-4 sm:px-8.5">
                    <h3 className="font-medium text-xl text-dark">Your Order</h3>
                  </div>

                  <div className="pt-2.5 pb-8.5 px-4 sm:px-8.5">
                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <h4 className="font-medium text-dark">Product</h4>
                      <h4 className="font-medium text-dark text-right">Subtotal</h4>
                    </div>

                    {cartItems.length > 0 ? (
                      cartItems.map((item) => {
                        const priceToDisplay = item.discountedPrice || item.price;
                        
                        return (
                          <div key={item.id} className="flex items-center justify-between py-5 border-b border-gray-3">
                            <p className="text-dark">{item.title}</p>
                            <p className="text-dark text-right">₹{(priceToDisplay * item.quantity).toFixed(2)}</p>
                          </div>
                        );
                      })
                    ) : (
                      <div className="py-5">
                        <p className="text-dark text-center">Your cart is empty.</p>
                      </div>
                    )}

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="font-medium text-dark">Subtotal</p>
                      <p className="font-medium text-dark text-right">₹{subtotal.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between py-5 border-b border-gray-3">
                      <p className="text-dark">Shipping Fee</p>
                      <p className="text-dark text-right">₹{shippingFee.toFixed(2)}</p>
                    </div>

                    <div className="flex items-center justify-between pt-5">
                      <p className="font-medium text-lg text-dark">Total</p>
                      <p className="font-medium text-lg text-dark text-right">₹{total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>

                <Coupon />
                <PaymentMethod onPaymentChange={setPaymentMethod} />

                {error && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mt-4">
                    {error}
                  </div>
                )}

                {/* Proceed to Checkout Button */}
                <button
                  type="submit"
                  disabled={loading || cartItems.length === 0}
                  className="w-full flex justify-center font-medium text-white bg-blue py-3 px-6 rounded-md ease-out duration-200 hover:bg-blue-dark mt-7.5 disabled:bg-gray-400 disabled:cursor-not-allowed"
                >
                  {loading ? 'Processing...' : 'Proceed to Checkout'}
                </button>
                
                {paymentMethod === 'cash' && (
                  <p className="text-sm text-black text-center mt-3">
                    OTP will be sent to your email for verification
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>
      </section>

      {/* OTP Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 sm:p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold text-dark mb-3">Enter OTP</h3>
            <p className="text-gray-600 mb-2">
              We've sent a 6-digit OTP to <span className="font-medium text-dark">{checkoutData?.email}</span>
            </p>
            <p className="text-sm text-gray-500 mb-4">
              ⏱️ OTP expires in <span className="font-medium text-dark">5 minutes</span>
            </p>
            
            {/* Security Disclaimer */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-yellow-800">Security Notice</p>
                  <p className="text-xs text-yellow-700 mt-1">
                    Please don't share this OTP with anyone. Our team will never ask for your OTP.
                  </p>
                </div>
              </div>
            </div>
            
            <form onSubmit={handleVerifyAndPlaceOrder}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-3 rounded-md text-center text-2xl tracking-widest mb-3 focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none"
                autoFocus
              />
              
              {/* Resend OTP Button */}
              <div className="text-center mb-4">
                {resendTimer > 0 ? (
                  <p className="text-sm text-gray-500">
                    Resend OTP in <span className="font-medium text-dark">{resendTimer}s</span>
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={resendingOTP}
                    className="text-sm text-blue hover:text-blue-dark font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                  >
                    {resendingOTP ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
              
              {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-sm">
                  {error}
                </div>
              )}
              
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowOTPModal(false);
                    setOtp("");
                    setError("");
                    setResendTimer(0);
                  }}
                  className="flex-1 px-4 py-3 border border-gray-3 rounded-md hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 px-4 py-3 bg-blue text-white rounded-md hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Verifying...' : 'Verify & Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CheckoutWithOTP;
