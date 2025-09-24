import React from "react";
import BlogGrid from "@/components/BlogGrid";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Blog Grid Page | MushMush",
  description: "This is Blog Grid Page for MushMush",
  // other metadata
};

const BlogGridPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={40} mushroomCount={25}>
        <BlogGrid />
      </FestiveWrapper>
    </main>
  );
};

export default BlogGridPage;
