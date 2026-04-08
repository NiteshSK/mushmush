"use client";
import { signIn, getSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { validateEmail, validateName, validatePhone, validatePasswordPolicy, passwordRequirementsText } from "@/lib/validation";

type FormErrors = { name?: string; email?: string; phone?: string; password?: string; confirmPassword?: string; terms?: string; form?: string };

export default function SignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [successMsg, setSuccessMsg] = useState('');
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const router = useRouter();

  useEffect(() => {
    getSession().then((session) => {
      if (session) {
        router.push("/");
      }
    });
  }, [router]);

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    try {
      await signIn("google", { callbackUrl: "/" });
    } catch (error) {
      console.error("Sign up error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [name]: undefined, form: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: FormErrors = {};

    const nameErr = validateName(formData.name, 'Full Name');
    if (nameErr) newErrors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) newErrors.email = emailErr;

    const phoneErr = validatePhone(formData.phone);
    if (phoneErr) newErrors.phone = phoneErr;

    const pwResult = validatePasswordPolicy(formData.password);
    if (!pwResult.valid) newErrors.password = pwResult.error;

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords don't match";
    }

    const termsCheckbox = document.getElementById('agree-terms') as HTMLInputElement;
    if (!termsCheckbox?.checked) {
      newErrors.terms = 'Please agree to the Terms of Service and Privacy Policy';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsLoading(true);
    try {
      // Step 1: Send OTP to verify email
      const response = await fetch('/api/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOTPModal(true);
        setResendTimer(60);
      } else {
        setErrors({ form: data.error || 'Failed to send OTP. Please try again.' });
      }
    } catch {
      setErrors({ form: "An error occurred. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  // Step 2: Verify OTP and create account
  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      setOtpError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setOtpError('');
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone || undefined,
          password: formData.password,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setShowOTPModal(false);
        setSuccessMsg(`Account created! Redirecting to sign in...`);
        setTimeout(() => router.push('/auth/signin'), 2000);
      } else {
        setOtpError(data.error || 'Verification failed. Please try again.');
      }
    } catch {
      setOtpError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/send-signup-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          phone: formData.phone || undefined,
        }),
      });
      if (response.ok) {
        setResendTimer(60);
        setOtpError('');
        setOtp('');
      }
    } catch {} finally {
      setIsLoading(false);
    }
  };

  // Resend timer countdown
  useEffect(() => {
    if (resendTimer <= 0) return;
    const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendTimer]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4 py-20">
      <div className="max-w-[420px] w-full">
        {/* Header */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-6">
            <Image
              src="/images/logo/logo.png"
              alt="Kosvana"
              width={120}
              height={40}
              className="h-10 w-auto mx-auto"
            />
          </Link>
          <h1 className="font-medium text-2xl text-dark mb-2">Create your account</h1>
          <p className="text-sm text-gray-400">Join Kosvana and discover premium natural products</p>
        </div>

        {/* Card */}
        <div className="bg-forest/5 rounded-2xl p-8 border border-forest/15">
          {/* Google Button */}
          <button
            onClick={handleGoogleSignUp}
            disabled={isLoading}
            className="flex items-center justify-center gap-3 w-full bg-white border border-gray-200 rounded-full py-3 text-sm text-dark hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dark"></div>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 20 20" fill="none">
                  <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4" />
                  <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853" />
                  <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05" />
                  <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335" />
                </svg>
                Continue with Google
              </>
            )}
          </button>

          {/* Divider */}
          <div className="my-6">
            <div className="border-t border-forest/15 mb-4"></div>
            <p className="text-center text-xs text-gray-400">or continue with email</p>
          </div>

          {/* Email Form */}
          {successMsg && (
            <div className="mb-4 p-3 bg-forest/10 border border-forest/20 rounded-xl">
              <p className="text-sm text-dark">{successMsg}</p>
            </div>
          )}
          {errors.form && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-sm text-red-600">{errors.form}</p>
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                autoComplete="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${errors.name ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="Enter your full name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1.5">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${errors.email ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="you@example.com"
              />
              {errors.email && <p className="text-xs text-red-500 mt-1.5">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Phone Number <span className="normal-case tracking-normal text-gray-300">(optional)</span>
              </label>
              <input
                id="phone"
                name="phone"
                type="tel"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${errors.phone ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="+91 XXXXX XXXXX"
              />
              {errors.phone && <p className="text-xs text-red-500 mt-1.5">{errors.phone}</p>}
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${errors.password ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="Create a password"
              />
              {errors.password && <p className="text-xs text-red-500 mt-1.5">{errors.password}</p>}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${errors.confirmPassword ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-xs text-red-500 mt-1.5">{errors.confirmPassword}</p>}
            </div>

            <p className="text-xs text-gray-400">{passwordRequirementsText}</p>

            <div>
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-forest focus:ring-forest/20 border-gray-300 rounded"
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-500">
                  I agree to the{" "}
                  <a href="#" className="text-dark hover:text-forest transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="#" className="text-dark hover:text-forest transition-colors">
                    Privacy Policy
                  </a>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-500 mt-1.5">{errors.terms}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest text-white py-3.5 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading ? "Creating account..." : "Create Account"}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          Already have an account?{" "}
          <Link href="/auth/signin" className="text-dark hover:text-forest transition-colors font-medium">
            Sign In
          </Link>
        </p>
      </div>

      {/* OTP Verification Modal */}
      {showOTPModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-8">
            <h3 className="text-xl font-semibold text-dark mb-2">Verify Your Email</h3>
            <p className="text-sm text-gray-500 mb-1">
              We've sent a 6-digit OTP to <span className="font-medium text-dark">{formData.email}</span>
            </p>
            <p className="text-xs text-gray-400 mb-6">OTP expires in 5 minutes</p>

            <div className="mb-4">
              <input
                type="text"
                value={otp}
                onChange={(e) => {
                  const val = e.target.value.replace(/\D/g, '').slice(0, 6);
                  setOtp(val);
                  setOtpError('');
                }}
                placeholder="Enter 6-digit OTP"
                maxLength={6}
                className="w-full text-center text-2xl font-mono tracking-[0.5em] bg-gray-1 border border-gray-200 rounded-lg py-4 px-4 outline-none focus:ring-2 focus:ring-forest/20 focus:border-forest"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && otp.length === 6) handleVerifyOTP();
                }}
              />
              {otpError && <p className="text-sm text-red-500 mt-2 text-center">{otpError}</p>}
            </div>

            <button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full bg-forest text-white py-3 rounded-full text-sm font-medium hover:bg-dark transition-colors disabled:opacity-50 mb-3"
            >
              {isLoading ? 'Verifying...' : 'Verify & Create Account'}
            </button>

            <div className="flex items-center justify-between">
              <button
                onClick={() => { setShowOTPModal(false); setOtp(''); setOtpError(''); }}
                className="text-sm text-gray-400 hover:text-dark transition-colors"
              >
                Back
              </button>
              <button
                onClick={handleResendOTP}
                disabled={resendTimer > 0 || isLoading}
                className="text-sm text-forest hover:text-dark transition-colors disabled:text-gray-300"
              >
                {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
