import React from "react";
import ShopDetails from "@/components/ShopDetails";
import { Metadata } from "next";

interface ShopDetailsPageProps {
  params: Promise<{
    slug: string;
  }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({ params }: ShopDetailsPageProps): Promise<Metadata> {
  const { slug } = await params;
  
  return {
    title: `${slug} | MushMush`,
    description: `Product details for ${slug} at MushMush`,
  };
}

const ShopDetailsPage = ({ params }: ShopDetailsPageProps) => {
  return (
    <main>
      <ShopDetails />
    </main>
  );
};

export default ShopDetailsPage;
