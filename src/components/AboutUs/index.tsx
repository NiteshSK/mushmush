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
                  Our journey began when we, <strong>Bhartendu, Pravesh & Vikrant</strong>, decided to leave their conventional jobs behind.
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
                  src="/images/aboutus/about-us-story.png"
                  alt="Bhartendu, Pravesh and Vikrant - MushMush Founders"
                  width={600}
                  height={400}
                  className="w-full h-80 sm:h-96 object-cover"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                  <p className="text-white text-sm font-medium">The MushMush Team</p>
                  <p className="text-white/80 text-xs">Bhartendu, Pravesh & Vikrant - Founders dedicated to natural mushroom cultivation</p>
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
              <div className="text-4xl font-bold text-green-600 mb-2">25+ kg</div>
              <p className="text-lg text-gray-700">Daily Fresh Mushroom Production</p>
            </div>

            {/* Mushroom Varieties */}
            <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-8 rounded-2xl text-center">
              <div className="text-4xl font-bold text-amber-600 mb-2">5+</div>
              <p className="text-lg text-gray-700">Premium Mushroom Varieties</p>
            </div>

            {/* Spawn Distribution */}
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">2+ kg</div>
              <p className="text-lg text-gray-700">Daily Spawn Distribution</p>
            </div>
          </div>

          {/* Mushroom Varieties Grid */}
          <div className="bg-gray-50 rounded-2xl p-8">
            <h3 className="font-bold text-2xl text-dark mb-6 text-center">Our Premium Varieties</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
              {[
                { name: "Oyster Mushrooms", image: "/images/aboutus/oyster_about_us.png", link: "shop-details/oyster-mushroom" },
                { name: "Shiitake", image: "/images/aboutus/shitake_about_us.png", link: "/shop-details/shitake" },
                { name: "Ganoderma (Reishi)", image: "/images/aboutus/ganoderma_about_us.png", link: "/shop-details/ganoderma-lucidum" },
                { name: "Button", image: "/images/aboutus/button_about_us.png", link: "/shop" },
                { name: "King Oyster", image: "/images/aboutus/king_oyster_about_us.png", link: "/shop-details/king-oyster-eryngii" }
              ].map((mushroom, index) => (
                <div key={index} className="text-center">
                  {mushroom.link ? (
                    <a
                      href={mushroom.link}
                      className="block group cursor-pointer"
                    >
                      <div className="relative w-full h-16 rounded-lg mb-3 overflow-hidden shadow-md flex items-center justify-center bg-white group-hover:shadow-lg transition-all duration-200 group-hover:scale-105">
                        <Image
                          src={mushroom.image}
                          alt={`${mushroom.name} mushroom`}
                          width={80}
                          height={60}
                          className="max-w-full max-h-full object-contain"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent group-hover:from-green-600/10"></div>
                      </div>
                      <span className="text-sm font-medium text-gray-700 group-hover:text-green-600 transition-colors duration-200 underline decoration-dotted decoration-green-600/50 group-hover:decoration-solid">
                        {mushroom.name}
                      </span>
                    </a>
                  ) : (
                    <div className="block">
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
                  )}
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
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-gray-700 font-medium">{product}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/vikrant_working.png"
                    alt="Vikrant working with mushrooms"
                    width={600}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Vikrant at Work</p>
                    <p className="text-white/80 text-xs">Developing new mushroom products</p>
                  </div>
                </div>
                <div className="relative rounded-2xl overflow-hidden shadow-xl">
                  <Image
                    src="/images/aboutus/vikrant_pravesh_working.png"
                    alt="Vikrant and Pravesh working together"
                    width={600}
                    height={400}
                    className="w-full h-64 sm:h-80 object-cover"
                    priority
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
                    <p className="text-white text-sm font-medium">Team Collaboration</p>
                    <p className="text-white/80 text-xs">Working on future mushroom innovations</p>
                  </div>
                </div>
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
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Weekend batches available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm text-gray-700">Hands-on experience</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* Visit Our Farm Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <h2 className="font-bold text-3xl sm:text-4xl text-dark mb-6">
                Visit Our Farm
              </h2>
              <div className="space-y-4 text-gray-700">
                <p className="text-lg leading-relaxed">
                  We love having visitors! Come see how we cultivate our mushrooms with care and precision.
                  Experience the farm environment firsthand and learn more about our organic processes.
                </p>
                <div className="mt-6">
                  <h3 className="font-semibold text-xl text-dark mb-2">Location</h3>
                  <p className="text-lg text-gray-600 mb-4">
                    MushMush by MushAgroProducts<br />
                    NH 507, Herbertpur, Dehradun, 248142
                  </p>
                  <a
                    href="https://www.google.com/maps/place/MushMush+by+MushAgroProducts/@30.4387517,77.7345287,17z/data=!3m1!4b1!4m6!3m5!1s0x390f25e799aa9c71:0xc1d016cb5b5c812a!8m2!3d30.4387517!4d77.7345287!16s%2Fg%2F11mf3z0l90?entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoKLDEwMDc5MjA2OUgBUAM%3D"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center font-semibold text-white bg-green-600 py-3 px-6 rounded-lg shadow-md hover:bg-green-700 transition-colors duration-200 gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                    </svg>
                    View on Google Maps
                  </a>
                </div>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <div className="relative rounded-2xl overflow-hidden shadow-xl h-[400px] w-full">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3438.487844685148!2d77.7345287!3d30.4387517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f25e799aa9c71%3A0xc1d016cb5b5c812a!2sMushMush%20by%20MushAgroProducts!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="MushMush Farm Location"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0 text-center">
          <h2 className="font-bold text-3xl sm:text-4xl text-green mb-6">
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
                <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
              </svg>
              Shop Our Products
            </a>
            <a
              href="/contact"
              className="flex items-center justify-center font-semibold text-green-700 bg-white py-4 px-5 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 ease-out duration-300 transition-all hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-white/50 text-center w-full sm:w-auto"
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
