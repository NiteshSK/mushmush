// src/components/SiteBanner.tsx

import React from 'react';
import Link from 'next/link';

const SiteBanner = () => {
  return (
    <div className="bg-red-600 text-white p-3 text-center text-sm sm:text-base sticky top-0 z-50">
      <p>
        <span className="font-bold mr-2">Online Orders Paused:</span>
        We are not currently accepting orders from the website. To order, please 
        <Link 
          href="https://wa.me/917618362662" 
          target="_blank" 
          rel="noopener noreferrer"
          className="font-bold underline mx-1 hover:text-red-200"
        >
          WhatsApp
        </Link>
        or call us directly at 
        <a 
          href="tel:+917618362662"
          className="font-bold underline ml-1 hover:text-red-200"
        >
          (+91) 7618362662
        </a>.
      </p>
    </div>
  );
};

export default SiteBanner;