"use client";
import React, { useState, useEffect } from "react";
import Breadcrumb from "../Common/Breadcrumb";
import Image from "next/image";
import Link from "next/link";
import { useBlogViews } from "@/hooks/useBlogViews";
import { useBlogPost } from "@/hooks/useBlogPost";
import { sanitizeHtml } from "@/lib/sanitize";

interface BlogDetailsProps {
  slug: string;
}

const BlogDetails = ({ slug }: BlogDetailsProps) => {
  // Increment views when this component loads with the dynamic slug
  useBlogViews(slug);
  
  // Fetch blog post data
  const { blogPost, loading, error } = useBlogPost(slug);
  
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
        <div className="text-xl">Loading blog post...</div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-xl text-red-500">
          {error || "Blog post not found"}
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
      <Breadcrumb title="Blog Details" pages={["Blog"]} />
      <section className="overflow-hidden relative pb-20 pt-5 lg:pt-20 xl:pt-5">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
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
                      Mushroom Cultivation
                    </a>
                  </span>

                  <h2 className="font-bold text-dark text-2xl sm:text-3xl xl:text-[40px] xl:leading-[48px] mb-4">
                    {blogPost.title}
                  </h2>

                  <div className="mb-6">
                    <p className="mb-4 text-gray-6">{blogPost.excerpt}</p>
                    {blogPost.content ? (
                      <div
                        dangerouslySetInnerHTML={{ __html: sanitizeHtml(blogPost.content) }}
                        className="prose prose-lg prose-xl:max-w-none max-w-full text-gray-6
                                  prose-headings:text-dark
                                  prose-h1:text-2xl prose-h1:font-bold prose-h1:mb-4
                                  prose-h2:text-xl prose-h2:font-semibold prose-h2:mb-3
                                  prose-h3:text-lg prose-h3:font-medium prose-h3:mb-2
                                  prose-p:mb-4 prose-p:leading-relaxed
                                  prose-ul:mb-4 prose-ul:pl-6
                                  prose-ol:mb-4 prose-ol:pl-6
                                  prose-li:mb-2
                                  prose-strong:text-dark prose-strong:font-semibold
                                  prose-a:text-blue prose-a:underline hover:prose-a:text-blue/80
                                  prose-img:max-w-full prose-img:h-auto
                                  prose-pre:max-w-full prose-pre:overflow-x-auto"
                      />
                    ) : (
                      <div className="text-gray-5 italic">Content not available</div>
                    )}
                  </div>

                  <div className="mt-7.5">
                    <h3 className="font-medium text-dark text-lg xl:text-[26px] xl:leading-[34px] mb-4">
                      Views: {blogPost.views}
                    </h3>
                  </div>

                  <div className="mt-10 border-t border-gray-3 pt-10">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="flex w-12 h-12 rounded-full overflow-hidden">
                          <Image
                            src="/images/users/user-04.jpg"
                            alt="author"
                            width={48}
                            height={48}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <h4 className="text-dark text-custom-sm">Kosvana Team</h4>
                          <p className="text-custom-xs">Mushroom Experts</p>
                        </div>
                      </div>
                      <div className="flex gap-4">
                        <a
                          href="#"
                          className="flex items-center gap-2 text-gray-4 hover:text-blue ease-out duration-200"
                        >
                          <svg
                            className="fill-current"
                            width="20"
                            height="20"
                            viewBox="0 0 20 20"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path d="M18.125 3.125H1.875C1.52982 3.125 1.25 3.40482 1.25 3.75V16.25C1.25 16.5952 1.52982 16.875 1.875 16.875H18.125C18.4702 16.875 18.75 16.5952 18.75 16.25V3.75C18.75 3.40482 18.4702 3.125 18.125 3.125Z" />
                          </svg>
                          Share
                        </a>
                      </div>
                    </div>
                  </div>

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

export default BlogDetails;
