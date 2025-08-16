import React from 'react';

interface MushroomBackgroundProps {
  imageSrc: string;
  alt: string;
  width?: string;
  height?: string;
  className?: string;
}

const MushroomBackground: React.FC<MushroomBackgroundProps> = ({
  imageSrc,
  alt,
  width = "200px",
  height = "200px",
  className = ""
}) => {
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width,
        height,
        backgroundImage: `url(${imageSrc})`,
        backgroundSize: 'contain',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundColor: 'transparent'
      }}
      role="img"
      aria-label={alt}
    />
  );
};

const MushroomGallery: React.FC = () => {
  return (
    <div className="flex flex-wrap gap-4 p-6">
      <MushroomBackground
        imageSrc="/images/categories/medicinal_mushrooms.png"
        alt="Medicinal Mushrooms"
        width="300px"
        height="300px"
        className="hover:scale-110 transition-transform duration-300 cursor-pointer"
      />
      
      <MushroomBackground
        imageSrc="/images/categories/edible_mushrooms.png"
        alt="Edible Mushrooms"
        width="250px"
        height="250px"
        className="hover:scale-110 transition-transform duration-300 cursor-pointer"
      />
      
      <MushroomBackground
        imageSrc="/images/categories/powders.png"
        alt="Mushroom Powders"
        width="250px"
        height="250px"
        className="hover:scale-110 transition-transform duration-300 cursor-pointer"
      />
    </div>
  );
};

export default MushroomGallery;
