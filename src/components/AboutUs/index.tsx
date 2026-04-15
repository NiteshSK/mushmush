import React from "react";
import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "../Common/Breadcrumb";

const AboutUs = () => {
  return (
    <>
      <Breadcrumb title={"About Us"} pages={["About Us"]} />

      {/* Hero Statement */}
      <section className="py-16 sm:py-24">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-medium text-3xl sm:text-4xl xl:text-5xl text-dark leading-tight mb-6">
              Cultivating Purity,<br />From Our Farm to Your Fork
            </h1>
            <p className="text-gray-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
              Born from passion, dedicated to purity. Discover our journey from dream to reality in the foothills of Dehradun.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-16 sm:py-20 bg-forest/5">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="order-2 lg:order-1">
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Our Story</span>
              <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-6">
                How It All Began
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  Welcome to <strong className="text-dark">Kosvana by MushAgroProducts</strong>, born from a passion for nature and a dedication to purity.
                  Nestled in the serene environment of <strong className="text-dark">Herbertpur, Dehradun</strong>, Kosvana is more than just a mushroom farm — it's a dream brought to life.
                </p>
                <p>
                  Our journey began when <strong className="text-dark">Bhartendu, Pravesh & Vikrant</strong> decided to leave their conventional jobs behind.
                  We saw an opportunity to contribute something wholesome and natural to our community, and committed ourselves full-time to the art and science of mushroom cultivation.
                </p>
                <p>
                  Today, we are the hands-on growers at Kosvana, personally overseeing every stage of the process to ensure our products meet the highest standards of quality.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/aboutus/about-us-story.png"
                  alt="Bhartendu, Pravesh and Vikrant - Kosvana Founders"
                  width={600}
                  height={400}
                  className="w-full h-80 sm:h-[420px] object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src="/images/aboutus/vikrant_certificate.png"
                    alt="Vikrant's Cultivation Certificate"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
                <div className="rounded-2xl overflow-hidden">
                  <Image
                    src="/images/aboutus/bhartendu_certificate.png"
                    alt="Bhartendu's Cultivation Certificate"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                  />
                </div>
              </div>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Our Philosophy</span>
              <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-6">
                Naturally Grown, Seriously Cared For
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  At the heart of Kosvana is an unwavering commitment to organic principles. We believe that the best food is grown the way nature intended. That's why we use <strong className="text-dark">zero chemicals</strong> in our cultivation process.
                </p>
                <p>
                  Our dedication to quality is not just a promise; it's a certified practice. We are proud to have obtained certification from the <strong className="text-dark">Department of Mushroom, Uttarakhand, Dehradun</strong>.
                </p>
              </div>

              {/* Certification */}
              <div className="mt-8 p-5 bg-sand rounded-xl flex items-center gap-4">
                <div className="w-10 h-10 bg-forest/10 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-forest">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-dark">Certified Organic Growers</p>
                  <p className="text-xs text-gray-500">Department of Mushroom, Uttarakhand</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 sm:py-20 bg-forest/5">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="text-center mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Our Scale</span>
            <h2 className="font-medium text-2xl sm:text-3xl text-dark">
              From Farm to Table
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="text-center py-8">
              <p className="font-medium text-4xl text-dark mb-2">25+</p>
              <p className="text-sm text-gray-500">kg fresh mushrooms daily</p>
            </div>
            <div className="text-center py-8 sm:border-x sm:border-gray-200">
              <p className="font-medium text-4xl text-dark mb-2">5+</p>
              <p className="text-sm text-gray-500">premium varieties</p>
            </div>
            <div className="text-center py-8">
              <p className="font-medium text-4xl text-dark mb-2">2+</p>
              <p className="text-sm text-gray-500">kg spawn distributed daily</p>
            </div>
          </div>

          {/* Varieties */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-5 gap-6">
            {[
              { name: "Oyster", image: "/images/aboutus/oyster_about_us.png", link: "/shop-details/oyster-mushroom" },
              { name: "Shiitake", image: "/images/aboutus/shitake_about_us.png", link: "/shop-details/shitake" },
              { name: "Ganoderma", image: "/images/aboutus/ganoderma_about_us.png", link: "/shop-details/ganoderma-lucidum" },
              { name: "Button", image: "/images/aboutus/button_about_us.png", link: "/shop" },
              { name: "King Oyster", image: "/images/aboutus/king_oyster_about_us.png", link: "/shop-details/king-oyster-eryngii" }
            ].map((mushroom, index) => (
              <Link key={index} href={mushroom.link} className="group text-center">
                <div className="bg-white rounded-xl p-4 mb-3 aspect-square flex items-center justify-center group-hover:shadow-md transition-shadow">
                  <Image
                    src={mushroom.image}
                    alt={mushroom.name}
                    width={80}
                    height={80}
                    className="object-contain group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <p className="text-xs font-medium text-gray-600 group-hover:text-forest transition-colors">{mushroom.name}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Future Products */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Coming Soon</span>
              <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-6">
                Beyond Fresh Mushrooms
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-8">
                Our passion doesn't stop at the harvest. We're expanding our product line to bring you the goodness of mushrooms in new forms.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {["Mushroom Pickles", "Mushroom Cookies", "Health Tinctures", "Dry Mushroom Powders"].map((product, index) => (
                  <div key={index} className="flex items-center gap-3 py-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-forest flex-shrink-0"></div>
                    <span className="text-sm text-gray-600">{product}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/aboutus/vikrant_working.png"
                  alt="Vikrant working with mushrooms"
                  width={600}
                  height={400}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/aboutus/vikrant_pravesh_working.png"
                  alt="Team working together"
                  width={600}
                  height={400}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training */}
      <section className="py-16 sm:py-20 bg-forest/5">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/aboutus/vikrant_training.png"
                  alt="Training session"
                  width={300}
                  height={400}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
              <div className="rounded-2xl overflow-hidden">
                <Image
                  src="/images/aboutus/knowledge_about_us.png"
                  alt="Knowledge sharing"
                  width={300}
                  height={400}
                  className="w-full h-64 sm:h-80 object-cover"
                />
              </div>
            </div>
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Community</span>
              <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-6">
                Sharing Our Knowledge
              </h2>
              <div className="space-y-4 text-gray-600 text-sm sm:text-base leading-relaxed">
                <p>
                  We believe in empowering our community. Kosvana provides comprehensive training programs for aspiring entrepreneurs and hobbyists who wish to learn the art of mushroom cultivation.
                </p>
                <p>
                  Our programs cover everything from basic cultivation techniques to advanced mushroom farming methods.
                </p>
              </div>
              <Link
                href="/training"
                className="inline-flex items-center gap-2 mt-8 bg-forest text-white text-xs font-medium tracking-[0.15em] uppercase py-3.5 px-8 rounded-full hover:bg-dark transition-colors duration-300"
              >
                View Training Programs
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Visit */}
      <section className="py-16 sm:py-20">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Visit Us</span>
              <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-6">
                Visit Our Farm
              </h2>
              <p className="text-gray-600 text-sm sm:text-base leading-relaxed mb-6">
                We love having visitors! Come see how we cultivate our mushrooms with care and precision. Experience the farm environment firsthand.
              </p>
              <div className="mb-8">
                <p className="text-sm text-gray-500 mb-1">Location</p>
                <p className="text-dark font-medium">
                  Kosvana by MushAgroProducts<br />
                  NH 507, Herbertpur, Dehradun, 248142
                </p>
              </div>
              <a
                href="https://www.google.com/maps/place/Kosvana+by+MushAgroProducts/data=!4m2!3m1!1s0x0:0xc1d016cb5b5c812a?sa=X&ved=1t:2428&ictx=111"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-forest border-b border-forest pb-0.5 hover:text-dark hover:border-dark transition-colors"
              >
                Open in Google Maps
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
              </a>
            </div>
            <div className="rounded-2xl overflow-hidden h-[400px]">
              <iframe
                src="google.com/maps/place/Kosvana+by+MushAgroProducts/data=!4m2!3m1!1s0x0:0xc1d016cb5b5c812a?sa=X&ved=1t:2428&ictx=111"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen={true}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Kosvana Farm Location"
              ></iframe>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 sm:py-20 bg-forest">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0 text-center">
          <h2 className="font-medium text-2xl sm:text-3xl text-white mb-4">
            Join Us on Our Journey
          </h2>
          <p className="text-white/60 text-sm sm:text-base mb-8 max-w-lg mx-auto">
            Experience the purity of naturally grown mushrooms, cultivated with care and dedication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="inline-flex items-center justify-center gap-2 bg-white text-forest text-xs font-medium tracking-[0.15em] uppercase py-3.5 px-8 rounded-full hover:bg-white/90 transition-colors"
            >
              Shop Products
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center gap-2 text-white text-xs font-medium tracking-[0.15em] uppercase py-3.5 px-8 rounded-full border border-white/30 hover:bg-white/10 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
