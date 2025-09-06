"use client";
import React, { useState } from 'react';
import NotifyMeModal from '@/components/NotifyMeModal';

const TestNotifyModal = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <button
        onClick={() => {
          console.log('Test button clicked, opening modal');
          setIsOpen(true);
        }}
        className="bg-red-500 text-white px-4 py-2 rounded-md shadow-lg hover:bg-red-600"
      >
        Test Modal
      </button>
      
      <NotifyMeModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        productId={4}
        productTitle="Test Product"
      />
    </div>
  );
};

export default TestNotifyModal;
