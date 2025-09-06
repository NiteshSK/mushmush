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
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
          disabled={isLoading}
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-dark mb-2">
            Get Notified
          </h2>
          {session?.user?.email ? (
            <p className="text-gray-600">
              We'll notify <strong>{session.user.email}</strong> when <strong>{productTitle}</strong> is back in stock.
            </p>
          ) : (
            <p className="text-gray-600">
              Enter your email to be notified when <strong>{productTitle}</strong> is back in stock.
            </p>
          )}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Only show email input if user is not authenticated */}
          {!session?.user?.email && (
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-dark mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue focus:border-transparent"
                disabled={isLoading}
                required
              />
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-3 bg-blue text-white rounded-md hover:bg-blue-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? 'Subscribing...' : (session?.user?.email ? 'Notify Me' : 'Sign In & Notify')}
            </button>
          </div>
        </form>

        {/* Privacy note */}
        <p className="text-xs text-gray-500 mt-4 text-center">
          We'll only use your email to notify you about this product. You can unsubscribe at any time.
        </p>
      </div>
    </div>
  );
};

export default NotifyMeModal;
