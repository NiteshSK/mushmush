import Signin from "@/components/Auth/Signin";
import React from "react";
import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Signin Page | Kosvana",
  description: "This is Signin Page for Kosvana",
};

const SigninPage = () => {
  return (
    <main>
      <Signin />
    </main>
  );
};

export default SigninPage;
