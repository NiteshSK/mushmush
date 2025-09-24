import MyAccount from "@/components/MyAccount";
import React from "react";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Account | MushMush",
  description: "This is My Account page for MushMush",
};

const MyAccountPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <MyAccount />
      </FestiveWrapper>
    </main>
  );
};

export default MyAccountPage;
