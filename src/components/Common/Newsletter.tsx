"use client";

import React, { useState } from "react";
import { validateEmail } from "@/lib/validation";

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [fieldError, setFieldError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    if (emailErr) { setFieldError(emailErr); return; }
    setFieldError("");

    setStatus("loading");
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("success");
        setMessage("You're in! Check your inbox for a welcome email.");
        setEmail("");
      } else {
        setStatus("error");
        setMessage(data.error || "Something went wrong.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="py-16 sm:py-24">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
        <div className="bg-forest rounded-2xl px-6 sm:px-12 xl:px-16 py-14">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-md">
              <h2 className="font-medium text-2xl sm:text-3xl text-white mb-3">
                Join the Kosvana Community
              </h2>
              <p className="text-white/70 text-sm leading-relaxed">
                Get fresh recipes, growing tips, and exclusive offers delivered to your inbox.
              </p>
            </div>

            <div className="max-w-md w-full">
              {status === "success" ? (
                <div className="flex items-center gap-3 bg-white/10 border border-white/20 rounded-full py-3.5 px-6">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  <span className="text-white text-sm">{message}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmit}>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="w-full">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (status === "error") setStatus("idle");
                          if (fieldError) setFieldError("");
                        }}
                        placeholder="Enter your email"
                        className={`w-full bg-white/10 border text-white placeholder:text-white/40 outline-none rounded-full py-3.5 px-6 text-sm transition-colors ${fieldError ? 'border-red-400 focus:border-red-400' : 'border-white/20 focus:border-white/40'}`}
                      />
                      {fieldError && <p className="text-xs text-red-300 mt-1.5 pl-6">{fieldError}</p>}
                    </div>
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="inline-flex justify-center py-3.5 px-8 text-forest bg-white font-medium text-sm rounded-full ease-out duration-200 hover:bg-white/90 whitespace-nowrap disabled:opacity-60"
                    >
                      {status === "loading" ? "Subscribing..." : "Subscribe"}
                    </button>
                  </div>
                  {status === "error" && (
                    <p className="text-white/70 text-xs mt-2 pl-6">{message}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;
