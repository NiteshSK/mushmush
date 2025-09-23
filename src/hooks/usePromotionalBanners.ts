"use client";
import { useState, useEffect } from "react";
import { PromotionalBanner } from "@/types/promotional-banner";

export const usePromotionalBanners = () => {
  const [banners, setBanners] = useState<PromotionalBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentBannerIndex, setCurrentBannerIndex] = useState(0);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        console.log('🔍 Fetching banners from API...');
        const response = await fetch('/api/promotional-banners?limit=5');
        console.log('📡 Response status:', response.status);
        
        const data = await response.json();
        console.log('📦 API Response data:', data);
        
        if (data.success && data.data.length > 0) {
          console.log('✅ Setting banners:', data.data.length, 'banners found');
          setBanners(data.data);
        } else {
          console.log('❌ No banners found in API response');
          setBanners([]);
        }
      } catch (error) {
        console.error('❌ Error fetching promotional banners:', error);
        setBanners([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBanners();
  }, []);

  // Auto-rotate banners every 5 seconds if multiple banners exist
  useEffect(() => {
    if (banners.length <= 1) return;

    const interval = setInterval(() => {
      setCurrentBannerIndex((prevIndex) =>
        prevIndex === banners.length - 1 ? 0 : prevIndex + 1
      );
    }, 5000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [banners.length]);

  return {
    banners,
    loading,
    currentBannerIndex,
    setCurrentBannerIndex,
    hasBanners: banners.length > 0,
  };
};
