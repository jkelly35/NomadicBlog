import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-zinc-900 border-t border-zinc-800 mt-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-3 mb-4">
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
              <span className="text-white font-bold text-lg">
                Nomadic<span className="text-amber-500">Performance</span>
              </span>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              Evidence-based coaching for athletes who refuse to accept ordinary.
              Train smarter. Perform better. Go further.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Navigate
            </h3>
            <ul className="space-y-2">
              {[
                { href: "/", label: "Home" },
                { href: "/blog", label: "All Posts" },
                { href: "/about", label: "About Us" },
              ].map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-zinc-400 hover:text-amber-400 text-sm transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Mission */}
          <div>
            <h3 className="text-white font-semibold mb-4 text-sm uppercase tracking-widest">
              Our Mission
            </h3>
            <p className="text-zinc-400 text-sm leading-relaxed">
              To make elite performance knowledge accessible to every athlete,
              regardless of where their journey takes them.
            </p>
          </div>
        </div>

        <div className="border-t border-zinc-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-zinc-500 text-sm">
            &copy; {new Date().getFullYear()} Nomadic Performance. All rights reserved.
          </p>
          <p className="text-zinc-500 text-sm">
            Built for athletes. By athletes.
          </p>
        </div>
      </div>
    </footer>
  );
}
