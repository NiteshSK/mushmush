import type { ContactDetails } from "../Help/ContactOptions";
import l from "../Pantry/legal.module.css";
import { known } from "./legal-facts";

/** Seller name, address, email and phone, from the shop settings (global_configs) with the defaults as fallback. */
export default function SellerDetails({ contact }: { contact: ContactDetails }) {
  const entity = known("legalEntity");
  const gstin = known("gstin");
  return (
    <dl className={l.pairs}>
      <div><dt>Seller</dt><dd>{contact.name}{entity && <><br />{entity}</>}</dd></div>
      <div><dt>Address</dt><dd><address>{contact.address}</address></dd></div>
      <div><dt>Email</dt><dd><a href={`mailto:${contact.email}`}>{contact.email}</a></dd></div>
      <div><dt>Phone</dt><dd><a href={`tel:${contact.phone}`}>{contact.phoneLabel}</a></dd></div>
      {gstin && <div><dt>GSTIN</dt><dd>{gstin}</dd></div>}
    </dl>
  );
}
