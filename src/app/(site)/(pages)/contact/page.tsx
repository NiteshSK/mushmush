import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Page | MushMush",
  description: "This is Contact Page for MushMush",
};

export default function ContactPage() {
  return (
    <main>
      <div className="min-h-screen bg-gray-2 py-20">
        <div className="max-w-[1170px] w-full mx-auto px-4 sm:px-8 xl:px-0">
          <h1 className="text-3xl font-bold text-center mb-8">Contact Us</h1>
          <div className="bg-white rounded-xl shadow-1 p-8">
            <p className="text-center text-gray-600">
              Contact page is coming soon. Please check back later.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
