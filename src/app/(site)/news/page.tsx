import React from "react";
import NewsGrid from "@/components/News/NewsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News | MushMush",
  description: "Stay updated with the latest news and updates from MushMush",
};

const NewsPage = () => {
  return (
    <main>
      <NewsGrid />
    </main>
  );
};

export default NewsPage;
