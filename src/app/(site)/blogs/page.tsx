import React from "react";
import BlogGrid from "@/components/BlogGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | MushMush",
  description: "Read our latest blog posts about mushroom cultivation, recipes, and more",
};

const BlogsPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogsPage;
