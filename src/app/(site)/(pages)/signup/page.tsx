import Signup from "@/components/Auth/Signup";
import React from "react";

import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Signup Page | MushMush",
  description: "This is Signup Page for MushMush",
};

const SignupPage = () => {
  return (
    <main>
      <Signup />
    </main>
  );
};

export default SignupPage;
