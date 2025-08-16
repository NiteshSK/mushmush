import React from 'react';
import Image from 'next/image';

interface MushroomItemProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
}

const MushroomItem: React.FC<MushroomItemProps> = ({ 
  src, 
  alt, 
  width = 200, 
  height = 200, 
  className = "" 
}) => {
  return (
    <div className={`relative ${className}`}>
      <Image
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="object-contain"
        style={{ 
          backgroundColor: 'transparent',
          mixBlendMode: 'multiply' // This helps with white backgrounds
        }}
      />
    </div>
  );
};

const MedicinalMushrooms: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-6">
      <MushroomItem
        src="/images/categories/medicinal_mushrooms.png"
        alt="Medicinal Mushrooms Collection"
        width={300}
        height={300}
        className="hover:scale-105 transition-transform duration-300"
      />
      
      {/* You can add more individual mushroom images here */}
      <MushroomItem
        src="/images/categories/edible_mushrooms.png"
        alt="Edible Mushrooms"
        width={250}
        height={250}
        className="hover:scale-105 transition-transform duration-300"
      />
      
      <MushroomItem
        src="/images/categories/powders.png"
        alt="Mushroom Powders"
        width={250}
        height={250}
        className="hover:scale-105 transition-transform duration-300"
      />
      
      <MushroomItem
        src="/images/categories/tinctures.png"
        alt="Mushroom Tinctures"
        width={250}
        height={250}
        className="hover:scale-105 transition-transform duration-300"
      />
    </div>
  );
};

export default MedicinalMushrooms;
