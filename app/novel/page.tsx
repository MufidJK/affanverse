import { redirect } from "next/navigation";

// Novel index — redirects to Volume 1 by default
export default function NovelIndex() {
  redirect("/novel/vol-1");
}
