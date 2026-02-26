import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-zinc-900 border-b border-zinc-800 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-5 h-5 text-zinc-900"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <span className="text-white font-bold text-lg tracking-tight group-hover:text-amber-400 transition-colors">
              Nomadic<span className="text-amber-500">Performance</span>
            </span>
          </Link>

          {/* Nav */}
          <nav className="flex items-center gap-6">
            <Link
              href="/"
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              Home
            </Link>
            <Link
              href="/blog"
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/about"
              className="text-zinc-400 hover:text-white text-sm font-medium transition-colors"
            >
              About
            </Link>
            <Link
              href="/blog"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-900 text-sm font-semibold px-4 py-2 rounded transition-colors"
            >
              Start Reading
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
