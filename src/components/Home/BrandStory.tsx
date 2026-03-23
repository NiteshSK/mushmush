import React from "react";
import Image from "next/image";
import Link from "next/link";

const BrandStory = () => {
  return (
    <section className="py-12 sm:py-16 bg-cream">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-16 items-center">
          {/* Image */}
          <div className="relative rounded-2xl overflow-hidden">
            <Image
              src="/images/aboutus/about-us-story.png"
              alt="Kosvana founders - Bhartendu, Pravesh and Vikrant"
              width={600}
              height={500}
              className="w-full h-[280px] sm:h-[400px] md:h-[480px] object-cover rounded-2xl"
            />
          </div>

          {/* Content */}
          <div>
            <span className="inline-block text-xs font-medium uppercase tracking-[0.2em] text-blue mb-4">
              Our Story
            </span>
            <h2 className="font-medium text-2xl sm:text-3xl md:text-4xl xl:text-5xl text-dark mb-6 leading-tight">
              Naturally Grown,{" "}
              <em className="not-italic text-forest">Seriously Cared For</em>
            </h2>
            <div className="space-y-4 text-gray-6 leading-relaxed">
              <p>
                Nestled in the serene environment of Herbertpur, Dehradun, Kosvana
                is more than just a mushroom farm — it's a dream brought to life by
                three friends who left conventional careers behind.
              </p>
              <p>
                Bhartendu, Pravesh & Vikrant personally oversee every stage of
                cultivation, using zero chemicals. Every mushroom is nurtured in a
                controlled, clean, and natural environment — certified by the
                Department of Mushroom, Uttarakhand.
              </p>
            </div>
            <Link
              href="/about-us"
              className="inline-flex items-center gap-2 mt-8 text-xs font-medium uppercase tracking-[0.15em] text-dark border-b border-dark pb-0.5 hover:text-forest hover:border-forest transition-all duration-300"
            >
              Read Our Full Story
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BrandStory;
