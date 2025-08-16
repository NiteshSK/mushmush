import React from 'react';
import Image from 'next/image';

const MushroomSection: React.FC = () => {
  return (
    <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Discover Our Medicinal Mushrooms
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Explore our premium collection of medicinal mushrooms, carefully sourced and prepared for optimal health benefits.
          </p>
        </div>

        {/* Mushroom Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Medicinal Mushrooms */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-64 mb-4">
              <Image
                src="/images/categories/medicinal_mushrooms.png"
                alt="Medicinal Mushrooms Collection"
                fill
                className="object-contain"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Medicinal Mushrooms
            </h3>
            <p className="text-gray-600">
              Premium quality medicinal mushrooms for health and wellness support.
            </p>
          </div>

          {/* Edible Mushrooms */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-64 mb-4">
              <Image
                src="/images/categories/edible_mushrooms.png"
                alt="Edible Mushrooms"
                fill
                className="object-contain"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Edible Mushrooms
            </h3>
            <p className="text-gray-600">
              Fresh, organic edible mushrooms for culinary excellence.
            </p>
          </div>

          {/* Mushroom Powders */}
          <div className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-shadow duration-300">
            <div className="relative h-64 mb-4">
              <Image
                src="/images/categories/powders.png"
                alt="Mushroom Powders"
                fill
                className="object-contain"
                style={{ backgroundColor: 'transparent' }}
              />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Mushroom Powders
            </h3>
            <p className="text-gray-600">
              Convenient powdered forms for easy consumption and maximum absorption.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
            Shop All Mushrooms
          </button>
        </div>
      </div>
    </section>
  );
};

export default MushroomSection;
