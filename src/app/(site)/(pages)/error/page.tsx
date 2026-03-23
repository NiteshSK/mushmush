import React from "react";
import Error from "@/components/Error";

import { Metadata } from "next";
export const metadata: Metadata = {
  title: "Error Page | Kosvana",
  description: "This is Error Page for Kosvana",
  // other metadata
};

const ErrorPage = () => {
  return (
    <main>
      <Error />
    </main>
  );
};

export default ErrorPage;
