import React from "react";

const StarRating = ({
  rating = 0,
  count,
  size = 14,
}: {
  rating?: number;
  count?: number;
  size?: number;
}) => {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => {
          const diff = rating - (star - 1);
          const filled = diff >= 1;
          const half = !filled && diff > 0;

          return (
            <svg
              key={star}
              width={size}
              height={size}
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {half && (
                <defs>
                  <linearGradient id={`half-star-${star}`}>
                    <stop offset="50%" stopColor="#F59E0B" />
                    <stop offset="50%" stopColor="transparent" />
                  </linearGradient>
                </defs>
              )}
              <path
                d="M7 1L8.854 4.764L13 5.382L10 8.326L10.708 12.5L7 10.527L3.292 12.5L4 8.326L1 5.382L5.146 4.764L7 1Z"
                fill={
                  filled
                    ? "#F59E0B"
                    : half
                    ? `url(#half-star-${star})`
                    : "none"
                }
                stroke={filled || half ? "#F59E0B" : "#d1d5db"}
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          );
        })}
      </div>
      {count !== undefined && (
        <span className="text-[11px] text-dark-5">({count})</span>
      )}
    </div>
  );
};

export default StarRating;
