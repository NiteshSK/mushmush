import { redirect } from "next/navigation";

/** Old template URL. It showed hard-coded posts, a post link that 404s, "#" pagination and placeholder categories. */
export default function BlogGridWithSidebarPage() {
  redirect("/blogs");
}
