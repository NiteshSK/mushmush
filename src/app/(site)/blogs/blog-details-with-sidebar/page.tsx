import { redirect } from "next/navigation";

/** Old template URL. It was lorem ipsum with a stock photo and dead "#" links, not a real article. */
export default function BlogDetailsWithSidebarPage() {
  redirect("/blogs");
}
