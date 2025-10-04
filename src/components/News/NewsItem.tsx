import React from "react";
import { NewsItem as NewsItemType } from "@/types/newsItem";
import Image from "next/image";
import Link from "next/link";

const NewsItem = ({ news, slug }: { news: NewsItemType; slug: string }) => {
  let imgSrc = typeof news.img === "string" && news.img.trim() ? news.img : "/images/blog/blog-small-01.jpg";
  
  // Ensure the path starts with / for Next.js Image component
  if (imgSrc.startsWith('public/')) {
    imgSrc = '/' + imgSrc.substring(7);
  } else if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
    imgSrc = '/' + imgSrc;
  }

  // Use sourceUrl if available, otherwise use detail page
  const readMoreLink = news.sourceUrl || `/news/${slug}`;
  const isExternalLink = news.sourceUrl && news.sourceUrl.startsWith('http');

  // Handle click for external links - increment view count
const handleExternalLinkClick = async (e: React.MouseEvent) => {
  if (isExternalLink) {
    // Check if already viewed in this session
    const viewedArticles = sessionStorage.getItem('viewedNewsArticles')
    const viewedList = viewedArticles ? JSON.parse(viewedArticles) : []
    const hasViewed = viewedList.includes(slug)
    
    if (!hasViewed) {
      // Increment view count
      try {
        await fetch(`/api/news/${slug}/increment-view`, {
          method: 'POST',
        });
        
        // Mark as viewed
        viewedList.push(slug)
        sessionStorage.setItem('viewedNewsArticles', JSON.stringify(viewedList))
        console.log('View counted for external article:', slug)
      } catch (error) {
        console.error('Failed to increment view:', error);
      }
    } else {
      console.log('Already viewed in this session, not incrementing')
    }
  }
};
  
  return (
    <div className="shadow-1 bg-white rounded-xl px-4 sm:px-5 pt-5 pb-4">
      <Link 
        href={readMoreLink} 
        className="rounded-md overflow-hidden block" 
        target={isExternalLink ? "_blank" : undefined} 
        rel={isExternalLink ? "noopener noreferrer" : undefined}
        onClick={handleExternalLinkClick}
      >
        <Image
          src={imgSrc}
          alt="news"
          className="rounded-md w-full h-48 object-cover"
          width={400}
          height={250}
          priority={false}
        />
      </Link>

      <div className="mt-5.5">
        <span className="flex items-center gap-3 mb-2.5">
          <a
            href="#"
            className="text-custom-sm ease-out duration-200 hover:text-blue"
          >
            {news.date}
          </a>

          <span className="block w-px h-4 bg-gray-4"></span>

          <a
            href="#"
            className="text-custom-sm ease-out duration-200 hover:text-blue"
          >
            {news.views} Views
          </a>
        </span>

        <h2 className="font-medium text-dark text-lg sm:text-xl ease-out duration-200 mb-4 hover:text-blue">
          <Link 
            href={readMoreLink} 
            target={isExternalLink ? "_blank" : undefined} 
            rel={isExternalLink ? "noopener noreferrer" : undefined}
            onClick={handleExternalLinkClick}
          >
            {news.title}
          </Link>
        </h2>

        <Link
          href={readMoreLink}
          target={isExternalLink ? "_blank" : undefined}
          rel={isExternalLink ? "noopener noreferrer" : undefined}
          className="text-custom-sm inline-flex items-center gap-2 py-2 ease-out duration-200 hover:text-blue"
          onClick={handleExternalLinkClick}
        >
          {isExternalLink ? "Read Full Article" : "Read More"}
          <svg
            className="fill-current"
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10.1023 4.10225C10.3219 3.88258 10.6781 3.88258 10.8977 4.10225L15.3977 8.60225C15.6174 8.82192 15.6174 9.17808 15.3977 9.39775L10.8977 13.8977C10.6781 14.1174 10.3219 14.1174 10.1023 13.8977C9.88258 13.6781 9.88258 13.3219 10.1023 13.1023L13.642 9.5625H3C2.68934 9.5625 2.4375 9.31066 2.4375 9C2.4375 8.68934 2.68934 8.4375 3 8.4375H13.642L10.1023 4.89775C9.88258 4.67808 9.88258 4.32192 10.1023 4.10225Z"
              fill=""
            />
          </svg>
        </Link>
      </div>
    </div>
  );
};

export default NewsItem;