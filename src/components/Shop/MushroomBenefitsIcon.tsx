"use client";
import React, { useState } from "react";
import { Product } from "@/types/product";
import Image from 'next/image';

interface MushroomBenefitsIconProps {
  product: Product;
  className?: string;
}

const MushroomBenefitsIcon: React.FC<MushroomBenefitsIconProps> = ({ 
  product, 
  className = "" 
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [benefits, setBenefits] = useState<any>(null);

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
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setBenefits(null);
  };

// Check if product has benefits
const hasBenefits = product.benefits && 
  ((typeof product.benefits === 'string' && product.benefits.trim() !== '') ||
   (typeof product.benefits === 'object' && Object.keys(product.benefits).length > 0));

// if (!hasBenefits) {
//   return null;
// }

  return (
    <>
      {/* Mushroom Icon */}
      <button
        onClick={handleIconClick}
        className={`absolute top-3 left-10 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 bg-orange-500 text-red-500 hover:bg-orange-600 z-10 ${className}`}
        aria-label="View mushroom benefits"
        title="Click me"
      >
        <Image
          src="/images/icons/mushroom.png"
          alt="Mushroom Icon"
          width={37}
          height={37}
        />
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
        </span>
        <span className="text-xs text-blue font-medium mt-1 block">
        Benefits
        </span>
      </button>

      {/* Benefits Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold text-dark">
                  {product.title} Benefits
                </h3>
                <button
                  onClick={closeModal}
                  className="text-gray-500 hover:text-gray-700"
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

              {benefits ? (
                <div className="space-y-4">
                  {typeof benefits === 'object' ? (
                    Object.entries(benefits).map(([key, value]) => (
                      <div key={key} className="border-l-4 border-orange-500 pl-4">
                        <h4 className="font-semibold text-dark mb-1 capitalize">
                          {key.replace(/([A-Z])/g, ' $1').trim()}
                        </h4>
                        <p className="text-gray-600">
                          {typeof value === 'string' ? value : JSON.stringify(value)}
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="border-l-4 border-orange-500 pl-4">
                      <p className="text-gray-600">{benefits}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No benefits information available.</p>
                </div>
              )}

              <div className="mt-6 flex justify-end">
                <button
                  onClick={closeModal}
                  className="bg-blue text-white px-4 py-2 rounded-md hover:bg-blue-dark transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MushroomBenefitsIcon;
