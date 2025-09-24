"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import HeroFeature from "./HeroFeature";
import Image from "next/image";
import FestiveWrapper from "@/components/FestiveWrapper";

const Hero = () => {
  // Array of image sources
  const images = [
    // "/images/categories/hero_mushrooms.png",
    // "/images/-categories/hero_mushrooms_1.png", // Add the path to your second image
    "/images/categories/hero_mushrooms_2.png",
    "/images/categories/hero_mushrooms_3.png", // Add the path to your third image
    "/images/categories/hero_mushrooms_4.png",
  ];

  // State to keep track of the current image index
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Set up an interval to change the image every 3 seconds (3000 milliseconds)
    const interval = setInterval(() => {
      setCurrentImageIndex((prevIndex) =>
        prevIndex === images.length - 1 ? 0 : prevIndex + 1
      );
    }, 3000);

    // Clean up the interval when the component unmounts
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <FestiveWrapper className="pb-0 mt-40 bg-white">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-8 items-center mb-8">
          {/* */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl xl:text-4xl text-dark mb-6 animate-text-breathe">
              Discover the Power of
              <span className="text-blue block">
                Mushrooms
                <Image
                  src="/images/categories/sticker_1.png"
                  alt="Sticker"
                  width={40}
                  height={40}
                  className="ml-2 inline-block bg-white rounded-full p-1"
                />
              </span>
            </h1>
            <p className="text-lg text-gray-600 leading-relaxed mb-8 animate-text-glow">
              At <strong>MushMush</strong>, we're obsessed with the incredible world of fungi. We specialize in cultivating premium edible and medicinal mushrooms, all grown to the highest organic standards. Our passion is to provide you with the purest, most potent mushrooms on the market, whether you're looking to create a culinary masterpiece or enhance your daily wellness routine. Explore our collection and discover the MushMush difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/shop"
                className="border-2 border-blue text-blue hover:bg-blue hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 animate-scale-pulse"
              >
                Shop Now
              </Link>
              <Link
                href="blogs/blog-grid"
                className="border-2 border-blue text-blue hover:bg-blue hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 animate-scale-pulse"
              >
                Learn More
              </Link>
            </div>
          </div>

          {/* */}
          <div className="lg:w-1/2">
            <div>
              <Image
                src={images[currentImageIndex]} // Use the current image from the state
                alt="Premium Mushrooms Collection"
                width={500}
                height={300}
                className="object-contain rounded-lg opacity-1000"
              />
            </div>
          </div>
        </div>
      </div>

      {/* */}
      <HeroFeature />
    </FestiveWrapper>
  );
};

export default Hero;