import { notFound } from "next/navigation";
import Link from "next/link";
import { getAllPosts, getPostBySlug } from "@/lib/posts";
import type { Metadata } from "next";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateStaticParams() {
  return getAllPosts().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  return {
    title: `${post.title} | Nomadic Performance`,
    description: post.excerpt,
  };
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

// Very simple markdown-to-HTML renderer (headings, bold, paragraphs, lists)
function renderContent(content: string): string {
  const lines = content.trim().split("\n");
  const output: string[] = [];
  let inList = false;

  for (const rawLine of lines) {
    const line = rawLine;

    if (line.startsWith("## ")) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<h2>${line.slice(3)}</h2>`);
    } else if (line.startsWith("### ")) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<h3>${line.slice(4)}</h3>`);
    } else if (line.startsWith("**") && line.endsWith("**")) {
      if (inList) { output.push("</ul>"); inList = false; }
      output.push(`<p><strong>${line.slice(2, -2)}</strong></p>`);
    } else if (line.startsWith("- ")) {
      if (!inList) { output.push("<ul>"); inList = true; }
      const item = line.slice(2).replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      output.push(`<li>${item}</li>`);
    } else if (line.trim() === "") {
      if (inList) { output.push("</ul>"); inList = false; }
    } else {
      if (inList) { output.push("</ul>"); inList = false; }
      const formatted = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      output.push(`<p>${formatted}</p>`);
    }
  }

  if (inList) output.push("</ul>");
  return output.join("\n");
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const badgeClass =
    categoryColors[post.category] ??
    "bg-amber-500/10 text-amber-400 border-amber-500/20";

  const htmlContent = renderContent(post.content);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-b from-zinc-900 to-[#0f1117] border-b border-zinc-800 py-14">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-zinc-500 hover:text-amber-400 text-sm font-medium mb-8 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to all posts
          </Link>

          <div className="flex items-center gap-3 mb-5">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${badgeClass}`}>
              {post.category}
            </span>
            <span className="text-zinc-500 text-sm">{post.readTime}</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-extrabold text-white leading-snug mb-5">
            {post.title}
          </h1>

          <p className="text-zinc-400 text-lg leading-relaxed mb-6">{post.excerpt}</p>

          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-zinc-900 font-bold text-sm">
              NP
            </div>
            <div>
              <p className="text-white text-sm font-semibold">Nomadic Performance</p>
              <p className="text-zinc-500 text-xs">{formatDate(post.date)}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div
          className="prose"
          dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
      </article>

      {/* Footer nav */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="border-t border-zinc-800 pt-10 flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-amber-500 hover:text-amber-400 font-semibold text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Blog
          </Link>
          <Link
            href="/about"
            className="text-zinc-500 hover:text-zinc-300 text-sm transition-colors"
          >
            About Nomadic Performance →
          </Link>
        </div>
      </div>
    </div>
  );
}
