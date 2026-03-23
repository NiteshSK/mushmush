"use client";
import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import toast from 'react-hot-toast';

interface NotifyMeModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  productTitle: string;
}

const NotifyMeModal: React.FC<NotifyMeModalProps> = ({
  isOpen,
  onClose,
  productId,
  productTitle
}) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Set email from session when available
  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // If user is not authenticated, redirect to login
    if (status === 'unauthenticated') {
      toast.error('Please sign in to get notified when products are back in stock');
      router.push('/auth/signin');
      onClose();
      return;
    }
    
    // Use session email or fallback to manual input
    const userEmail = session?.user?.email || email.trim();
    
    if (!userEmail) {
      toast.error('Email address is required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: userEmail,
          productId
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Successfully subscribed! We\'ll notify you when this product is back in stock.');
        setEmail('');
        onClose();
      } else {
        toast.error(data.error || 'Failed to subscribe for notifications');
      }
    } catch (error) {
      console.error('Notification subscription error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) {
    return null;
  }

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl max-w-[420px] w-full p-8 relative">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-forest border-t-transparent mx-auto mb-4"></div>
            <p className="text-sm text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-[420px] w-full relative overflow-hidden">
        {/* Green header bar */}
        <div className="bg-forest/5 border-b border-forest/10 px-6 py-5 flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-forest">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h2 className="font-medium text-lg text-dark">
                Get Notified
              </h2>
            </div>
            <p className="text-sm text-gray-500 leading-relaxed">
              {session?.user?.email ? (
                <>We'll email <span className="text-dark font-medium">{session.user.email}</span> when <span className="text-dark font-medium">{productTitle}</span> is back in stock.</>
              ) : (
                <>Enter your email to be notified when <span className="text-dark font-medium">{productTitle}</span> is back.</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-dark hover:bg-gray-100 transition-colors -mt-1 -mr-1"
            disabled={isLoading}
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-4">
            {!session?.user?.email && (
              <div>
                <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 border border-gray-200 text-dark text-sm font-medium rounded-full hover:bg-gray-50 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-forest text-white text-sm font-medium rounded-full hover:bg-dark transition-colors duration-300 disabled:opacity-50"
                disabled={isLoading}
              >
                {isLoading ? 'Subscribing...' : (session?.user?.email ? 'Notify Me' : 'Sign In & Notify')}
              </button>
            </div>
          </form>

          <p className="text-[11px] text-gray-400 mt-4 text-center">
            We'll only email you about this product. Unsubscribe anytime.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotifyMeModal;
