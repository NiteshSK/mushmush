import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
import Newsletter from "../Common/Newsletter";
import FAQ from "./FAQ";
import BrandStory from "./BrandStory";
import Testimonials from "./Testimonials";

const Home = () => {
  return (
    <main>
      <Hero />
      <BrandStory />
      <Categories />
      <BestSeller />
      <PromoBanner />
      <Testimonials />
      <FAQ />
      <Newsletter />
    </main>
  );
};

export default Home;
