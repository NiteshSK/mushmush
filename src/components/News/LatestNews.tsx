import Link from "next/link";
import React from "react";
import Image from "next/image";

interface NewsPost {
  id?: number;
  title: string;
  img: string;
  date: string;
  views: number;
  slug?: string;
}

interface LatestNewsProps {
  news: NewsPost[];
}

const LatestNews = ({ news }: LatestNewsProps) => {
  return (
    <div className="shadow-1 bg-white rounded-xl mt-7.5">
      <div className="p-6">
        <h3 className="text-xl font-semibold text-dark mb-5">Latest News</h3>
        <div className="space-y-4">
          {news.map((item, index) => (
            <div key={index} className="flex gap-4">
              <div className="flex-shrink-0">
                <Link href={`/news/${item.slug}`}>
                  <Image
                    className="rounded-lg w-16 h-16 object-cover"
                    src={(() => {
                      let imgSrc = typeof item.img === "string" && item.img.trim() ? item.img : "/images/blog/blog-small-01.jpg";
                      if (imgSrc.startsWith('public/')) {
                        imgSrc = '/' + imgSrc.substring(7);
                      } else if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
                        imgSrc = '/' + imgSrc;
                      }
                      return imgSrc;
                    })()}
                    alt={item.title}
                    width={64}
                    height={64}
                  />
                </Link>
              </div>
              <div className="flex-1">
                <Link href={`/news/${item.slug}`}>
                  <h4 className="text-sm font-medium text-dark hover:text-blue transition-colors line-clamp-2">
                    {item.title}
                  </h4>
                </Link>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-5">{item.date}</span>
                  <span className="text-xs text-gray-5">•</span>
                  <span className="text-xs text-gray-5">{item.views} views</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LatestNews;
