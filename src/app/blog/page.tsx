import { Suspense } from "react";
import { getAllPosts } from "@/lib/posts";
import BlogClient from "./BlogClient";

export const metadata = {
  title: "Blog | Nomadic Performance",
  description:
    "Browse all performance coaching articles covering training science, nutrition, mental performance, strength and conditioning, and recovery.",
};

export default function BlogPage() {
  const allPosts = getAllPosts();

  return (
    <Suspense>
      <BlogClient allPosts={allPosts} />
    </Suspense>
  );
}
