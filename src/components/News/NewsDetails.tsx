"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { useNewsPost } from "@/hooks/useNewsPost";

interface NewsDetailsProps {
  slug: string;
}

const NewsDetails = ({ slug }: NewsDetailsProps) => {
  // Fetch news post data (this will also increment views)
  const { blogPost, loading, error } = useNewsPost(slug);
  
  // State for dynamic tags
  const [tags, setTags] = useState<{id: number, name: string, slug: string}[]>([]);
  
  // Fetch tags from backend
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch('/api/admin/tags');
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags || []);
        }
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    };
    
    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl">Loading news article...</div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">
          {error || "News article not found"}
        </div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <>
      <Breadcrumb title="News Details" pages={["News"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-5">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <div className="flex flex-col lg:flex-row gap-7.5 xl:gap-17.5">
            <div className="w-full lg:w-full">
              <div className="blog-details-content">
                <div className="rounded-[10px] overflow-hidden mb-7.5">
                  <Image
                    className="rounded-[10px] w-full h-auto"
                    src={(() => {
                      let imgSrc = typeof blogPost.img === "string" && blogPost.img.trim() ? blogPost.img : "/images/blog/oyster-blog-01.png";
                      if (imgSrc.startsWith('public/')) {
                        imgSrc = '/' + imgSrc.substring(7);
                      } else if (!imgSrc.startsWith('/') && !imgSrc.startsWith('http')) {
                        imgSrc = '/' + imgSrc;
                      }
                      return imgSrc;
                    })()}
                    alt={blogPost.title}
                    width={500}
                    height={200}
                  />
                </div>
                <div>
                  <span className="flex items-center gap-3 mb-4">
                    <a href="#" className="ease-out duration-200 hover:text-blue">
                      {formatDate(blogPost.createdAt)}
                    </a>
                    <span className="block w-px h-4 bg-gray-4"></span>
                    <a href="#" className="ease-out duration-200 hover:text-blue">
                      News
                    </a>
                    <span className="block w-px h-4 bg-gray-4"></span>
                    <a href="#" className="ease-out duration-200 hover:text-blue">
                      {blogPost.views} Views
                    </a>
                  </span>
                  <div 
                    className="text-base text-gray-6 leading-relaxed"
                    dangerouslySetInnerHTML={{ __html: blogPost.content }}
                  />
                  
                  {/* === ADD THIS ENTIRE DIV BLOCK HERE === */}
                  <div className="mt-10 border-t border-gray-3 pt-10">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-medium text-dark text-lg">Popular Tags:</h3>
                    </div>

                    <ul className="flex flex-wrap items-center gap-3.5">
                      {tags.length > 0 ? (
                        tags.map((tag) => (
                          <li key={tag.id}>
                            <a
                              className="inline-flex hover:text-white border border-gray-3 bg-white py-2 px-4 rounded-md ease-out duration-200 hover:bg-blue hover:border-blue"
                              href="#"
                            >
                              {tag.name}
                            </a>
                          </li>
                        ))
                      ) : (
                        <li className="text-gray-6">No tags available</li>
                      )}
                    </ul>
                  </div>
                  
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

export default NewsDetails;