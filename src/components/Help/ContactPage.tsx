import ContactForm from "./ContactForm";
import ContactOptions, { type ContactDetails } from "./ContactOptions";
import DeliverySummary from "./DeliverySummary";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/** /contact: direct channels first (quickest on a phone), then the message form. */
export default function ContactPage({ freeFrom, contact }: { freeFrom: number; contact?: ContactDetails }) {
  return (
    <main id="main" className={`${p.page} ${h.help}`}>
      <header>
        <p className={p.kicker}>Contact</p>
        <div className={p.pageHead}><h1>Talk to <em>Kosvana.</em></h1></div>
        <p className={h.lead}>Ask about an order, a product, delivery or training. Message us on WhatsApp, call, or <a href="#message">send us a message</a>.</p>
      </header>
      <div className={`${h.columns} ${h.asideFirst}`}>
        <aside className={h.aside} aria-labelledby="reach-title">
          <h2 id="reach-title">Reach us directly</h2>
          <ContactOptions full contact={contact} />
          <DeliverySummary freeFrom={freeFrom} />
        </aside>
        <section id="message" className={`${h.aside} ${h.target}`} aria-labelledby="contact-form-title">
          <h2 id="contact-form-title">Send a message</h2>
          <ContactForm contact={contact} />
        </section>
      </div>
    </main>
  );
}
