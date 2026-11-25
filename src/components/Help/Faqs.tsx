import type { ReactNode } from "react";
import Link from "next/link";
import DeliveryButton from "./DeliveryButton";
import { CONTACT } from "./ContactOptions";
import { rupees, type ShippingSummary } from "./money";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

type Faq = { question: string; answer: ReactNode; open?: boolean };
type Group = { id: string; title: string; faqs: Faq[] };

/**
 * Answers use only facts the shop can stand behind: the pricing code, the shipping_zones
 * table, the catalogue, the training programs and the homepage FAQ. Fees are passed in,
 * so a change to the fee constants or the zones reaches this page without a copy edit.
 */
export function faqGroups(shipping: ShippingSummary): Group[] {
  const { range } = shipping;
  return [
    {
      id: "delivery", title: "Delivery", faqs: [
        {
          open: true,
          question: "Where do you deliver?",
          answer: <>
            <p>Dried mushrooms, spices, dry fruits, seeds and the rest of the pantry ship across India. Fresh mushrooms are sold in Dehradun only.</p>
            <p>Enter your PIN code to check delivery to your address.</p>
            <DeliveryButton className={p.textAction} />
          </>,
        },
        {
          question: "Can I order fresh mushrooms outside Dehradun?",
          answer: <p>No. Fresh mushrooms are sold in Dehradun only. Outside Dehradun, you can order dried mushrooms and the rest of the pantry. <Link href="/shop">Browse the shop</Link>.</p>,
        },
        {
          question: "How much does shipping cost?",
          answer: <>
            <p>Orders of {rupees(shipping.freeFrom)} or more ship free.</p>
            <p>{range && range.max > range.min
              ? <>Below {rupees(shipping.freeFrom)}, shipping costs {rupees(range.min)} to {rupees(range.max)}, depending on your PIN code.</>
              : <>Below {rupees(shipping.freeFrom)}, shipping starts at {rupees(range?.min ?? shipping.baseFee)} and depends on your PIN code.</>}
              {" "}Checkout shows the exact fee before you pay.</p>
          </>,
        },
        {
          question: "How long does delivery take?",
          answer: <p>It depends on your PIN code. Checkout shows the estimated delivery time after you enter your PIN.</p>,
        },
        {
          question: "Are there other charges?",
          answer: <p>Checkout adds a {rupees(shipping.convenienceFee)} convenience fee to each order. You see the full total, with shipping and this fee, before you pay.</p>,
        },
      ],
    },
    {
      id: "orders", title: "Orders and payment", faqs: [
        {
          question: "How do I pay?",
          answer: <p>Checkout takes UPI payments. Before you pay, we send a one-time code to your email to confirm the order.</p>,
        },
        {
          question: "Do I need an account to order?",
          answer: <p>No. You can check out as a guest. Sign in to save your addresses and to see your orders in <Link href="/my-account">My account</Link>.</p>,
        },
        {
          question: "I have a problem with my order. What do I do?",
          answer: <p>Contact us by WhatsApp, phone or email, and include your order number. <Link href="/contact">See all contact options</Link>.</p>,
        },
      ],
    },
    {
      id: "products", title: "Products and storage", faqs: [
        {
          question: "What does Kosvana sell?",
          answer: <p>Fresh and dried mushrooms, spices, dry fruits and seeds. We also sell mushroom tinctures and powders. For growers, we sell mushroom spawn and grow bags. These are for growing mushrooms at home, not for eating. <Link href="/shop">Browse the shop</Link> or <Link href="/training#grow">learn to grow your own</Link>.</p>,
        },
        {
          question: "How do I store fresh mushrooms?",
          answer: <p>Keep them in a paper bag in the main part of the fridge, not the vegetable drawer, which can be too humid. The bag lets them breathe, so they do not turn slimy. Use them within 5 to 7 days.</p>,
        },
      ],
    },
    {
      id: "training", title: "Training and our farm", faqs: [
        {
          question: "Do you teach mushroom growing?",
          answer: <>
            <p>Yes. We run 5-day training programs in oyster and shiitake mushroom growing. They are for anyone who wants to grow mushrooms, from home growers to people who plan to start a farm.</p>
            <Link href="/training" className={p.textAction}>See training dates and fees</Link>
          </>,
        },
        {
          question: "What does the training cover?",
          answer: <p>Substrate preparation, inoculation, environmental control, harvesting and pest management, with hands-on practice.</p>,
        },
        {
          question: "Where are you?",
          answer: <p>NH 507, Herbertpur, Dehradun, Uttarakhand 248142. <a href={CONTACT.maps} target="_blank" rel="noopener noreferrer">Open in Google Maps<span className={p.srOnly}> (opens in a new tab)</span></a>.</p>,
        },
      ],
    },
  ];
}

export default function Faqs({ shipping }: { shipping: ShippingSummary }) {
  const groups = faqGroups(shipping);
  return (
    <div>
      <nav aria-label="Question topics" className={h.groupNav}>
        {groups.map(group => <a key={group.id} href={`#${group.id}`}>{group.title}</a>)}
      </nav>
      {groups.map(group => (
        <section key={group.id} id={group.id} className={h.group} aria-labelledby={`${group.id}-title`}>
          <h2 id={`${group.id}-title`}>{group.title}</h2>
          {group.faqs.map(faq => (
            <details key={faq.question} className={h.faq} open={faq.open}>
              <summary>{faq.question}</summary>
              <div className={h.answer}>{faq.answer}</div>
            </details>
          ))}
        </section>
      ))}
    </div>
  );
}
