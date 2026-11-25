import { CONTACT } from "@/components/Help/ContactOptions";
import { DEFAULT_SETTINGS } from "./shop-settings";
import { prisma } from "./prisma";

export async function publicContactDetails() {
  const settings: Record<string, string> = Object.fromEntries(
    DEFAULT_SETTINGS.map((s) => [s.key, s.value]),
  );
  try {
    const saved = await prisma.globalConfig.findMany({
      where: { key: { in: Object.keys(settings) } },
      select: { key: true, value: true },
    });
    for (const row of saved) settings[row.key] = row.value;
  } catch {
    return CONTACT;
  }
  const safeLink = (value: string) => {
    try {
      const url = new URL(value);
      return ["http:", "https:"].includes(url.protocol) ? url.href : "";
    } catch {
      return "";
    }
  };
  const social = Object.entries({
    Instagram: settings.instagram_url,
    Facebook: settings.facebook_url,
    X: settings.twitter_url,
  })
    .map(([name, value]) => ({ name, href: safeLink(value) }))
    .filter((link) => Boolean(link.href));
  return {
    name: settings.company_name,
    address: settings.company_address,
    email: settings.contact_email,
    phoneLabel: settings.contact_phone,
    phone: settings.contact_phone.replace(/[^\d+]/g, ""),
    whatsapp: "https://wa.me/" + settings.whatsapp_number.replace(/\D/g, ""),
    maps: safeLink(settings.google_maps_link) || CONTACT.maps,
    social,
  };
}
