import Link from "next/link";
import { Post } from "@/lib/posts";

interface PostCardProps {
  post: Post;
  featured?: boolean;
}

const categoryColors: Record<string, string> = {
  "Training Science": "bg-blue-500/10 text-blue-400 border-blue-500/20",
  Nutrition: "bg-green-500/10 text-green-400 border-green-500/20",
  "Mental Performance": "bg-purple-500/10 text-purple-400 border-purple-500/20",
  "Strength & Conditioning": "bg-red-500/10 text-red-400 border-red-500/20",
  Recovery: "bg-teal-500/10 text-teal-400 border-teal-500/20",
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export default function PostCard({ post, featured = false }: PostCardProps) {
  const badgeClass =
    categoryColors[post.category] ??
    "bg-amber-500/10 text-amber-400 border-amber-500/20";

  if (featured) {
    return (
      <Link href={`/blog/${post.slug}`} className="group block">
        <article className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl overflow-hidden hover:border-amber-500/40 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/5">
          {/* Colored accent bar */}
          <div className="h-1 bg-gradient-to-r from-amber-500 to-amber-400" />
          <div className="p-7">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}
              >
                {post.category}
              </span>
              <span className="text-zinc-500 text-sm">{post.readTime}</span>
            </div>
            <h2 className="text-white text-xl font-bold leading-snug mb-3 group-hover:text-amber-400 transition-colors">
              {post.title}
            </h2>
            <p className="text-zinc-400 text-sm leading-relaxed mb-5 line-clamp-3">
              {post.excerpt}
            </p>
            <div className="flex items-center justify-between">
              <time className="text-zinc-500 text-xs">{formatDate(post.date)}</time>
              <span className="text-amber-500 text-sm font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                Read more
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </span>
            </div>
          </div>
        </article>
      </Link>
    );
  }

  return (
    <Link href={`/blog/${post.slug}`} className="group block">
      <article className="flex gap-4 py-5 border-b border-zinc-800 hover:border-zinc-700 transition-colors last:border-0">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${badgeClass}`}
            >
              {post.category}
            </span>
            <span className="text-zinc-600 text-xs">{post.readTime}</span>
          </div>
          <h3 className="text-white font-semibold leading-snug mb-1 group-hover:text-amber-400 transition-colors line-clamp-2">
            {post.title}
          </h3>
          <p className="text-zinc-500 text-sm line-clamp-2">{post.excerpt}</p>
          <time className="text-zinc-600 text-xs mt-2 block">{formatDate(post.date)}</time>
        </div>
        <div className="flex-shrink-0 self-center">
          <svg
            className="w-4 h-4 text-zinc-600 group-hover:text-amber-500 transition-colors"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </article>
    </Link>
  );
}
