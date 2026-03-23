"use client";

import { useState } from "react";
import Breadcrumb from "@/components/Common/Breadcrumb";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    type: "success" | "error" | null;
    message: string;
  }>({ type: null, message: "" });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus({ type: null, message: "" });

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setSubmitStatus({
          type: "success",
          message: "Message sent successfully! We'll get back to you soon.",
        });
        setFormData({ name: "", email: "", phone: "", subject: "", message: "" });
      } else {
        setSubmitStatus({
          type: "error",
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        type: "error",
        message: "An unexpected error occurred. Please try again.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main>
      <Breadcrumb title="Contact" pages={["Contact"]} />

      <section className="py-12 sm:py-16">
        <div className="max-w-[1200px] w-full mx-auto px-4 sm:px-6 xl:px-0">
          {/* Header */}
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-medium uppercase tracking-[0.2em] text-forest mb-4 block">Get in Touch</span>
            <h2 className="font-medium text-2xl sm:text-3xl text-dark mb-4">
              We'd Love to Hear From You
            </h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              Have a question about our products, training programs, or anything else? Drop us a message and we'll get back to you as soon as possible.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Info */}
            <div className="lg:col-span-2 space-y-8">
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Email</p>
                <a href="mailto:mushagroprod@gmail.com" className="text-sm text-dark hover:text-forest transition-colors">
                  mushagroprod@gmail.com
                </a>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Phone</p>
                <a href="tel:+917618362662" className="text-sm text-dark hover:text-forest transition-colors">
                  (+91) 7618362662
                </a>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Address</p>
                <a
                  href="https://www.google.com/maps/place/MushMush+by+MushAgroProducts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-dark hover:text-forest transition-colors leading-relaxed"
                >
                  Kosvana by Mush Agro Products<br />
                  NH 507, Herbertpur<br />
                  Dehradun, Uttarakhand 248142
                </a>
              </div>

              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-gray-400 mb-3">Business Hours</p>
                <p className="text-sm text-dark">Mon – Sat: 9:00 AM – 6:00 PM</p>
                <p className="text-sm text-dark">Sunday: 9:00 AM – 3:00 PM</p>
              </div>

              {/* Map */}
              <div className="rounded-xl overflow-hidden h-[200px] border border-gray-100">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3438.487844685148!2d77.7345287!3d30.4387517!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x390f25e799aa9c71%3A0xc1d016cb5b5c812a!2sMushMush%20by%20MushAgroProducts!5e0!3m2!1sen!2sin!4v1709123456789!5m2!1sen!2sin"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={true}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Kosvana Farm Location"
                  className="grayscale hover:grayscale-0 transition-all duration-500"
                ></iframe>
              </div>
            </div>

            {/* Form */}
            <div className="lg:col-span-3">
              <div className="bg-forest/5 rounded-2xl p-6 sm:p-10">
                {submitStatus.type && (
                  <div
                    className={`mb-6 p-4 rounded-lg text-sm ${
                      submitStatus.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                    }`}
                  >
                    {submitStatus.message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="name" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                        placeholder="Your name"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label htmlFor="phone" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                        placeholder="+91 XXXXX XXXXX"
                      />
                    </div>
                    <div>
                      <label htmlFor="subject" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        id="subject"
                        name="subject"
                        value={formData.subject}
                        onChange={handleInputChange}
                        required
                        className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors"
                        placeholder="What's this about?"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-xs font-medium uppercase tracking-wider text-gray-400 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={5}
                      className="w-full bg-white border border-forest/15 rounded-lg py-3 px-4 text-sm text-dark placeholder:text-gray-300 outline-none focus:border-forest focus:ring-1 focus:ring-forest/20 transition-colors resize-none"
                      placeholder="Tell us more..."
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-dark text-white py-3.5 px-8 rounded-full text-sm font-medium hover:bg-forest transition-colors duration-300 disabled:opacity-50"
                  >
                    {isSubmitting ? "Sending..." : "Send Message"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
