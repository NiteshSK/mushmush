import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import DeliveryButton from "../Help/DeliveryButton";
import { Address, CONTACT } from "../Help/ContactOptions";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/*
 * Every statement below comes from the shop's own records: the earlier About and
 * homepage copy, the footer, the catalogue, and the training programs and instructors
 * in the database. Leave out dates, volumes, awards and certifications until the
 * owner can document them.
 */
const SHELVES = [
  { href: "/shop/fresh-mushrooms", name: "Fresh mushrooms", note: "Dehradun only" },
  { href: "/shop/dried-mushrooms", name: "Dried mushrooms", note: "Across India" },
  { href: "/shop/spices", name: "Spices", note: "Across India" },
  { href: "/shop/dry-fruits", name: "Dry fruits", note: "Across India" },
  { href: "/shop/seeds", name: "Seeds", note: "Across India" },
  // Spawn and grow bags are growing supplies, not food. No delivery note until their delivery area is confirmed.
  { href: "/#grow", name: "Spawn and grow bags", note: "For growing mushrooms, not for eating" },
];

export default function AboutUs() {
  return (
    <main id="main" className={`${p.page} ${h.help}`}>
      <header>
        <p className={p.kicker}>Our story</p>
        <div className={p.pageHead}><h1>Grown in <em>Herbertpur.</em></h1></div>
        <p className={h.lead}>Kosvana is a Himalayan food shop in Herbertpur, Dehradun. It began with mushrooms. Today its pantry ships across India.</p>
      </header>

      <div className={h.columns}>
        <div className={h.prose}>
          <p>Kosvana began when three friends, Nitesh Singh Kataria, left their conventional jobs to grow mushrooms full-time in Herbertpur, in the foothills of Uttarakhand.</p>
          <p>They are still the growers. They look after every stage of cultivation themselves. Fresh mushrooms from the farm go to kitchens in Dehradun.</p>
          <p>The shop has grown into a pantry. Dried mushrooms, whole spices, dry fruits and seeds now travel from Herbertpur to homes across India.</p>

          <section className={h.section} aria-labelledby="shelves-title">
            <h2 id="shelves-title">What we sell</h2>
            <ul className={h.shelves}>
              {SHELVES.map(shelf => (
                <li key={shelf.href}><Link href={shelf.href}><b>{shelf.name}</b><span>{shelf.note}</span><ArrowRight aria-hidden="true" /></Link></li>
              ))}
            </ul>
          </section>

          <section className={h.section} aria-labelledby="teach-title">
            <h2 id="teach-title">We teach <em>growing.</em></h2>
            <p>Pravesh Rawat and Vikrant Rai teach 5-day training programs in oyster and shiitake mushroom growing. The programs are for anyone who wants to grow mushrooms, from home growers to people who plan to start a farm.</p>
            <Link href="/training" className={h.outline}>See training dates and fees<ArrowRight aria-hidden="true" /></Link>
          </section>

          <section className={h.section} aria-labelledby="find-title">
            <h2 id="find-title">Find us</h2>
            <Address />
            <a href={CONTACT.maps} target="_blank" rel="noopener noreferrer" className={h.inlineLink}>Open in Google Maps<ArrowUpRight aria-hidden="true" /><span className={p.srOnly}> (opens in a new tab)</span></a>
          </section>

          <section className={`${h.section} ${h.nextSteps}`} aria-labelledby="next-title">
            <h2 id="next-title">What you can do <em>next</em></h2>
            <ul>
              <li><Link href="/shop" className={h.solid}>Shop the pantry<ArrowRight aria-hidden="true" /></Link>
                <p>Dried mushrooms, spices, dry fruits and seeds.</p></li>
              <li><Link href="/training" className={h.outline}>Learn to grow mushrooms<ArrowRight aria-hidden="true" /></Link>
                <p>5-day oyster and shiitake programs.</p></li>
              <li><DeliveryButton className={h.outline} />
                <p>Fresh mushrooms in Dehradun. The pantry ships across India.</p></li>
              <li><Link href="/contact" className={h.outline}>Contact us<ArrowRight aria-hidden="true" /></Link>
                <p>WhatsApp, phone, email or a message.</p></li>
            </ul>
          </section>
        </div>

        <aside className={`${h.aside} ${h.sticky}`} aria-labelledby="glance-title">
          <h2 id="glance-title">At a glance</h2>
          <dl className={h.facts}>
            <div><dt>Home</dt><dd>Herbertpur, Dehradun, Uttarakhand</dd></div>
            <div><dt>Founders</dt><dd>Nitesh Singh Kataria</dd></div>
            <div><dt>Fresh</dt><dd>Mushrooms, sold in Dehradun only</dd></div>
            <div><dt>Pantry</dt><dd>Dried mushrooms, spices, dry fruits and seeds, shipped across India</dd></div>
            <div><dt>Training</dt><dd>5-day oyster and shiitake mushroom programs</dd></div>
            <div><dt>Company</dt><dd>Kosvana by Mush Agro Products LLP</dd></div>
          </dl>
        </aside>
      </div>
    </main>
  );
}
