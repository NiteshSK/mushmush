import React from "react";
import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-dark text-white">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 xl:px-0">
        {/* Main footer */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12 pt-12 sm:pt-16 pb-10 sm:pb-12">
          {/* Brand column */}
          <div className="sm:col-span-2 lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <Image
                src="/images/logo/logo.png"
                alt="Kosvana"
                width={110}
                height={7}
                className="object-contain invert"
              />
            </Link>
            <p className="text-white/50 text-sm leading-relaxed mb-6 max-w-xs">
              Premium mushrooms, dry fruits, seeds & spices from Dehradun, India. Naturally sourced, 100% organic.
            </p>

            {/* Social links */}
            <div className="flex items-center gap-4">
              <a
                href="https://www.facebook.com/profile.php?id=61580744744948"
                aria-label="Facebook"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/mushagroprod/"
                aria-label="Instagram"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/917618362662"
                aria-label="WhatsApp"
                className="w-9 h-9 rounded-full border border-white/20 flex items-center justify-center text-white/50 hover:text-white hover:border-white/40 transition-colors"
                target="_blank"
                rel="noopener noreferrer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </a>
            </div>
          </div>

          {/* Shop column */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Shop</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/shop" className="text-sm text-white/60 hover:text-white transition-colors">All Products</Link></li>
              <li><Link href="/shop?category=edible" className="text-sm text-white/60 hover:text-white transition-colors">Fresh Mushrooms</Link></li>
              <li><Link href="/shop?category=dry-fruits" className="text-sm text-white/60 hover:text-white transition-colors">Dry Fruits</Link></li>
              <li><Link href="/shop?category=seeds" className="text-sm text-white/60 hover:text-white transition-colors">Seeds</Link></li>
              <li><Link href="/shop?category=spices" className="text-sm text-white/60 hover:text-white transition-colors">Spices</Link></li>
              <li><Link href="/training" className="text-sm text-white/60 hover:text-white transition-colors">Training Programs</Link></li>
            </ul>
          </div>

          {/* Company column */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Company</h3>
            <ul className="flex flex-col gap-3">
              <li><Link href="/about-us" className="text-sm text-white/60 hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/blogs" className="text-sm text-white/60 hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/faqs" className="text-sm text-white/60 hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

          {/* Contact column */}
          <div>
            <h3 className="text-xs font-medium uppercase tracking-[0.15em] text-white/40 mb-6">Get in Touch</h3>
            <ul className="flex flex-col gap-4">
              <li>
                <a
                  href="https://www.google.com/maps/place/MushMush+by+MushAgroProducts/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-white/60 hover:text-white transition-colors leading-relaxed"
                >
                  NH 507, Herbertpur,<br />Dehradun, 248142
                </a>
              </li>
              <li>
                <a href="tel:+917618362662" className="text-sm text-white/60 hover:text-white transition-colors">
                  (+91) 7618362662
                </a>
              </li>
              <li>
                <a href="mailto:concierge@kosvana.com" className="text-sm text-white/60 hover:text-white transition-colors">
                  concierge@kosvana.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-white/10 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-white/40">
            &copy; {year} Kosvana by Mush Agro Products LLP. All rights reserved.
          </p>
          <div className="flex items-center gap-5">
            <Image src="/images/payment/payment-01.svg" alt="Visa" width={40} height={14} className="opacity-40 hover:opacity-70 transition-opacity" />
            <Image src="/images/payment/payment-03.svg" alt="Mastercard" width={24} height={16} className="opacity-40 hover:opacity-70 transition-opacity" />
            <Image src="/images/payment/payment-05.svg" alt="Google Pay" width={36} height={14} className="opacity-40 hover:opacity-70 transition-opacity" />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
