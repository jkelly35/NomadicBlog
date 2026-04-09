"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Post, getCategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";

interface BlogClientProps {
  allPosts: Post[];
}

export default function BlogClient({ allPosts }: BlogClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [selectedCategory, setSelectedCategory] = useState(
    searchParams.get("category") ?? ""
  );

  const categories = getCategories();

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (selectedCategory) params.set("category", selectedCategory);
    const qs = params.toString();
    router.replace(qs ? `/blog?${qs}` : "/blog", { scroll: false });
  }, [query, selectedCategory, router]);

  const filtered = allPosts.filter((post) => {
    const matchesQuery =
      !query ||
      post.title.toLowerCase().includes(query.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(query.toLowerCase()) ||
      post.category.toLowerCase().includes(query.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesQuery && matchesCategory;
  });

  return (
    <div className="min-h-screen">
      {/* Header */}
      <section className="bg-gradient-to-b from-zinc-900 to-[#0f1117] border-b border-zinc-800 py-14">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-2">
            Knowledge Base
          </p>
          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
            All Posts
          </h1>
          <p className="text-zinc-400 max-w-xl mb-8">
            Browse our full library of performance coaching articles or search
            for a specific topic.
          </p>

          {/* Search */}
          <div className="relative max-w-xl">
            <svg
              className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts…"
              className="w-full bg-zinc-800 border border-zinc-700 focus:border-amber-500/60 focus:outline-none text-zinc-200 placeholder-zinc-500 pl-12 pr-4 py-3 rounded-lg text-sm transition-colors"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                aria-label="Clear search"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          {/* Sidebar */}
          <aside className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24">
              <h2 className="text-zinc-400 text-xs font-semibold uppercase tracking-widest mb-4">
                Filter by Category
              </h2>
              <div className="flex flex-row lg:flex-col flex-wrap gap-2">
                <button
                  onClick={() => setSelectedCategory("")}
                  className={`text-sm px-3 py-1.5 rounded-lg text-left transition-colors ${
                    !selectedCategory
                      ? "bg-amber-500 text-zinc-900 font-semibold"
                      : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                  }`}
                >
                  All Topics
                </button>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat ? "" : cat)
                    }
                    className={`text-sm px-3 py-1.5 rounded-lg text-left transition-colors ${
                      selectedCategory === cat
                        ? "bg-amber-500 text-zinc-900 font-semibold"
                        : "bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          {/* Posts */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-6">
              <p className="text-zinc-500 text-sm">
                {filtered.length === 0
                  ? "No posts found"
                  : `${filtered.length} post${filtered.length !== 1 ? "s" : ""}`}
                {(query || selectedCategory) && " matching your filters"}
              </p>
              {(query || selectedCategory) && (
                <button
                  onClick={() => {
                    setQuery("");
                    setSelectedCategory("");
                  }}
                  className="text-amber-500 hover:text-amber-400 text-xs font-semibold transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl">
                <div className="text-5xl mb-4">🔍</div>
                <h3 className="text-zinc-300 font-semibold text-lg mb-2">No posts found</h3>
                <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                  Try a different search term or remove your category filter.
                </p>
              </div>
            ) : (
              <div className="bg-zinc-900/40 border border-zinc-800 rounded-2xl px-6">
                {filtered.map((post) => (
                  <PostCard key={post.slug} post={post} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
