import { redirect } from "next/navigation";

/** Old template URL. Its search box did nothing, its tags needed an admin login and linked to an unsupported filter. */
export default function NewsWithSidebarPage() {
  redirect("/news");
}
