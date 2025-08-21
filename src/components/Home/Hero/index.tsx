import React from "react";
import HeroFeature from "./HeroFeature";
import Image from "next/image";

const Hero = () => {
  return (
    <section className="overflow-hidden pb-0 lg:pb-1 xl:pb-2 mt-32 bg-white" style={{ marginTop: '200px' }}>
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-col lg:flex-row gap-8 items-center mb-16">
          {/* <!-- Left Content --> */}
          <div className="lg:w-1/2">
            <h1 className="text-4xl lg:text-5xl xl:text-4xl text-dark mb-6">
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
            <p className="text-lg text-gray-600 leading-relaxed mb-8">
              At MushMush, we're obsessed with the incredible world of fungi. We specialize in cultivating premium edible and medicinal mushrooms, all grown to the highest organic standards. Our passion is to provide you with the purest, most potent mushrooms on the market, whether you're looking to create a culinary masterpiece or enhance your daily wellness routine. Explore our collection and discover the MushMush difference.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="bg-blue hover:bg-blue-dark text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                Shop Now
              </button>
              <button className="border-2 border-blue text-blue hover:bg-blue hover:text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
                Learn More
              </button>
            </div>
          </div>

          {/* <!-- Right Image --> */}
          <div className="lg:w-1/2">
            {/* This is the div where the "relative" class was removed */}
            <div>
              <Image
                src="/images/categories/hero_mushroom_wb.png"
                alt="Premium Mushrooms Collection"
                width={500}
                height={300}
                className="object-contain rounded-lg opacity-100"
              />
            </div>
          </div>
        </div>
      </div>

      {/* <!-- Hero features --> */}
      <HeroFeature />
    </section>
  );
};

export default Hero;