import { publicContactDetails } from "@/lib/public-contact";
import type { Metadata } from "next";
import ContactPage from "@/components/Help/ContactPage";
import PantryShell from "@/components/Pantry/PantryShell";
import { FREE_SHIPPING_THRESHOLD } from "@/lib/shipping";

export const metadata: Metadata = {
  title: "Contact | Kosvana",
  description: "Contact Kosvana in Herbertpur, Dehradun by WhatsApp, phone, email or message about orders, products, delivery and training.",
};

export const dynamic = "force-dynamic";
export default async function ContactRoute() {
  const contact = await publicContactDetails();
  return (
    <PantryShell browseHref="/shop">
      <ContactPage contact={contact} freeFrom={FREE_SHIPPING_THRESHOLD} />
    </PantryShell>
  );
}
