import Link from "next/link";
import { RETAIL_PROOF_HINT } from "@/lib/payment-proof";
import type { ContactDetails } from "../Help/ContactOptions";
import l from "../Pantry/legal.module.css";
import LegalPage, { type LegalSection } from "./LegalPage";
import SellerDetails from "./SellerDetails";
import { known } from "./legal-facts";
import { VisitAnalyticsPreference } from "../VisitAnalytics/VisitTracker";
import { VISIT_RETENTION_DAYS } from "@/lib/visit-analytics";

/** Sign-in session length: `session.maxAge` in src/lib/auth.ts (15 * 60 seconds). */
const SESSION_MINUTES = 15;
/** One-time codes expire after five minutes (src/app/api/checkout/send-otp and src/app/api/auth/send-signup-otp). */
const CODE_MINUTES = 5;

/*
 * Privacy policy, laid out along the Digital Personal Data Protection Act 2023:
 * who decides how data is used, what is collected and why, consent, the people
 * who process data for us, the user's rights and a grievance contact.
 * Each statement describes what the code does today (prisma/schema.prisma,
 * src/app/api/**, src/lib/**). Unknown facts live in legal-facts.ts.
 */
export default function PrivacyPage({ contact }: { contact: ContactDetails }) {
  const email = <a href={`mailto:${contact.email}`}>{contact.email}</a>;
  const officer = known("grievanceOfficer");
  const timeline = known("grievanceTimeline");
  const retention = known("dataRetention");
  const hosting = known("hostingProvider");

  const sections: LegalSection[] = [
    {
      id: "who",
      title: "Who we are",
      body: <>
        <p>{contact.name} runs this website. We decide why and how your personal data is used on it. Under the Digital Personal Data Protection Act 2023, we are the data fiduciary.</p>
        <SellerDetails contact={contact} />
      </>,
    },
    {
      id: "collect",
      title: "Data we collect",
      body: <>
        <h3>Your account</h3>
        <ul>
          <li><span>Your name, email address and, if you give it, your mobile number.</span></li>
          <li><span>Your password, stored only as a one-way hash. We cannot read it.</span></li>
          <li><span>If you sign in with Google, Google shares your name, email address and profile picture with us.</span></li>
        </ul>
        <h3>Orders and payments</h3>
        <ul>
          <li><span>Your saved addresses, and the name, email, phone and delivery address on each order.</span></li>
          <li><span>The items, prices, fees, coupon and total of each order, and its invoice.</span></li>
          <li><span>The UPI transaction ID that you enter, and the payment screenshot or receipt if you upload one ({RETAIL_PROOF_HINT.replace(/\.$/, "")}). We do not receive your UPI PIN or bank details.</span></li>
        </ul>
        <h3>One-time codes</h3>
        <p>When you sign up or check out, we send a code to your email, and by SMS if you give a mobile number. We store the code only as a hash. It expires after {CODE_MINUTES} minutes.</p>
        <h3>Shopping activity</h3>
        <ul>
          <li><span>Your wishlist and the products you viewed recently, when you are signed in.</span></li>
          <li><span>If you allow visit analytics, we record which shop pages you visit, when you use selected shopping features and the order of those actions. We use a random visit ID and link the visit to your account if you sign in.</span></li>
          <li><span>Reviews you write: the rating and comment. We show your name with your review.</span></li>
          <li><span>Your email address, if you ask us to tell you when a product is back in stock.</span></li>
        </ul>
        <h3>Other forms</h3>
        <ul>
          <li><span>Newsletter: your email address and, if you give it, your name.</span></li>
          <li><span>Training registration: your name, email, phone, address, preferred start date and any special needs that you tell us.</span></li>
          <li><span>Contact form: your name, email, phone if you give it, subject and message. We send the message to our team by email.</span></li>
          <li><span>Chat assistant: the questions you type.</span></li>
        </ul>
        <h3>Technical data</h3>
        <p>Our servers use your IP address for a short time to stop too many requests, for example to the chat assistant or the sign-up form.</p>
      </>,
    },
    {
      id: "purposes",
      title: "Why we use it",
      body: <>
        <p>We use your data only for these purposes:</p>
        <ul>
          <li><span>To create your account and sign you in.</span></li>
          <li><span>To confirm your email address with a one-time code.</span></li>
          <li><span>To price, pack and deliver your order, and to send you order emails and invoices.</span></li>
          <li><span>To verify your UPI payment.</span></li>
          <li><span>To run training courses that you register for.</span></li>
          <li><span>To answer your messages and chat questions.</span></li>
          <li><span>To send the newsletter or a back-in-stock email, if you ask for it.</span></li>
          <li><span>With your permission, to see where the shop is hard to use and improve it.</span></li>
          <li><span>To keep the site secure and to keep the records that the law requires.</span></li>
        </ul>
      </>,
    },
    {
      id: "consent",
      title: "Your consent and choices",
      body: <>
        <p>You give us your data when you create an account, place an order, register for training, subscribe or send a message. We use it for the purpose of that action.</p>
        <p>You can withdraw your consent at any time. This does not change what we did before.</p>
        <ul>
          <li><span>Newsletter: use the unsubscribe link in any newsletter email.</span></li>
          <li><span>Wishlist and addresses: remove items from your <Link href="/wishlist">wishlist</Link> and your <Link href="/addresses">saved addresses</Link>.</span></li>
          <li><span>Anything else: email {email}.</span></li>
        </ul>
        <p>If you withdraw consent for data that an open order needs, we may not be able to complete that order.</p>
      </>,
    },
    {
      id: "services",
      title: "Services that handle data for us",
      body: <>
        <p>These services process data for us, only to do the job listed:</p>
        <dl className={l.pairs}>
          <div><dt>Google</dt><dd>Google sign-in. Sending email. The chat assistant: your chat questions go to Google Gemini to write the answers. We do not save chat questions in our database.</dd></div>
          <div><dt>Zoho Mail</dt><dd>Sending email.</dd></div>
          <div><dt>MSG91</dt><dd>Sending one-time codes by SMS to your mobile number.</dd></div>
          <div><dt>Vercel Blob</dt><dd>Storing invoice PDFs, and product and article images.</dd></div>
          <div><dt>Hosting</dt><dd>{hosting ?? "Our hosting provider runs the website and the database."}</dd></div>
        </dl>
        <p>Some news articles show photos from Unsplash. We do not send your personal data to Unsplash.</p>
        <p>We also share data when the law requires it.</p>
      </>,
    },
    {
      id: "cookies",
      title: "Cookies and browser storage",
      body: <>
        <p>When you sign in, we set a secure session cookie that keeps you signed in. It signs you out after {SESSION_MINUTES} minutes without activity. The sign-in system also sets cookies that protect forms from misuse.</p>
        <p>Your bag is saved in your browser&apos;s local storage on this device, so it stays when you close the page.</p>
        <p>If you allow visit analytics, we store a cookie to remember that choice and a visit ID in your current browser tab. Visit records are kept for {VISIT_RETENTION_DAYS} days after the last recorded activity. We do not record text entered in forms, searches, checkout credentials, or payment details as part of visit analytics.</p>
        <VisitAnalyticsPreference />
      </>,
    },
    {
      id: "security",
      title: "How we protect data",
      body: <>
        <p>Passwords and one-time codes are stored only as hashes. Payment screenshots are stored in our database. Only the staff who verify payments can open them. Sign-in cookies are sent only over secure connections.</p>
      </>,
    },
    {
      id: "retention",
      title: "How long we keep data",
      body: <p>{retention ?? "We keep your data while your account is open, and for as long as we need it for the purposes above or for our tax and accounting records. To ask us to delete data sooner, contact us."}</p>,
    },
    {
      id: "rights",
      title: "Your rights",
      body: <>
        <p>Under the Digital Personal Data Protection Act 2023, you can:</p>
        <ul>
          <li><span><strong>Access</strong> a summary of your data and how we use it.</span></li>
          <li><span><strong>Correct</strong> or update your data. You can change your name and mobile number in <Link href="/my-account">your account</Link>, and your <Link href="/addresses">addresses</Link>, yourself.</span></li>
          <li><span><strong>Erase</strong> your data when we no longer need it. Some order and invoice records must stay for the law.</span></li>
          <li><span><strong>Nominate</strong> a person to use these rights for you if you die or cannot act.</span></li>
          <li><span><strong>Complain</strong> to us, as below.</span></li>
        </ul>
        <p>To use any right, email {email} from the email address on your account.</p>
      </>,
    },
    {
      id: "grievance",
      title: "Grievance contact",
      body: <>
        <p>For a question or complaint about your data, contact us.</p>
        <SellerDetails contact={contact} />
        {officer && <p>Grievance officer: {officer}.</p>}
        {timeline && <p>{timeline}</p>}
        <p>If our reply does not solve your complaint, you can complain to the Data Protection Board of India.</p>
      </>,
    },
    {
      id: "changes",
      title: "Changes to this policy",
      body: <p>When we change this policy, we change the date at the top of this page. Read our <Link href="/terms">terms of sale</Link> for how orders work.</p>,
    },
  ];

  return (
    <LegalPage
      title={<>Your <em>privacy.</em></>}
      lead="What personal data Kosvana collects, why, who helps us handle it, and how you can see, correct or erase it."
      sections={sections}
    />
  );
}
