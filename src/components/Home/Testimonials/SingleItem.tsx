import React from "react";
import { Testimonial } from "@/types/testimonial";
import Image from "next/image";
import StarRating from "@/components/Common/StarRating";

const SingleItem = ({ testimonial }: { testimonial: Testimonial }) => {
  return (
    <div className="shadow-testimonial bg-white rounded-[10px] py-7.5 px-4 sm:px-8.5 m-1">
      <div className="mb-5">
        <StarRating rating={testimonial.rating ?? 5} size={15} />
      </div>

      <p className="text-dark mb-6">{testimonial.review}</p>

      <div className="flex items-center gap-4">
        <div className="w-12.5 h-12.5 rounded-full overflow-hidden">
          <Image
            src={testimonial.authorImg}
            alt={testimonial.authorName}
            className="w-12.5 h-12.5 rounded-full overflow-hidden object-cover"
            width={50}
            height={50}
          />
        </div>

        <div>
          <h3 className="font-medium text-dark">{testimonial.authorName}</h3>
          <p className="text-custom-sm">{testimonial.authorRole}</p>
        </div>
      </div>
    </div>
  );
};

export default SingleItem;
