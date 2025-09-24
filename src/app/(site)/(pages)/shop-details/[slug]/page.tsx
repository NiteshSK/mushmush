import React from "react";
import ShopDetails from "@/components/ShopDetails";
import FestiveWrapper from "@/components/FestiveWrapper";
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

const ShopDetailsPage = async ({ params }: ShopDetailsPageProps) => {
  const { slug } = await params;
  
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={45} mushroomCount={30}>
        <ShopDetails key={`shop-details-${slug}`} />
      </FestiveWrapper>
    </main>
  );
};

export default ShopDetailsPage;
