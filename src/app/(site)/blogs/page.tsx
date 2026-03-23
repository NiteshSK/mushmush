import React from "react";
import BlogGrid from "@/components/BlogGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | Kosvana",
  description: "Read our latest blog posts about mushroom cultivation, natural products, recipes, and wellness tips",
};

const BlogsPage = () => {
  return (
    <main>
      <BlogGrid />
    </main>
  );
};

export default BlogsPage;
