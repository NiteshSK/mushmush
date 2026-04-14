"use client";

import React from "react";
import { ShoppingCart, Star, Package } from "lucide-react";

export interface ChatProduct {
  id: number;
  title: string;
  slug: string;
  price: number;
  discountedPrice: number | null;
  discountPercentage: number;
  hasDiscount: boolean;
  inStock: boolean;
  imgs: { thumbnails: string[]; previews: string[] };
  averageRating: number;
  reviewCount: number;
  measurementValue: number;
  measurementType: string;
  stockQuantity?: number;
}

interface ChatProductCardProps {
  product: ChatProduct;
  onBuy: (product: ChatProduct) => void;
}

const ChatProductCard: React.FC<ChatProductCardProps> = ({ product, onBuy }) => {
  const thumbnail = product.imgs?.thumbnails?.[0] || product.imgs?.previews?.[0] || "/images/placeholder.png";
  const finalPrice = product.hasDiscount && product.discountedPrice ? product.discountedPrice : product.price;

  return (
    <div className="flex gap-3 bg-white border border-gray-200 rounded-xl p-3 hover:shadow-sm transition-shadow">
      {/* Image */}
      <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-gray-50">
        <img
          src={thumbnail}
          alt={product.title}
          className="w-full h-full object-cover"
          onError={(e) => { (e.target as HTMLImageElement).src = "/images/placeholder.png"; }}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h4 className="text-xs font-semibold text-gray-800 truncate leading-tight">{product.title}</h4>

        <div className="flex items-center gap-1 mt-0.5">
          {product.averageRating > 0 && (
            <>
              <Star size={10} className="fill-amber-400 text-amber-400" />
              <span className="text-[10px] text-gray-500">{product.averageRating.toFixed(1)}</span>
            </>
          )}
          <span className="text-[10px] text-gray-400">
            {product.measurementValue}{product.measurementType}
          </span>
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-gray-900">₹{finalPrice}</span>
            {product.hasDiscount && product.discountedPrice && (
              <>
                <span className="text-[10px] text-gray-400 line-through">₹{product.price}</span>
                <span className="text-[10px] font-medium text-green-600">{product.discountPercentage}% off</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Buy Button */}
      <div className="flex-shrink-0 flex items-center">
        {product.inStock ? (
          <button
            onClick={() => onBuy(product)}
            className="flex items-center gap-1 bg-forest text-white text-[10px] font-semibold px-3 py-1.5 rounded-full hover:bg-green-700 transition-colors"
          >
            <ShoppingCart size={10} />
            Buy
          </button>
        ) : (
          <span className="flex items-center gap-1 text-[10px] text-gray-400 bg-gray-100 px-2.5 py-1.5 rounded-full">
            <Package size={10} />
            Sold out
          </span>
        )}
      </div>
    </div>
  );
};

export default ChatProductCard;
