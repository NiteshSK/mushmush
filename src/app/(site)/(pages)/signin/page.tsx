import Signin from "@/components/Auth/Signin";
import React from "react";
import FestiveWrapper from "@/components/FestiveWrapper";
import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Signin Page | MushMush",
  description: "This is Signin Page for MushMush",
};

const SigninPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <Signin />
      </FestiveWrapper>
    </main>
  );
};

export default SigninPage;
