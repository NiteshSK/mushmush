import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import p from "../Pantry/pantry.module.css";
import h from "../Pantry/help.module.css";

/** Kosvana's published contact details (contact page, footer and homepage FAQ). */
export const CONTACT = {
  whatsapp: "https://wa.me/917618362662",
  phone: "+917618362662",
  phoneLabel: "+91 76183 62662",
  email: "concierge@kosvana.com",
  maps: "https://www.google.com/maps/place/Kosvana+by+MushAgroProducts/data=!4m2!3m1!1s0x0:0xc1d016cb5b5c812a",
  name: "Kosvana by Mush Agro Products",
  address: "NH 507, Herbertpur, Dehradun, Uttarakhand 248142",
  social: [] as {name:string;href:string}[],
};
export type ContactDetails = typeof CONTACT;

export function Address({ contact = CONTACT }: {contact?:ContactDetails}) {
  return (
    <address>
      {contact.name}<br />{contact.address}
    </address>
  );
}

/** WhatsApp, phone and email, with the address and opening hours when `full` is set. */
export default function ContactOptions({ full = false, contact = CONTACT }: { full?: boolean; contact?:ContactDetails }) {
  return (
    <ul className={h.contactList}>
      <li><span className={h.label}>WhatsApp</span>
        <a href={contact.whatsapp} target="_blank" rel="noopener noreferrer"><MessageCircle aria-hidden="true" />Message us on WhatsApp<span className={p.srOnly}> (opens in a new tab)</span></a></li>
      <li><span className={h.label}>Phone</span>
        <a href={`tel:${contact.phone}`}><Phone aria-hidden="true" />{contact.phoneLabel}</a></li>
      <li><span className={h.label}>Email</span>
        <a href={`mailto:${contact.email}`}><Mail aria-hidden="true" />{contact.email}</a></li>
      {full && <>
        <li><span className={h.label}>Address</span><Address contact={contact}/>
          <a href={contact.maps} target="_blank" rel="noopener noreferrer"><MapPin aria-hidden="true" />Open in Google Maps<span className={p.srOnly}> (opens in a new tab)</span></a></li>
        <li><span className={h.label}>Hours</span>
          <p className={h.hours}>Monday to Saturday, 9 am to 6 pm<br />Sunday, 9 am to 3 pm</p></li>
      </>}
      {full && contact.social.map(link=><li key={link.name}><a href={link.href} target="_blank" rel="noopener noreferrer">{link.name}</a></li>)}
    </ul>
  );
}
