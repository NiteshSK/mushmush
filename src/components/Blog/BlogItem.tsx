import React from "react";
import { BlogItem } from "@/types/blogItem";
import Image from "next/image";
import Link from "next/link";

const BlogItemCard = ({ blog, slug }: { blog: BlogItem; slug: string }) => {
  let imgSrc = typeof blog.img === "string" && blog.img.trim() ? blog.img : "/images/blog/blog-small-01.jpg";

  if (imgSrc.startsWith('public/')) {
    imgSrc = '/' + imgSrc.substring(7);
  } else if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
    imgSrc = '/' + imgSrc;
  }

  return (
    <div className="group">
      <Link href={`/blogs/${slug}`} className="block rounded-xl overflow-hidden mb-5">
        <Image
          src={imgSrc}
          alt={blog.title}
          className="w-full h-56 object-cover group-hover:scale-105 transition-transform duration-500"
          width={400}
          height={260}
        />
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-xs text-gray-400">{blog.date}</span>
          <span className="w-1 h-1 rounded-full bg-gray-300"></span>
          <span className="text-xs text-gray-400">{blog.views} Views</span>
        </div>

        <h2 className="font-medium text-lg text-dark mb-3 group-hover:text-forest transition-colors">
          <Link href={`/blogs/${slug}`}>{blog.title}</Link>
        </h2>

        <Link
          href={`/blogs/${slug}`}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest hover:text-dark transition-colors"
        >
          Read More
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default BlogItemCard;
