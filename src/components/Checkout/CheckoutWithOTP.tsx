// Checkout component with OTP verification
"use client";
import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { selectCartItems, selectTotalPrice } from "@/redux/features/cart-slice";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";

import Breadcrumb from "../Common/Breadcrumb";
import Login from "./Login";
import Shipping from "./Shipping";
import PaymentMethod from "./PaymentMethod";
import Coupon from "./Coupon";
import Billing from "./Billing";
import AddressSelector from "./AddressSelector";

interface SavedAddress {
  id: string;
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  type: string;
  isDefault: boolean;
}

const CheckoutWithOTP = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { data: session } = useSession();
  
  const cartItems = useSelector(selectCartItems);
  const subtotal = useSelector(selectTotalPrice);
  
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash"); // Default to COD
  const [checkoutData, setCheckoutData] = useState<any>(null); // Store form data
  const [selectedAddress, setSelectedAddress] = useState<SavedAddress | null>(null);
  const [useNewAddress, setUseNewAddress] = useState(false);
  const [useShippingAddress, setUseShippingAddress] = useState(false); // Track if using shipping section
  const [userPhone, setUserPhone] = useState<string>(""); // Store user's phone from database
  
  const shippingFee = 50.00;
  const total = subtotal + shippingFee;

  // Fetch user's phone number from database when logged in
  useEffect(() => {
    const fetchUserPhone = async () => {
      if (session?.user?.email) {
        try {
          const response = await fetch(`/api/user/profile?email=${encodeURIComponent(session.user.email)}`);
          if (response.ok) {
            const data = await response.json();
            if (data.phone) {
              setUserPhone(data.phone);
            }
          }
        } catch (error) {
          console.error('Error fetching user phone:', error);
        }
      }
    };
    
    fetchUserPhone();
  }, [session]);

  // Handle address selection from saved addresses
  const handleAddressSelect = (address: SavedAddress | null) => {
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

      // Priority: 1. Saved address, 2. Shipping section, 3. Billing section
      if (selectedAddress && !useNewAddress) {
        // Using saved address
        addressData = {
          street: selectedAddress.street,
          city: selectedAddress.city,
          state: selectedAddress.state,
          zip: selectedAddress.zip,
          country: selectedAddress.country
        };
        console.log('✅ Using saved address');
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
          toast.success(`OTP sent to ${email}! Please check your inbox.`, { duration: 6000 });
        } else {
          console.error('Failed to send OTP:', data);
          setError(data.error || 'Failed to send OTP');
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
                <Login />
                
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4">
            <h3 className="text-2xl font-bold text-dark mb-4">Enter OTP</h3>
            <p className="text-gray-600 mb-6">
              We've sent a 6-digit OTP to your email. Please enter it below to complete your order.
            </p>
            
            <form onSubmit={handleVerifyAndPlaceOrder}>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full px-4 py-3 border border-gray-3 rounded-md text-center text-2xl tracking-widest mb-4"
                autoFocus
              />
              
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
                  }}
                  className="flex-1 px-4 py-3 border border-gray-3 rounded-md hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="flex-1 px-4 py-3 bg-blue text-white rounded-md hover:bg-blue-dark disabled:bg-gray-400 disabled:cursor-not-allowed"
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
