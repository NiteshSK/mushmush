"use client";

import React, { useState } from "react";

type FaqCategory = "All" | "Products" | "Quality" | "Storage" | "Training" | "Location";

interface FaqItem {
  question: string;
  answer: string;
  category: Exclude<FaqCategory, "All">;
}

const faqItems: FaqItem[] = [
  {
    category: "Products",
    question: "What products does Kosvana offer?",
    answer:
      "Kosvana offers a curated range of premium natural products including fresh and dried mushrooms (Oyster, Shiitake, Reishi, Button, King Oyster), dry fruits, seeds, and spices — all naturally sourced and 100% organic. We also run mushroom cultivation training programs.",
  },
  {
    category: "Quality",
    question: "Are your products truly organic?",
    answer:
      'Yes, 100%. Our guiding philosophy is "Naturally Grown, Seriously Cared For." We use zero chemicals, pesticides, or artificial additives. Our mushrooms are cultivated organically and our dry fruits, seeds, and spices are carefully sourced from trusted growers. Our mushroom cultivation is certified by the Department of Mushroom, Uttarakhand, Dehradun.',
  },
  {
    category: "Quality",
    question: "What makes Kosvana different from a regular supermarket?",
    answer:
      "The difference lies in the care and the process. Our mushrooms are grown in small, controlled batches in the serene environment of Herbertpur and harvested daily for peak freshness. Our dry fruits, seeds, and spices are hand-selected for quality — no fillers, no preservatives.",
  },
  {
    category: "Storage",
    question: "How should I store the mushrooms to keep them fresh?",
    answer:
      "To maintain optimal freshness, store our mushrooms in the paper bag they arrive in and place them in the main compartment of your refrigerator (not the vegetable drawer, as it can be too humid). This allows them to breathe and prevents them from becoming slimy. They are best consumed within 5-7 days.",
  },
  {
    category: "Location",
    question: "Where is your farm located?",
    answer: "Our farm is nestled in Herbertpur, Dehradun, Uttarakhand.",
  },
  {
    category: "Training",
    question: "Who should join your cultivation training program?",
    answer:
      "Our training is designed for everyone! Whether you're an aspiring entrepreneur looking to start your own mushroom farm, a hobbyist interested in growing at home, or simply a student curious about sustainable agriculture, our program is for you.",
  },
  {
    category: "Training",
    question: "What will I learn in the training session?",
    answer:
      "Our comprehensive training covers everything from the fundamentals to advanced techniques. You will get hands-on experience and learn about substrate preparation, inoculation, environmental control, harvesting, and pest management using organic methods.",
  },
  {
    category: "Training",
    question: "How can I sign up for a training session?",
    answer:
      "You can find information about upcoming batches and register your interest by visiting our Training Program page or by contacting us directly. We offer weekend batches to accommodate various schedules.",
  },
];

const categoryConfig: Record<Exclude<FaqCategory, "All">, { icon: string }> = {
  Products: { icon: "🍄" },
  Quality: { icon: "🌿" },
  Storage: { icon: "❄️" },
  Training: { icon: "🎓" },
  Location: { icon: "📍" },
};

const FAQ = () => {
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<FaqCategory>("All");

  const categories: FaqCategory[] = [
    "All",
    "Products",
    "Quality",
    "Storage",
    "Training",
    "Location",
  ];

  const filteredItems =
    activeCategory === "All"
      ? faqItems
      : faqItems.filter((item) => item.category === activeCategory);

  const toggleQuestion = (index: number) => {
    setOpenQuestion(openQuestion === index ? null : index);
  };

  const handleCategoryChange = (cat: FaqCategory) => {
    setActiveCategory(cat);
    setOpenQuestion(0);
  };

  return (
    <section className="relative py-16 sm:py-24 overflow-hidden bg-gradient-to-b from-sand to-cream">
      {/* Decorative background blobs */}
      <div
        aria-hidden
        className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-forest/10 blur-3xl pointer-events-none"
      />
      <div
        aria-hidden
        className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-forest/10 blur-3xl pointer-events-none"
      />

      <div className="relative max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
        <div className="grid lg:grid-cols-[5fr_7fr] gap-10 lg:gap-16">
          {/* ── Left column: heading + CTA ───────────────────── */}
          <div className="lg:sticky lg:top-24 lg:self-start">
            <span className="inline-flex items-center gap-2 text-[10px] sm:text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4">
              <span className="w-6 h-px bg-forest" />
              Got Questions?
            </span>
            <h2 className="font-medium text-3xl sm:text-4xl lg:text-5xl text-dark leading-tight mb-4">
              Frequently
              <br />
              Asked
              <br />
              <span className="italic font-light text-forest">Questions.</span>
            </h2>
            <p className="text-sm sm:text-base text-gray-500 leading-relaxed max-w-md mb-8">
              Everything you need to know about our products, sourcing, and
              training programs. Can&apos;t find what you&apos;re looking for?
              Reach out to us anytime.
            </p>

            {/* Contact CTA card */}
            <div className="bg-white rounded-2xl border border-forest/10 p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-forest mb-2">
                Still have questions?
              </p>
              <p className="text-sm text-gray-500 mb-4">
                Our team usually replies within a few hours.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href="https://wa.me/917618362662"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-forest text-white text-xs font-medium px-4 py-2.5 rounded-full hover:bg-dark transition-colors"
                >
                  <svg
                    className="fill-current"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"
                      fillRule="evenodd"
                    />
                  </svg>
                  WhatsApp
                </a>
                <a
                  href="mailto:concierge@kosvana.com"
                  className="inline-flex items-center gap-2 bg-white border border-forest/20 text-forest text-xs font-medium px-4 py-2.5 rounded-full hover:bg-forest/5 transition-colors"
                >
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                  Email
                </a>
              </div>
            </div>
          </div>

          {/* ── Right column: filters + accordion ───────────── */}
          <div>
            {/* Category filter chips */}
            <div className="flex flex-wrap gap-2 mb-6">
              {categories.map((cat) => {
                const count =
                  cat === "All"
                    ? faqItems.length
                    : faqItems.filter((i) => i.category === cat).length;
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => handleCategoryChange(cat)}
                    className={`text-xs font-medium px-4 py-2 rounded-full transition-all duration-200 flex items-center gap-1.5 ${
                      isActive
                        ? "bg-forest text-white shadow-sm"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-forest/30 hover:text-forest"
                    }`}
                  >
                    {cat}
                    <span
                      className={`text-[10px] font-semibold ${
                        isActive ? "text-white/70" : "text-gray-400"
                      }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Accordion */}
            <div className="space-y-3">
              {filteredItems.map((item, index) => {
                const isOpen = openQuestion === index;
                return (
                  <div
                    key={`${activeCategory}-${index}`}
                    className={`group rounded-2xl overflow-hidden border transition-all duration-300 ${
                      isOpen
                        ? "bg-white border-forest/30 shadow-md"
                        : "bg-white/70 border-gray-200 hover:border-forest/20 hover:bg-white"
                    }`}
                  >
                    <button
                      onClick={() => toggleQuestion(index)}
                      className="w-full px-5 sm:px-6 py-5 text-left flex items-start gap-4"
                      aria-expanded={isOpen}
                    >
                      {/* Number badge */}
                      <div
                        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-semibold transition-colors duration-300 ${
                          isOpen
                            ? "bg-forest text-white"
                            : "bg-forest/10 text-forest"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="inline-flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-forest/80">
                            <span>{categoryConfig[item.category].icon}</span>
                            {item.category}
                          </span>
                        </div>
                        <span className="font-medium text-[15px] sm:text-base text-dark leading-snug block">
                          {item.question}
                        </span>
                      </div>

                      {/* Chevron */}
                      <div
                        className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 ${
                          isOpen
                            ? "bg-forest text-white rotate-180"
                            : "border border-forest/20 text-forest/60 group-hover:border-forest/40"
                        }`}
                      >
                        <svg
                          width="14"
                          height="14"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2.5}
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19 9l-7 7-7-7"
                          />
                        </svg>
                      </div>
                    </button>

                    {/* Answer */}
                    <div
                      className={`grid transition-all duration-300 ${
                        isOpen
                          ? "grid-rows-[1fr] opacity-100"
                          : "grid-rows-[0fr] opacity-0"
                      }`}
                    >
                      <div className="overflow-hidden">
                        <div className="px-5 sm:px-6 pb-5 pl-[68px] sm:pl-[76px]">
                          <div className="border-l-2 border-forest/20 pl-4">
                            <p className="text-gray-500 leading-relaxed text-sm">
                              {item.answer}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredItems.length === 0 && (
                <div className="text-center py-12 text-sm text-gray-400">
                  No questions in this category yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FAQ;
