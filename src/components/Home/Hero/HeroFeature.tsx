import React from "react";

const trustItems = [
  { icon: "🌿", label: "Farm Fresh" },
  { icon: "🍄", label: "100% Organic" },
  { icon: "✓", label: "Certified Growers" },
  { icon: "📍", label: "Dehradun, India" },
];

const HeroFeature = () => {
  return (
    <div className="bg-sand border-y border-gray-3">
      <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
        <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-4">
          {trustItems.map((item, index) => (
            <div key={index} className="flex items-center gap-2">
              <span className="text-base">{item.icon}</span>
              <span className="text-xs font-medium uppercase tracking-[0.15em] text-gray-6">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HeroFeature;
