import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import Newsletter from "../Common/Newsletter";
import RecentlyViewed from "./RecentlyViewed";
import WishlistSection from "./WishlistSection";
import FAQ from "./FAQ";
import FestiveWrapper from "@/components/FestiveWrapper";

const Home = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-white" useGlobalSetting={true} sparkleCount={60} mushroomCount={40}>
        <Hero />
        <PromoBanner />
        <BestSeller />
        <Categories />
        <RecentlyViewed />
        <WishlistSection />
        {/* <NewArrival /> */}
        <FAQ />
        <Newsletter />
      </FestiveWrapper>
    </main>
  );
};

export default Home;
