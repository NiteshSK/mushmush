import React from "react";
import Image from "next/image";
import Breadcrumb from "../Common/Breadcrumb";

const AboutUs = () => {
  return (
    <>
      <Breadcrumb title={"About Us"} pages={["about-us"]} />

      {/* Hero Section */}
      <section className="relative py-20 bg-gradient-to-br from-green-50 to-white">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center">
            <h1 className="font-bold text-4xl sm:text-5xl xl:text-6xl text-dark mb-6">
              MushMush: Cultivating Purity, From Our Farm to Your Fork
            </h1>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Born from passion, dedicated to purity. Discover our journey from dream to reality.
            </p>
          </div>
        </div>
      </section>

      {/* Our Story Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-6">
                Our Story
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  Welcome to <strong>MushMush by MushAgroProducts</strong>, born from a passion for nature and a dedication to purity. 
                  Nestled in the serene environment of <strong>Herbertpur, Dehradun</strong>, <strong>MushMush by MushAgroProducts </strong> 
                  is more than just a mushroom farm—it's a dream brought to life.
                </p>
                <p className="text-lg leading-relaxed">
                  Our journey began when we, <strong>Bhartendu, Pravesh, Nitesh & Vikrant</strong>, decided to leave their conventional jobs behind. 
                  We saw an opportunity to contribute something wholesome and natural to our community, and we 
                  committed ourselves full-time to the art and science of mushroom cultivation.
                </p>
                <p className="text-lg leading-relaxed">
                  Today, we are the hands-on growers at <strong>MushMush</strong>, personally overseeing every stage of the 
                  process to ensure our products meet the highest standards of quality.
                </p>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/aboutus/all_four.png"
                  alt="Bhartendu, Pravesh, Nitesh and Vikrant - MushMush Founders"
                  width={600}
                  height={400}
                  className="w-full h-80 sm:h-96 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">The MushMush Team</p>
                  <p className="text-white/80 text-xs">Bhartendu, Pravesh, Nitesh & Vikrant - Founders dedicated to natural mushroom cultivation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Philosophy Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/vikrant_certificate.png"
                    alt="Vikrant's Mushroom Cultivation Certificate"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Vikrant's Certificate</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/bhartendu_certificate.png"
                    alt="Bhartendu's Mushroom Cultivation Certificate"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Bhartendu's Certificate</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-6">
                Our Philosophy: Naturally Grown, Seriously Cared For
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  At the heart of <strong>MushMush</strong> is an unwavering commitment to organic principles. 
                  We believe that the best food is grown the way nature intended. That's why we 
                  use <strong>zero chemicals</strong> in our cultivation process. From the substrate to the harvest, 
                  every mushroom is nurtured in a controlled, clean, and natural environment.
                </p>
                <p className="text-lg leading-relaxed">
                  Our dedication to quality is not just a promise; it's a certified practice. 
                  We are proud to have obtained certification from the <strong>Department of Mushroom</strong>, 
                  <strong> Uttarakhand</strong>, <strong>Dehradun</strong>, which stands as a testament to our meticulous and 
                  responsible growing methods.
                </p>
              </div>
              
              {/* Certification Badge */}
              <div className="mt-8 p-6 bg-white rounded-xl shadow-lg border border-green-200">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg text-dark">Certified Organic</h3>
                    <p className="text-gray-600"><strong>Department of Mushroom, Uttarakhand, Dehradun</strong></p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Harvest & Scale Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-4">
              Our Harvest & Scale
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              From our farm to your table, we're growing at scale while maintaining quality
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {/* Daily Production */}
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-2xl text-center">
              <div className="text-4xl font-bold text-green-600 mb-2">250+ kg</div>
              <p className="text-lg text-gray-700">Daily Fresh Mushroom Production</p>
            </div>

            {/* Mushroom Varieties */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-2xl text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">5+</div>
              <p className="text-lg text-gray-700">Premium Mushroom Varieties</p>
            </div>

            {/* Spawn Distribution */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">100+ kg</div>
              <p className="text-lg text-gray-700">Daily Spawn Distribution</p>
            </div>
          </div>

          {/* Mushroom Varieties Grid */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="font-bold text-2xl text-dark mb-6 text-center">Our Premium Varieties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { name: "Oyster Mushrooms", image: "/images/aboutus/oyster_about_us.png" },
                { name: "Shiitake", image: "/images/aboutus/shitake_about_us.png" },
                { name: "Ganoderma (Reishi)", image: "/images/aboutus/ganoderma_about_us.png" },
                { name: "Button", image: "/images/aboutus/button_about_us.png" },
                { name: "King Oyster", image: "/images/aboutus/king_oyster_about_us.png" }
              ].map((mushroom, index) => (
                <div key={index} className="text-center">
                  <div className="relative w-full h-16 rounded-lg mb-3 overflow-hidden shadow-md flex items-center justify-center bg-white">
                    <Image
                      src={mushroom.image}
                      alt={`${mushroom.name} mushroom`}
                      width={80}
                      height={60}
                      className="max-w-full max-h-full object-contain"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                  </div>
                  <p className="text-sm font-medium text-gray-700">{mushroom.name}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Future Products Section */}
      <section className="py-20 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-6">
                The Future is Fungi: Beyond Fresh Mushrooms
              </h2>
              <p className="text-lg text-gray-700 mb-8 leading-relaxed">
                Our passion for mushrooms doesn't stop at the harvest. We are excited to be expanding 
                our product line to bring you the goodness of mushrooms in new and innovative forms. 
                Soon, you will be able to enjoy:
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  "Delectable Mushroom Pickles",
                  "Nutritious Mushroom Cookies", 
                  "Potent Health Tinctures",
                  "Versatile Dry Mushroom Powders"
                ].map((product, index) => (
                  <div key={index} className="flex items-center gap-3 bg-white p-4 rounded-lg shadow-sm">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{product}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="relative rounded-2xl overflow-hidden shadow-xl">
                <Image
                  src="/images/aboutus/vikrant_working.png"
                  alt="Vikrant working with mushrooms"
                  width={600}
                  height={400}
                  className="w-full h-80 sm:h-96 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Training & Community Section */}
      <section className="py-20 bg-white">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/vikrant_training.png"
                    alt="Vikrant conducting mushroom training session"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Training Session</p>
                    <p className="text-white/80 text-xs">Hands-on cultivation training</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/knowledge_about_us.png"
                    alt="MushMush knowledge sharing and community education"
                    width={300}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Knowledge Sharing</p>
                    <p className="text-white/80 text-xs">Empowering our community</p>
                  </div>
                </div>
              </div>
            </div>
            <div>
              <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-6">
                Sharing Our Knowledge
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  We believe in empowering our community. MushMush also provides comprehensive 
                  training programs for aspiring entrepreneurs and hobbyists who wish to learn 
                  the art of mushroom cultivation.
                </p>
                <p className="text-lg leading-relaxed">
                  Our training programs cover everything from basic cultivation techniques to 
                  advanced mushroom farming methods, helping others start their own journey 
                  in sustainable agriculture.
                </p>
              </div>
              
              <div className="mt-8 p-6 bg-blue-50 rounded-xl border border-blue-200">
                <h3 className="font-semibold text-lg text-dark mb-3">Join Our Training Program</h3>
                <p className="text-gray-600 mb-4">Learn from the experts and start your mushroom cultivation journey</p>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm text-gray-700">Weekend batches available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                    </svg>
                    <span className="text-sm text-gray-700">Hands-on experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Partners Section (For Future Use) */}
      {/* <section className="py-20 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="text-center mb-12">
            <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-4">
              Our Partners
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Collaborating with like-minded organizations to promote sustainable agriculture
            </p>
          </div>

          <div className="bg-white rounded-2xl p-12 shadow-sm border-2 border-dashed border-gray-300">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd"/>
              </svg>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Partner Section Coming Soon</h3>
              <p className="text-gray-500 max-w-md mx-auto">
                This section will showcase our valued partners and collaborators who share our vision for sustainable mushroom cultivation.
              </p>
            </div>
          </div>
        </div>
      </section> */}

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 text-center">
          <h2 className="font-bold text-3xl sm:text-4xl text-white mb-6">
            Join us on our journey of growth, health, and flavour
          </h2>
          <p className="text-xl text-green-100 mb-8 max-w-2xl mx-auto">
            Experience the purity of naturally grown mushrooms, cultivated with care and dedication.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
    <a 
        href="/shop" 
        className="flex items-center justify-center font-semibold text-green-700 bg-white py-4 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 ease-out duration-300 transition-all hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/50 text-center w-full sm:w-auto"
    >
        <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
        </svg>
        Shop Our Products
    </a>
    <a 
        href="/contact" 
        className="inline-flex items-center justify-center font-medium text-white bg-transparent border-2 border-white py-3 px-8 rounded-lg ease-out duration-200 hover:bg-white hover:text-green-700 transition-colors w-full sm:w-auto"
    >
        Contact Us
    </a>
</div>
        </div>
      </section>
    </>
  );
};

export default AboutUs;
