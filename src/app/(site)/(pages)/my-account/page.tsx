import MyAccount from "@/components/MyAccount";
import React from "react";

import { Metadata } from "next";

// Prevent static generation to avoid useSession context issues during build
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "My Account | Kosvana",
  description: "This is My Account page for Kosvana",
};

const MyAccountPage = () => {
  return (
    <main>
      <MyAccount />
    </main>
  );
};

export default MyAccountPage;
