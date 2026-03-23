"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { validateEmail } from "@/lib/validation";

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailErr = validateEmail(email);
    if (emailErr) {
      setFieldError(emailErr);
      return;
    }
    setFieldError('');
    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error("Forgot password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

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
          <h1 className="font-medium text-2xl text-dark mb-2">Forgot your password?</h1>
          <p className="text-sm text-gray-400">Enter your email and we&apos;ll send you a reset link</p>
        </div>

        {/* Card */}
        <div className="bg-forest/5 rounded-2xl p-8 border border-forest/15">
          {message && (
            <div className="mb-6 p-4 bg-forest/10 border border-forest/20 rounded-xl">
              <p className="text-sm text-dark">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 bg-red/10 border border-red/20 rounded-xl">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); if (fieldError) setFieldError(''); }}
                className={`w-full bg-white border rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:ring-1 transition-colors ${fieldError ? 'border-red-400 focus:border-red-400 focus:ring-red-200' : 'border-forest/15 focus:border-forest focus:ring-forest/20'}`}
                placeholder="you@example.com"
              />
              {fieldError && <p className="text-xs text-red-500 mt-1.5">{fieldError}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-forest text-white py-3.5 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
            >
              {isLoading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        </div>

        <p className="text-center mt-6 text-sm text-gray-400">
          <Link href="/auth/signin" className="text-dark hover:text-forest transition-colors font-medium">
            Back to Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
