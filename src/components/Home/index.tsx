import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Newsletter from "../Common/Newsletter";
import RecentlyViewed from "./RecentlyViewed";
import WishlistSection from "./WishlistSection";

const Home = () => {
  return (
    <main>
      
      <Hero />
      <PromoBanner />
      <BestSeller />
      <Categories />
      <RecentlyViewed />
      <WishlistSection />
      {/* <NewArrival /> */}
      <Testimonials />
      <Newsletter />
    </main>
  );
};

export default Home;
