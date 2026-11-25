import Link from "next/link";
import { RETAIL_PROOF_HINT } from "@/lib/payment-proof";
import type { ContactDetails } from "../Help/ContactOptions";
import { rupees, type ShippingSummary } from "../Help/money";
import LegalPage, { type LegalSection } from "./LegalPage";
import SellerDetails from "./SellerDetails";
import { known } from "./legal-facts";

/*
 * Terms of sale, laid out along the Consumer Protection (E-Commerce) Rules 2020:
 * seller details, pricing, payment, delivery, cancellation, returns and refunds,
 * and grievance redressal. Each statement describes what the code does today.
 * Fees come from src/lib/shipping.ts, src/lib/fees.ts and the shipping_zones table.
 * Unknown business facts live in legal-facts.ts.
 */
export default function TermsPage({ contact, shipping }: { contact: ContactDetails; shipping: ShippingSummary }) {
  const email = <a href={`mailto:${contact.email}`}>{contact.email}</a>;
  const phone = <a href={`tel:${contact.phone}`}>{contact.phoneLabel}</a>;
  const { range } = shipping;
  const cancellation = known("cancellationPolicy");
  const returns = known("returnsPolicy");
  const refunds = known("refundTimeline");
  const trainingCancellation = known("trainingCancellation");
  const officer = known("grievanceOfficer");
  const timeline = known("grievanceTimeline");
  const law = known("governingLaw");

  const sections: LegalSection[] = [
    {
      id: "seller",
      title: "Who sells to you",
      body: <>
        <p>This website is the shop of {contact.name}. When you buy from this site, you buy from us.</p>
        <SellerDetails contact={contact} />
      </>,
    },
    {
      id: "orders",
      title: "Accounts and orders",
      body: <>
        <p>You can order with an account or as a guest. Before we place an order, we send a one-time code to your email. Enter the code to confirm that the email address is yours.</p>
        <p>If you create an account, keep your password private. You are responsible for orders placed from your account.</p>
        <p>Give a correct name, phone number and delivery address. We use them to deliver your order and to contact you about it.</p>
      </>,
    },
    {
      id: "products",
      title: "Products and stock",
      body: <>
        <p>Each product page shows the pack size, the price and whether the item is in stock. Stock is limited.</p>
        <p>We check stock when you place an order. We set the items aside when you send your payment details. If an item sells out before that, we tell you and you cannot pay for it.</p>
        <p>Fresh mushrooms are sold in Dehradun only. Dried mushrooms, spices, dry fruits, seeds and other pantry goods ship across India.</p>
      </>,
    },
    {
      id: "prices",
      title: "Prices and fees",
      body: <>
        <p>Prices are in Indian rupees (₹). Our server works out the price of each item, any discount or coupon, the shipping fee and the convenience fee when you place the order. The checkout shows the full total before you pay.</p>
        <ul>
          <li><span>Orders of {rupees(shipping.freeFrom)} or more ship free.</span></li>
          <li><span>{range && range.max > range.min
            ? <>Below {rupees(shipping.freeFrom)}, shipping costs {rupees(range.min)} to {rupees(range.max)}, depending on your PIN code.</>
            : <>Below {rupees(shipping.freeFrom)}, shipping starts at {rupees(range?.min ?? shipping.baseFee)} and depends on your PIN code.</>}</span></li>
          <li><span>Each order has a {rupees(shipping.convenienceFee)} convenience fee.</span></li>
        </ul>
        <p>If a price on the site is different from the price at checkout, the checkout price applies.</p>
      </>,
    },
    {
      id: "payment",
      title: "Payment",
      body: <>
        <p>We take payment by UPI. After you pay, enter the UPI transaction ID at checkout. You can also upload a screenshot or receipt of the payment ({RETAIL_PROOF_HINT.replace(/\.$/, "")}).</p>
        <p>We verify each payment. Your order is confirmed only after we verify the payment. Until then, the order is not confirmed.</p>
        <p>We never ask for your UPI PIN, card number or bank password.</p>
      </>,
    },
    {
      id: "delivery",
      title: "Delivery",
      body: <>
        <p>Check delivery with your PIN code before you order. Fresh mushrooms deliver only to the Dehradun PIN codes that we serve. If your bag has fresh mushrooms and your address is outside that area, checkout asks you to remove them. You can still order the other items.</p>
        <p>The shipping fee and the delivery time depend on your PIN code.</p>
      </>,
    },
    {
      id: "cancellation",
      title: "Cancellation",
      body: <>
        {cancellation
          ? <p>{cancellation}</p>
          : <p>To cancel an order, contact us at {email} or {phone} as soon as possible. Give your order number. We will tell you if the order can still be cancelled.</p>}
        <p>If we cannot supply your order, we can cancel it. We tell you by email if this happens.</p>
      </>,
    },
    {
      id: "returns",
      title: "Returns and refunds",
      body: <>
        {returns
          ? <p>{returns}</p>
          : <p>If an item arrives damaged, wrong or missing, contact us at {email} or {phone}. Give your order number. We will explain the next steps.</p>}
        {refunds
          ? <p>{refunds}</p>
          : <p>If we agree to a refund, we tell you the amount and how we will pay it.</p>}
      </>,
    },
    {
      id: "training",
      title: "Training courses",
      body: <>
        <p>You need an account to register for a <Link href="/training">training course</Link>. Training fees are paid by UPI in the same way as orders. A registration is confirmed after we verify the payment.</p>
        {trainingCancellation
          ? <p>{trainingCancellation}</p>
          : <p>To change or cancel a registration, contact us at {email}.</p>}
      </>,
    },
    {
      id: "assistant",
      title: "Chat assistant",
      body: <p>The chat assistant on this site writes its answers automatically. An answer can be wrong. The product page and the checkout show the correct price, stock and delivery for your order.</p>,
    },
    {
      id: "grievances",
      title: "Complaints",
      body: <>
        <p>If you have a complaint about a product, an order, a payment or this site, contact us. Give your order number and describe the problem.</p>
        <SellerDetails contact={contact} />
        {officer && <p>Grievance officer: {officer}.</p>}
        {timeline && <p>{timeline}</p>}
        <p>You can also read how we handle your data in our <Link href="/privacy">privacy policy</Link>.</p>
      </>,
    },
    {
      id: "law",
      title: "Law and changes",
      body: <>
        <p>{law ?? "These terms follow the laws of India."}</p>
        <p>We can change these terms. When we do, we change the date at the top of this page. The terms on the day you place an order apply to that order.</p>
      </>,
    },
  ];

  return (
    <LegalPage
      title={<>Terms of <em>sale.</em></>}
      lead="How ordering, payment, delivery and returns work at Kosvana."
      sections={sections}
    />
  );
}
