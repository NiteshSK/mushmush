"use client";

import React, { useState } from "react";

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const faqItems = [
    {
      question: "What products does Kosvana offer?",
      answer: "Kosvana offers a curated range of premium natural products including fresh and dried mushrooms (Oyster, Shiitake, Reishi, Button, King Oyster), dry fruits, seeds, and spices — all naturally sourced and 100% organic. We also run mushroom cultivation training programs."
    },
    {
      question: "Are your products truly organic?",
      answer: "Yes, 100%. Our guiding philosophy is \"Naturally Grown, Seriously Cared For.\" We use zero chemicals, pesticides, or artificial additives. Our mushrooms are cultivated organically and our dry fruits, seeds, and spices are carefully sourced from trusted growers. Our mushroom cultivation is certified by the Department of Mushroom, Uttarakhand, Dehradun."
    },
    {
      question: "What makes Kosvana different from a regular supermarket?",
      answer: "The difference lies in the care and the process. Our mushrooms are grown in small, controlled batches in the serene environment of Herbertpur and harvested daily for peak freshness. Our dry fruits, seeds, and spices are hand-selected for quality — no fillers, no preservatives."
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
      question: "Who should join your cultivation training program?",
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
    <section className="py-16 sm:py-24 overflow-hidden bg-forest/5">
      <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        {/* Header */}
        <div className="mb-14 text-center">
          <span className="inline-block text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-forest mb-3">
            Got Questions?
          </span>
          <h2 className="font-medium text-3xl sm:text-4xl text-dark mb-3">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Everything you need to know about our products, sourcing, and training programs.
          </p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-3">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className={`rounded-2xl overflow-hidden border transition-colors duration-200 ${
                openQuestion === index
                  ? "bg-forest/5 border-forest/15"
                  : "bg-white border-gray-200 hover:border-forest/15"
              }`}
            >
              <button
                onClick={() => toggleQuestion(index)}
                className="w-full px-6 py-5 text-left flex items-center justify-between gap-4"
              >
                <span className="font-medium text-[15px] text-dark flex-1">
                  {item.question}
                </span>
                <div className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-200 ${
                  openQuestion === index
                    ? "bg-forest text-white"
                    : "border border-forest/20 text-forest/60"
                }`}>
                  <svg
                    className={`w-3.5 h-3.5 transition-transform duration-300 ${openQuestion === index ? 'rotate-180' : 'rotate-0'}`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </button>

              <div
                className={`overflow-hidden transition-all duration-300 ${openQuestion === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
              >
                <div className="px-6 pb-5">
                  <p className="text-gray-500 leading-relaxed text-sm">
                    {item.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
