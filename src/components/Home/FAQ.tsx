"use client";

import React, { useState } from "react";
import FestiveWrapper from "@/components/FestiveWrapper";

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqItems = [
    {
      question: "Are your mushrooms truly organic?",
      answer: "Yes, 100%. Our guiding philosophy is \"Naturally Grown, Seriously Cared For.\" We use zero chemicals, pesticides, or artificial additives at any stage of cultivation. Our commitment to purity is certified by the Department of Mushroom, Uttarakhand, Dehradun."
    },
    {
      question: "What makes MushMush mushrooms different from those in a regular supermarket?",
      answer: "The difference lies in the care and the process. Our mushrooms are grown in small, controlled batches in the serene environment of Herbertpur. Unlike mass-produced mushrooms, ours are harvested daily, ensuring they arrive at your table incredibly fresh, flavourful, and packed with nutrients. Plus, they are grown by the founders themselves, not by a faceless corporation."
    },
    {
      question: "What varieties of mushrooms do you currently offer?",
      answer: "We cultivate a curated selection of premium mushrooms to suit various tastes and culinary needs. Our current varieties include Oyster, Shiitake, Ganoderma (Reishi), Button, and King Oyster mushrooms."
    },
    {
      question: "How should I store the mushrooms to keep them fresh?",
      answer: "To maintain optimal freshness, store our mushrooms in the paper bag they arrive in and place them in the main compartment of your refrigerator (not the vegetable drawer, as it can be too humid). This allows them to breathe and prevents them from becoming slimy. They are best consumed within 5-7 days."
    },
    {
      question: "Where is your farm located?",
      answer: "Our farm is nestled in Herbertpur, Dehradun, Uttarakhand."
    },
    {
      question: "Who should join your mushroom cultivation training program?",
      answer: "Our training is designed for everyone! Whether you're an aspiring entrepreneur looking to start your own mushroom farm, a hobbyist interested in growing at home, or simply a student curious about sustainable agriculture, our program is for you."
    },
    {
      question: "What will I learn in the training session?",
      answer: "Our comprehensive training covers everything from the fundamentals to advanced techniques. You will get hands-on experience and learn about substrate preparation, inoculation, environmental control, harvesting, and pest management using organic methods."
    },
    {
      question: "How can I sign up for a training session?",
      answer: "You can find information about upcoming batches and register your interest by visiting our Training Program page or by contacting us directly. We offer weekend batches to accommodate various schedules."
    }
  ];

  return (
    <FestiveWrapper className="py-16 sm:py-24 bg-cream overflow-hidden">
      <div className="max-w-6xl mx-auto px-4">
        {/* Headline Section - Updated for vertical stacking */}
        <div className="mb-12 lg:mb-16 flex flex-col items-center text-center">
          <p className="inline-block bg-tan px-4 py-1 text-lg text-brown font-semibold mb-2 rounded-md animate-text-glow">
            Your curiosities about functional wellness, answered.
          </p>
          <h2 className="inline-block bg-tan px-5 py-2 font-bold text-4xl sm:text-5xl text-brown rounded-lg animate-text-breathe">
          The Mush-Knows
          </h2>
        </div>

        <div className="lg:grid lg:grid-cols-2 lg:gap-16 items-start">
          {/* Left Column: FAQ Questions */}
          <div className="space-y-4 mb-12 lg:mb-0">
            {faqItems.map((item, index) => (
              <div key={index} className="bg-tan rounded-lg overflow-hidden animate-scale-pulse">
                <button
                  onClick={() => toggleQuestion(index)}
                  className="w-full px-6 py-5 text-left flex items-center justify-between"
                >
                  <span className="font-semibold text-lg text-brown flex-1 pr-4">
                    {item.question}
                  </span>
                  <div className="flex-shrink-0 w-8 h-8 rounded-full border-2 border-brown flex items-center justify-center">
                    <svg
                      className={`w-4 h-4 text-brown transition-transform duration-300 ${
                        openQuestion === index ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2.5}
                      viewBox="0 0 24 24"
                    >
                      {openQuestion === index ? (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      )}
                    </svg>
                  </div>
                </button>
                
                <div
                  className={`overflow-hidden transition-all duration-300 ${
                    openQuestion === index ? 'max-h-96' : 'max-h-0'
                  }`}
                  style={{ transitionProperty: 'max-height, opacity', opacity: openQuestion === index ? 1 : 0 }}
                >
                  <div className="px-6 pb-5">
                    <p className="text-brown/80 leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Right Column: Image */}
          <div className="relative flex justify-center items-center h-full min-h-[300px] lg:min-h-[600px] mt-8 lg:mt-0">
            <div className="relative w-[85%] h-[85%] max-w-[500px] max-h-[500px] lg:max-w-full lg:max-h-full aspect-square flex items-center justify-center">
              <div className="absolute inset-0 bg-purple-blob rounded-full transform scale-105 animate-pulse-soft" 
                   style={{ transform: 'rotate(10deg) scale(1.05)', backgroundColor: 'rgba(168, 150, 203, 0.4)' }}>
              </div>
              <div className="relative z-10 w-[80%] h-[80%]">
                <img
                  src="/images/faqs/faqs.png"
                  alt="Mush Mush product being prepared"
                  className="rounded-lg shadow-xl w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </FestiveWrapper>
  );
};

export default FAQ;
