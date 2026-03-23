import Link from "next/link";
import React from "react";

interface BreadcrumbProps {
  title: string;
  pages: string[];
}

const Breadcrumb = ({ title, pages }: BreadcrumbProps) => {
  return (
    <div>
      <div className="border-b border-gray-200">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0 py-8 sm:py-12">
          <h1 className="font-medium text-2xl sm:text-3xl xl:text-4xl text-dark mb-3">
            {title}
          </h1>
          <ul className="flex items-center gap-1.5 text-sm text-gray-400">
            <li className="hover:text-forest transition-colors">
              <Link href="/">Home</Link>
            </li>
            <li className="text-gray-300">/</li>
            {pages.length > 0 &&
              pages.map((page, key) => (
                <li
                  className={`capitalize ${key === pages.length - 1 ? "text-forest" : ""}`}
                  key={key}
                >
                  {page}
                  {key < pages.length - 1 && <span className="ml-1.5 text-gray-300">/</span>}
                </li>
              ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Breadcrumb;
