import { redirect } from "next/navigation";

/** Old template URL with no article of its own. Articles live at /blogs/[slug]. */
export default function BlogDetailsPage() {
  redirect("/blogs");
}
