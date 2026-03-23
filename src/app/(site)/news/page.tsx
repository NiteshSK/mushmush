import React from "react";
import NewsGrid from "@/components/News/NewsGrid";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "News | Kosvana",
  description: "Stay updated with the latest news and updates from Kosvana",
};

const NewsPage = () => {
  return (
    <main>
      <NewsGrid />
    </main>
  );
};

export default NewsPage;
