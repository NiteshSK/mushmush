import { redirect } from "next/navigation";

/** Old template URL. It repeated /blogs under a template title, so it now sends readers there. */
export default function BlogGridPage() {
  redirect("/blogs");
}
