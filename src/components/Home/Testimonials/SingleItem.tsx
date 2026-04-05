import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import StarRating from "@/components/Common/StarRating";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  // Show real profile pic (e.g. Google avatar) if available, otherwise initial
  const hasProfileImage =
    testimonial.authorImg &&
    !testimonial.authorImg.includes("/images/users/");
  const initial = (testimonial.authorName || "K").charAt(0).toUpperCase();

  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1">
      <div className="mb-5">
        <StarRating rating={testimonial.rating ?? 5} size={15} />
      </div>

      <p className="text-dark mb-6">{testimonial.review}</p>

      <div className="flex items-center gap-4">
        {hasProfileImage ? (
          <Image
            src={testimonial.authorImg}
            alt={testimonial.authorName}
            width={48}
            height={48}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-forest/20 flex-shrink-0"
          />
        ) : (
          <span className="w-12 h-12 rounded-full bg-forest text-white text-lg font-semibold flex items-center justify-center flex-shrink-0 uppercase">
            {initial}
          </span>
        )}

        <div>
          <h3 className="font-medium text-dark">{testimonial.authorName}</h3>
          <p className="text-custom-sm text-dark-5">{testimonial.authorRole}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
