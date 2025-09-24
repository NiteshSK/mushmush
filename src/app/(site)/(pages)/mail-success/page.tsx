import React from "react";
import MailSuccess from "@/components/MailSuccess";
import FestiveWrapper from "@/components/FestiveWrapper";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Mail Success Page | MushMush",
  description: "This is Mail Success Page for MushMush",
  // other metadata
};

const MailSuccessPage = () => {
  return (
    <main>
      <FestiveWrapper className="min-h-screen bg-gray-2 py-20" sparkleCount={35} mushroomCount={20}>
        <MailSuccess />
      </FestiveWrapper>
    </main>
  );
};

export default MailSuccessPage;
