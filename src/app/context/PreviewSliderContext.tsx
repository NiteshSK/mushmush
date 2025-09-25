"use client";
import React, { createContext, useContext, useState } from "react";

// Define a type for the product data we need
interface PreviewProduct {
  title: string;
  imgs: {
    previews: string[];
  };
}

interface PreviewSliderType {
  isModalPreviewOpen: boolean;
  previewProduct: PreviewProduct | null;
  openPreviewModal: (product: PreviewProduct) => void;
  closePreviewModal: () => void;
}

const PreviewSlider = createContext<PreviewSliderType | undefined>(undefined);

export const usePreviewSlider = () => {
  const context = useContext(PreviewSlider);
  if (!context) {
    // Corrected the error message to be more specific
    throw new Error("usePreviewSlider must be used within a PreviewSliderProvider");
  }
  return context;
};

export const PreviewSliderProvider = ({ children }: { children: React.ReactNode }) => {
  const [isModalPreviewOpen, setIsModalOpen] = useState(false);
  // Add state to hold the product data
  const [previewProduct, setPreviewProduct] = useState<PreviewProduct | null>(null);

  // Modify openPreviewModal to accept a product and set it to state
  const openPreviewModal = (product: PreviewProduct) => {
    setPreviewProduct(product);
    setIsModalOpen(true);
  };

  const closePreviewModal = () => {
    setIsModalOpen(false);
    setPreviewProduct(null); // Clear the product on close
  };

  return (
    <PreviewSlider.Provider
      value={{ isModalPreviewOpen, previewProduct, openPreviewModal, closePreviewModal }}
    >
      {children}
    </PreviewSlider.Provider>
  );
};