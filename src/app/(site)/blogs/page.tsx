import React from "react";
import BlogGrid from "@/components/BlogGrid";
import FestiveWrapper from "@/components/FestiveWrapper";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | MushMush",
  description: "Read our latest blog posts about mushroom cultivation, recipes, and more",
};

const BlogsPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={40} mushroomCount={25}>
        <BlogGrid />
      </FestiveWrapper>
    </main>
  );
};

export default BlogsPage;
