import React from "react";
import Error from "@/components/Error";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Error Page | MushMush",
  description: "This is Error Page for MushMush",
  // other metadata
};

const ErrorPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <Error />
      </FestiveWrapper>
    </main>
  );
};

export default ErrorPage;
