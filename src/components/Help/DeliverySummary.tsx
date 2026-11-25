import Link from "next/link";
import DeliveryButton from "./DeliveryButton";
import { rupees } from "./money";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/** The short delivery answer: what ships where, the free-shipping threshold and a PIN check. */
export default function DeliverySummary({ freeFrom }: { freeFrom: number }) {
  return (
    <section className={h.deliveryBox} aria-labelledby="delivery-summary">
      <h2 id="delivery-summary">Delivery</h2>
      <ul>
        <li>Fresh mushrooms are sold in Dehradun only.</li>
        <li>Dried mushrooms, spices, dry fruits and seeds ship across India.</li>
        <li>Orders of {rupees(freeFrom)} or more ship free.</li>
      </ul>
      <div className={h.headActions}>
        <DeliveryButton className={p.textAction} />
        <Link href="/faqs#delivery" className={p.textAction}>Delivery questions</Link>
      </div>
    </section>
  );
}
