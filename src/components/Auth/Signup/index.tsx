import Link from "next/link";
import React from "react";

const Signup = () => {
  return (
    <section className="min-h-screen bg-cream flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-[480px]">
        <div className="text-center mb-10">
          <Link href="/" className="inline-block font-medium text-2xl text-dark mb-2">
            Kosvana
          </Link>
          <p className="text-sm text-gray-400">Create your account</p>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 sm:p-10">
          <div className="space-y-5">
            <button className="w-full flex items-center justify-center gap-3 rounded-full border border-gray-200 py-3 px-4 text-sm font-medium text-dark hover:bg-gray-50 transition-colors duration-200">
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <g clipPath="url(#clip0_98_7461)">
                  <mask id="mask0_98_7461" maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
                    <path d="M20 0H0V20H20V0Z" fill="white" />
                  </mask>
                  <g mask="url(#mask0_98_7461)">
                    <path d="M19.999 10.2218C20.0111 9.53429 19.9387 8.84791 19.7834 8.17737H10.2031V11.8884H15.8267C15.7201 12.5391 15.4804 13.162 15.1219 13.7195C14.7634 14.2771 14.2935 14.7578 13.7405 15.1328L13.7209 15.2571L16.7502 17.5568L16.96 17.5774C18.8873 15.8329 19.999 13.2661 19.999 10.2218Z" fill="#4285F4" />
                    <path d="M10.2036 20C12.9586 20 15.2715 19.1111 16.9609 17.5777L13.7409 15.1332C12.8793 15.7223 11.7229 16.1333 10.2036 16.1333C8.91317 16.126 7.65795 15.7206 6.61596 14.9746C5.57397 14.2287 4.79811 13.1802 4.39848 11.9777L4.2789 11.9877L1.12906 14.3766L1.08789 14.4888C1.93622 16.1457 3.23812 17.5386 4.84801 18.512C6.45791 19.4852 8.31194 20.0005 10.2036 20Z" fill="#34A853" />
                    <path d="M4.39899 11.9776C4.1758 11.3411 4.06063 10.673 4.05807 9.9999C4.06218 9.3279 4.1731 8.66067 4.38684 8.02221L4.38115 7.88959L1.1927 5.46234L1.0884 5.51095C0.372762 6.90337 0 8.44075 0 9.99983C0 11.5589 0.372762 13.0962 1.0884 14.4887L4.39899 11.9776Z" fill="#FBBC05" />
                    <path d="M10.2039 3.86663C11.6661 3.84438 13.0802 4.37803 14.1495 5.35558L17.0294 2.59997C15.1823 0.90185 12.7364 -0.0298855 10.2039 -3.67839e-05C8.31239 -0.000477835 6.45795 0.514733 4.84805 1.48799C3.23816 2.46123 1.93624 3.85417 1.08789 5.51101L4.38751 8.02225C4.79107 6.82005 5.5695 5.77231 6.61303 5.02675C7.65655 4.28119 8.91254 3.87541 10.2039 3.86663Z" fill="#EB4335" />
                  </g>
                </g>
                <defs>
                  <clipPath id="clip0_98_7461">
                    <rect width="20" height="20" fill="white" />
                  </clipPath>
                </defs>
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-4 text-xs text-gray-400">or continue with email</span>
            </div>
          </div>

          <form className="space-y-5">
            <div>
              <label htmlFor="name" className="block text-xs font-medium uppercase tracking-[0.15em] text-gray-500 mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                id="name"
                placeholder="Enter your full name"
                className="w-full rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-xs font-medium uppercase tracking-[0.15em] text-gray-500 mb-2">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Enter your email address"
                className="w-full rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-medium uppercase tracking-[0.15em] text-gray-500 mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                id="password"
                placeholder="Enter your password"
                autoComplete="on"
                className="w-full rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <div>
              <label htmlFor="re-type-password" className="block text-xs font-medium uppercase tracking-[0.15em] text-gray-500 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="re-type-password"
                id="re-type-password"
                placeholder="Re-type your password"
                autoComplete="on"
                className="w-full rounded-lg border border-gray-200 bg-white py-3 px-4 text-sm placeholder:text-gray-400 outline-none transition-colors duration-200 focus:border-forest focus:ring-2 focus:ring-forest/20"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-dark text-white text-sm font-medium py-3 px-8 rounded-full hover:bg-forest transition-colors duration-300"
            >
              Create Account
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{" "}
            <Link href="/signin" className="text-forest font-medium hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
};

export default Signup;
