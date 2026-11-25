/**
 * Business and legal facts for /terms and /privacy that the code base cannot supply.
 *
 * Every entry with `value: null` is unknown. The owner (with a lawyer) must fill it in.
 * Search for "TODO_OWNER" to find them. While a value is null, the pages show a
 * safe general sentence instead, so shoppers never see placeholder text.
 * When you fill a value in, check the sentence that uses it in TermsPage.tsx or
 * PrivacyPage.tsx, and update `LAST_UPDATED`.
 */
export type OwnerFact = { value: string | null; TODO_OWNER: string };

/** The date the policy text last changed (shown as "Last updated"). */
export const LAST_UPDATED = "2026-11-25";

export const LEGAL_FACTS = {
  legalEntity: {
    value: null,
    TODO_OWNER: "Registered legal name and type of the seller, with its registration number (LLPIN or CIN). The invoice footer in src/lib/invoice.ts says \"Mush Agro Products LLP\"; confirm it.",
  },
  gstin: {
    value: null,
    TODO_OWNER: "GSTIN of the seller, if registered.",
  },
  grievanceOfficer: {
    value: null,
    TODO_OWNER: "Name and designation of the grievance officer (E-Commerce Rules 2020, rule 4(4); DPDP Act 2023, section 8(10)).",
  },
  grievanceTimeline: {
    value: null,
    TODO_OWNER: "Time to acknowledge and to resolve a complaint, for example \"acknowledge within 48 hours, resolve within one month\". Confirm with a lawyer.",
  },
  cancellationPolicy: {
    value: null,
    TODO_OWNER: "Until when a shopper can cancel an order (for example before payment, before dispatch), and whether fresh items can be cancelled.",
  },
  returnsPolicy: {
    value: null,
    TODO_OWNER: "Which items can be returned or replaced, and the window in days after delivery to report a damaged, wrong or missing item.",
  },
  refundTimeline: {
    value: null,
    TODO_OWNER: "How refunds are paid (to the same UPI account?) and in how many days after approval.",
  },
  trainingCancellation: {
    value: null,
    TODO_OWNER: "Cancellation and refund rules for training registrations.",
  },
  dataRetention: {
    value: null,
    TODO_OWNER: "How long each kind of data is kept (accounts, orders and invoices, payment proofs, contact messages, newsletter list).",
  },
  governingLaw: {
    value: null,
    TODO_OWNER: "Governing law and the city whose courts have jurisdiction.",
  },
  hostingProvider: {
    value: null,
    TODO_OWNER: "Name of the company that hosts the website and its database, and the country where the data is stored.",
  },
} satisfies Record<string, OwnerFact>;

export type LegalFactKey = keyof typeof LEGAL_FACTS;

/** The owner's value for a fact, or null while it is unknown. */
export const known = (key: LegalFactKey): string | null => (LEGAL_FACTS[key] as OwnerFact).value;

/** "25 November 2026" */
export const formatLegalDate = (iso: string) => {
  const [year, month, day] = iso.split("-").map(Number);
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  return `${day} ${months[month - 1]} ${year}`;
};
