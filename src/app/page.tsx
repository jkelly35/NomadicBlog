import Link from "next/link";
import { getRecentPosts, getCategories } from "@/lib/posts";
import PostCard from "@/components/PostCard";

export default function HomePage() {
  const recentPosts = getRecentPosts(3);
  const categories = getCategories();

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-800">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 0,transparent 50%),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 0,transparent 50%)",
            backgroundSize: "40px 40px",
          }}
        />
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-amber-500 rounded-full" />
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Performance Coaching
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              Train Smarter.{" "}
              <span className="text-amber-500">Perform Better.</span>{" "}
              Go Further.
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed mb-8 max-w-xl">
              Evidence-based coaching insights for athletes who refuse to accept
              ordinary. Dive into training science, nutrition, mental performance,
              and recovery strategies used by elite competitors worldwide.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/blog"
                className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                Explore All Posts
              </Link>
              <Link
                href="/about"
                className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
              >
                About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="bg-zinc-800/60 border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-3 divide-x divide-zinc-700">
            {[
              { value: "6+", label: "Expert Articles" },
              { value: "5", label: "Topic Categories" },
              { value: "100%", label: "Evidence-Based" },
            ].map((stat) => (
              <div key={stat.label} className="py-6 px-4 text-center">
                <div className="text-2xl font-extrabold text-amber-500">{stat.value}</div>
                <div className="text-zinc-500 text-xs mt-1 uppercase tracking-wide">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Posts */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Latest Content
            </p>
            <h2 className="text-3xl font-bold text-white">Recent Posts</h2>
          </div>
          <Link
            href="/blog"
            className="text-amber-500 hover:text-amber-400 text-sm font-semibold flex items-center gap-1 transition-colors"
          >
            View all
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {recentPosts.map((post) => (
            <PostCard key={post.slug} post={post} featured />
          ))}
        </div>
      </section>

      {/* Categories */}
      <section className="border-t border-zinc-800 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-10">
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-2">
              Browse by Topic
            </p>
            <h2 className="text-3xl font-bold text-white">Categories</h2>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <Link
                key={cat}
                href={`/blog?category=${encodeURIComponent(cat)}`}
                className="border border-zinc-700 hover:border-amber-500/60 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300 hover:text-amber-400 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
              >
                {cat}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="bg-gradient-to-r from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to reach your potential?
          </h2>
          <p className="text-zinc-400 max-w-xl mx-auto mb-8">
            Explore our library of performance articles and discover the strategies
            that top athletes use to consistently perform at their best.
          </p>
          <Link
            href="/blog"
            className="inline-block bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-8 py-3.5 rounded-lg transition-colors"
          >
            Start Reading
          </Link>
        </div>
      </section>
    </div>
  );
}
