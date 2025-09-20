"use client";
import React, { useState, useEffect, useCallback } from "react";
import { Product } from "@/types/product";
import Image from 'next/image';
import { createPortal } from 'react-dom';

interface MushroomBenefitsIconProps {
  product: Product;
  className?: string;
  position?: {
    bottom?: string;
    left?: string;
    right?: string;
  };
}

const MushroomBenefitsIcon: React.FC<MushroomBenefitsIconProps> = ({ 
  product, 
  className = "",
  position = { bottom: "4", left: "7" }
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [benefits, setBenefits] = useState<any>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleIconClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Parse benefits from product data
    if (product.benefits) {
      try {
        const parsedBenefits = typeof product.benefits === 'string' 
          ? JSON.parse(product.benefits) 
          : product.benefits;
        setBenefits(parsedBenefits);
      } catch (error) {
        console.error('Error parsing benefits:', error);
        setBenefits(null);
      }
    }
    
    setIsModalOpen(true);
    setIsAnimating(true);
    setTimeLeft(10);
  };

  const closeModal = useCallback(() => {
    setIsAnimating(false);
    setTimeout(() => {
      setIsModalOpen(false);
      setBenefits(null);
    }, 200);
  }, []);

  // Handle ESC key press
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('keydown', handleEscKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey);
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen, closeModal]);

  // Handle click outside modal
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const modal = document.querySelector('.benefits-modal-content');
      if (modal && !modal.contains(event.target as Node) && isModalOpen) {
        closeModal();
      }
    };

    if (isModalOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isModalOpen, closeModal]);

  useEffect(() => {
    if (isModalOpen) {
      const intervalId = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearInterval(intervalId);
    }
  }, [isModalOpen, timeLeft]);

  useEffect(() => {
    if (timeLeft === 0) {
      closeModal();
    }
  }, [timeLeft, closeModal]);

  // Check if product has benefits
  const hasBenefits = product.benefits && 
    ((typeof product.benefits === 'string' && product.benefits.trim() !== '') ||
     (typeof product.benefits === 'object' && Object.keys(product.benefits).length > 0));

  if (!hasBenefits) {
    return null;
  }

  return (
    <>
      {/* Eye-catching Mushroom Icon Button */}
      <button
        onClick={handleIconClick}
        className={`absolute ${position.bottom ? `bottom-${position.bottom} !important` : 'bottom-3 !important'} ${position.left ? `left-${position.left} !important` : ''} ${position.right ? `right-${position.right} !important` : ''} w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 z-20 ${className}
          bg-gradient-to-br from-amber-200 via-orange-200 to-amber-200
          hover:from-amber-300 hover:via-orange-300 hover:to-amber-300
          shadow-lg hover:shadow-2xl
          border-2 border-amber-300 hover:border-amber-400
          transform hover:scale-110
          group
          backdrop-blur-sm
          animate-float`}
        aria-label="View mushroom benefits"
        title="Discover the amazing benefits of this mushroom"
        style={{
          animation: 'float 3s ease-in-out infinite',
          boxShadow: '0 4px 15px rgba(251, 191, 36, 0.4), 0 0 20px rgba(251, 191, 36, 0.2)'
        }}
      >
        <div className="relative">
          {/* Pulsing glow effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full opacity-60 group-hover:opacity-80 blur-md transition-opacity duration-300 animate-pulse"></div>
          
          {/* Enhanced mushroom icon with rotation */}
          <div className="relative animate-pulse-slow">
            <Image
              src="/images/icons/mushroom.png"
              alt="Mushroom Icon"
              width={25}
              height={25}
              className="drop-shadow-lg filter group-hover:brightness-110 transition-all duration-300 group-hover:rotate-12"
            />
          </div>
          
          {/* Sparkle effects */}
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-yellow-300 rounded-full animate-sparkle opacity-80"></div>
          <div className="absolute -bottom-2 -left-1 w-1.5 h-1.5 bg-amber-300 rounded-full animate-sparkle-delayed opacity-60"></div>
        </div>
        
        {/* Enhanced benefits label with animation */}
        <span className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 text-xs font-bold text-amber-900 whitespace-nowrap bg-white/95 px-2 py-1 rounded-md shadow-md border-2 border-amber-300 animate-bounce-slow">
          Benefits
        </span>
        
        {/* Attention-grabbing ring animation */}
        <div className="absolute inset-0 rounded-full border-2 border-amber-400 opacity-0 group-hover:opacity-100 animate-ping-slow"></div>
      </button>

      {/* Add custom animations to head */}
      {isClient && (
        <style jsx global>{`
          @keyframes float {
            0%, 100% { transform: translateY(0px); }
            50% { transform: translateY(-8px); }
          }
          
          @keyframes pulse-slow {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.05); }
          }
          
          @keyframes bounce-slow {
            0%, 100% { transform: translateX(-50%) translateY(0px); }
            50% { transform: translateX(-50%) translateY(-2px); }
          }
          
          @keyframes sparkle {
            0%, 100% { opacity: 0.8; transform: scale(1); }
            50% { opacity: 1; transform: scale(1.2); }
          }
          
          @keyframes sparkle-delayed {
            0%, 100% { opacity: 0.6; transform: scale(1); }
            50% { opacity: 0.9; transform: scale(1.1); }
          }
          
          @keyframes ping-slow {
            0% { transform: scale(0.8); opacity: 1; }
            70%, 100% { transform: scale(1.3); opacity: 0; }
          }
          
          .animate-float {
            animation: float 3s ease-in-out infinite;
          }
          
          .animate-pulse-slow {
            animation: pulse-slow 2s ease-in-out infinite;
          }
          
          .animate-bounce-slow {
            animation: bounce-slow 2s ease-in-out infinite;
          }
          
          .animate-sparkle {
            animation: sparkle 1.5s ease-in-out infinite;
          }
          
          .animate-sparkle-delayed {
            animation: sparkle-delayed 1.5s ease-in-out infinite 0.5s;
          }
          
          .animate-ping-slow {
            animation: ping-slow 2s ease-in-out infinite;
          }
        `}</style>
      )}

      {/* Enhanced Benefits Modal */}
      {isModalOpen && isClient && createPortal(
        <div className={`fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center !z-[99999] p-2 transition-opacity duration-200 ${isAnimating ? 'opacity-100' : 'opacity-0'} isolate`}>
          <div className={`benefits-modal-content bg-white rounded-2xl w-auto max-w-[90vw] max-h-[90vh] overflow-hidden shadow-2xl border border-gray-100 transform transition-all duration-300 ${isAnimating ? 'scale-100 opacity-100' : 'scale-95 opacity-0'} !z-[99998] relative`}>
            {/* Modal Header with gradient background */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-3 text-gray-900 relative overflow-hidden">
              {/* Decorative pattern */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute top-0 left-0 w-full h-full bg-repeat" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'3\' cy=\'3\' r=\'2\' fill=\'white\'/%3E%3Ccircle cx=\'17\' cy=\'17\' r=\'2\' fill=\'white\'/%3E%3C/svg%3E")', backgroundSize: '20px 20px' }}></div>
              </div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-2xl font-bold">
                    {product.title} Benefits
                  </h3>
                  <button
                    onClick={closeModal}
                    className="w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110 backdrop-blur-sm"
                    aria-label="Close modal"
                  >
                    <svg
                      className="w-6 h-6"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-amber-100 text-sm">
                  Discover the natural health benefits of this amazing mushroom
                </p>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {benefits ? (
                <div className="space-y-6">
                  {typeof benefits === 'object' ? (
                    Object.entries(benefits).map(([key, value]) => (
                      <div key={key} className="relative group">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full group-hover:from-amber-500 group-hover:to-orange-500 transition-all duration-300"></div>
                        <div className="pl-6">
                          <h4 className="font-bold text-gray-800 mb-2 text-lg capitalize flex items-center">
                            <span className="w-2 h-2 bg-amber-400 rounded-full mr-3 group-hover:scale-125 transition-transform duration-300"></span>
                            {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                          </h4>
                          <p className="text-gray-600 leading-relaxed pl-5 border-l-2 border-amber-100">
                            {typeof value === 'string' ? value : JSON.stringify(value)}
                          </p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="relative group">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-amber-400 to-orange-400 rounded-full"></div>
                      <div className="pl-6">
                        <p className="text-gray-600 leading-relaxed pl-5 border-l-2 border-amber-100">
                          {benefits}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-gray-500 text-lg">No benefits information available.</p>
                </div>
              )}

              {/* Enhanced Footer */}
              <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                <div className="text-sm text-gray-500 flex items-center gap-2">
                  <span>Auto-closes in:</span>
                  <span className={`font-mono px-2 py-1 rounded text-xs ${timeLeft <= 3 ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600'}`}>
                    {timeLeft}s
                  </span>
                  <span>• Press <kbd className="px-2 py-1 bg-gray-100 rounded text-xs">ESC</kbd> to close</span>
                </div>
                <button
                  onClick={closeModal}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 hover:shadow-lg transform hover:scale-105"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};

export default MushroomBenefitsIcon;
