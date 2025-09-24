"use client";

import React, { useState, useEffect } from "react";

interface FestiveWrapperProps {
  children: React.ReactNode;
  className?: string;
  sparkleCount?: number;
  mushroomCount?: number;
  backgroundGradient?: string;
  enableFestiveEffects?: boolean;
  useGlobalSetting?: boolean;
}

interface SparkleConfig {
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
  backgroundColor: string;
}

interface MushroomConfig {
  left: number;
  top: number;
  animationDelay: number;
  animationDuration: number;
  rotation: number;
  scale: number;
  opacity: number;
}

const FestiveWrapper: React.FC<FestiveWrapperProps> = ({
  children,
  className = "",
  sparkleCount = 50,
  mushroomCount = 30,
  backgroundGradient = "from-[#E9E6F4] to-white",
  enableFestiveEffects = true,
  useGlobalSetting = true,
}) => {
  const [sparkleConfigs, setSparkleConfigs] = useState<SparkleConfig[]>([]);
  const [mushroomConfigs, setMushroomConfigs] = useState<MushroomConfig[]>([]);
  const [isClient, setIsClient] = useState(false);
  const [globalFestiveEnabled, setGlobalFestiveEnabled] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Function to fetch global festive effects setting
    const fetchGlobalSetting = async () => {
      if (useGlobalSetting) {
        try {
          const res = await fetch('/api/site-settings');
          const data = await res.json();
          setGlobalFestiveEnabled(data.enableFestiveEffects || false);
        } catch (error) {
          console.error('Error fetching festive effects setting:', error);
          setGlobalFestiveEnabled(false);
        }
      }
    };
    
    // Initial fetch
    fetchGlobalSetting();
    
    // Set up periodic refresh every 30 seconds to check for setting changes
    const intervalId = setInterval(fetchGlobalSetting, 30000);
    
    // Generate sparkle configurations
    const newSparkleConfigs: SparkleConfig[] = Array.from({ length: sparkleCount }, () => ({
      left: Math.random() * 100,
      top: Math.random() * 100,
      animationDelay: Math.random() * 5,
      animationDuration: 3 + Math.random() * 4,
      backgroundColor: ['#f87171', '#fbbf24', '#a78bfa', '#60a5fa'][Math.floor(Math.random() * 4)],
    }));
    
    // Generate mushroom configurations
    const newMushroomConfigs: MushroomConfig[] = Array.from({ length: mushroomCount }, () => ({
      left: Math.random() * 100,
      top: -Math.random() * 30,
      animationDelay: Math.random() * 7,
      animationDuration: 10 + Math.random() * 8,
      rotation: Math.random() * 360,
      scale: 0.8 + Math.random() * 0.4,
      opacity: 0.7 + Math.random() * 0.3,
    }));
    
    setSparkleConfigs(newSparkleConfigs);
    setMushroomConfigs(newMushroomConfigs);
    
    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, [sparkleCount, mushroomCount, useGlobalSetting]);

  // Determine if festive effects should be enabled
  const shouldEnableEffects = useGlobalSetting 
  ? (isClient ? globalFestiveEnabled : false) // Don't show effects until client-side and API response
  : enableFestiveEffects;
  
  // Debug logging - remove this after fixing
  console.log('🎄 FestiveWrapper Debug:', {
    useGlobalSetting,
    globalFestiveEnabled,
    enableFestiveEffects,
    shouldEnableEffects,
    isClient
  });

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {/* Full section festive background elements - z-index below content */}
      {shouldEnableEffects && (
        <div className="absolute inset-0 z-0 pointer-events-none">
          {/* Effect 1: Sparkle Dots across the whole section */}
          {isClient && sparkleConfigs.map((config, i) => (
            <div
              key={`festive-sparkle-dots-${i}`}
              className="absolute w-2 h-2 rounded-full bg-red-400 animate-section-sparkle"
              style={{
                left: `${config.left}%`,
                top: `${config.top}%`,
                animationDelay: `${config.animationDelay}s`,
                animationDuration: `${config.animationDuration}s`,
                backgroundColor: config.backgroundColor,
              }}
            />
          ))}
          {/* Soft pulse overlay for the entire section */}
          <div className="absolute inset-0 bg-purple-200/10 animate-pulse-soft"></div>

          {/* Mushroom "Confetti" falling for the entire section */}
          {isClient && mushroomConfigs.map((config, i) => (
            <div
              key={`festive-falling-mushroom-${i}`}
              className="absolute text-2xl animate-mushroom-fall z-0"
              style={{
                left: `${config.left}%`,
                top: `${config.top}%`,
                animationDelay: `${config.animationDelay}s`,
                animationDuration: `${config.animationDuration}s`,
                transform: `rotate(${config.rotation}deg) scale(${config.scale})`,
                opacity: config.opacity,
              }}
            >
              🍄
            </div>
          ))}
        </div>
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};

export default FestiveWrapper;
