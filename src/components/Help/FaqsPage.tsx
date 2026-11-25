import Link from "next/link";
import ContactOptions from "./ContactOptions";
import Faqs from "./Faqs";
import type { ShippingSummary } from "./money";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/** /faqs: delivery answers first, with contact options beside the questions. */
export default function FaqsPage({ shipping }: { shipping: ShippingSummary }) {
  return (
    <main id="main" className={`${p.page} ${h.help}`}>
      <header>
        <p className={p.kicker}>Help</p>
        <div className={p.pageHead}><h1>Questions, <em>answered.</em></h1></div>
        <p className={h.lead}>Delivery, payment, storage and training. Fresh mushrooms are sold in Dehradun only. The rest of the pantry ships across India.</p>
      </header>
      <div className={h.columns}>
        <Faqs shipping={shipping} />
        <aside className={`${h.aside} ${h.sticky}`} aria-labelledby="help-title">
          <h2 id="help-title">Still need help?</h2>
          <p>Message, call or email the Kosvana team.</p>
          <ContactOptions />
          <Link href="/contact" className={p.textAction}>Send us a message</Link>
        </aside>
      </div>
    </main>
  );
}
