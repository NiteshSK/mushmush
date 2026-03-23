"use client";
import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { passwordRequirementsText } from "@/lib/validation";
import Image from "next/image";
import Link from "next/link";

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const tokenParam = searchParams.get('token');
    if (!tokenParam) {
      setError('Invalid reset link. Please request a new password reset.');
      return;
    }
    setToken(tokenParam);
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      setError("Passwords don't match!");
      return;
    }

    const policy = /^(?=.*[A-Z])(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!policy.test(password)) {
      setError(passwordRequirementsText + "!");
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Password reset successfully! Redirecting to sign in...');
        setTimeout(() => {
          router.push('/auth/signin');
        }, 2000);
      } else {
        setError(data.error || 'An error occurred');
      }
    } catch (error) {
      console.error("Reset password error:", error);
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!token && !error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    );
  }

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
          <h1 className="font-medium text-2xl text-dark mb-2">Reset your password</h1>
          <p className="text-sm text-gray-400">Enter your new password below</p>
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

          {!error.includes('Invalid reset link') && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label htmlFor="password" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                  New Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                  placeholder="Enter new password"
                  minLength={8}
                />
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
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                  placeholder="Confirm new password"
                  minLength={8}
                />
              </div>

              <p className="text-xs text-gray-400">{passwordRequirementsText}</p>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-forest text-white py-3.5 rounded-full text-sm font-medium hover:bg-dark transition-colors duration-300 disabled:opacity-50"
              >
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}
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

export default function ResetPassword() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-white px-4 py-20">
        <p className="text-gray-400">Loading...</p>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
