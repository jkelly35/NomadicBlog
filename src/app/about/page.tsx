import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About | Nomadic Performance",
  description:
    "Learn about Nomadic Performance, our coaching philosophy, mission, and core values. We help athletes reach their full potential through evidence-based coaching.",
};

const values = [
  {
    icon: "⚡",
    title: "Science Over Hype",
    description:
      "Every recommendation we make is grounded in peer-reviewed research and practical field experience. We cut through the noise so you don't have to.",
  },
  {
    icon: "🎯",
    title: "Athlete-First Philosophy",
    description:
      "Coaching is not one-size-fits-all. We meet athletes where they are and build programs around their unique physiology, schedule, and goals.",
  },
  {
    icon: "🌍",
    title: "Nomadic Mindset",
    description:
      "Peak performance follows you anywhere in the world. We develop adaptable athletes who can train, compete, and thrive regardless of environment.",
  },
  {
    icon: "📈",
    title: "Long-Term Development",
    description:
      "We play the long game. Sustainable performance improvements compound over years, not weeks. We build athletes, not quick fixes.",
  },
  {
    icon: "🤝",
    title: "Radical Transparency",
    description:
      "We share the 'why' behind every method. An educated athlete is an empowered athlete who can make smart decisions independently.",
  },
  {
    icon: "🔥",
    title: "Relentless Standards",
    description:
      "Good enough is never good enough. We hold ourselves and our athletes to the highest standards of preparation, execution, and reflection.",
  },
];

const pillars = [
  {
    number: "01",
    title: "Training Architecture",
    description:
      "Structured periodization tailored to your sport, schedule, and performance timeline. From base building to peaking for key events.",
  },
  {
    number: "02",
    title: "Metabolic Nutrition",
    description:
      "Fueling strategies that match your training load, support recovery, and optimize body composition without sacrificing performance.",
  },
  {
    number: "03",
    title: "Mental Performance",
    description:
      "Evidence-based psychological skills training: focus control, pre-competition routines, resilience building, and visualization protocols.",
  },
  {
    number: "04",
    title: "Recovery Optimization",
    description:
      "Sleep, active recovery, monitoring, and load management strategies that maximize adaptation from every training session.",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-b border-zinc-800 py-20 md:py-28">
        <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-amber-500/8 rounded-full blur-3xl pointer-events-none" />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-4 py-1.5 mb-6">
              <span className="text-amber-400 text-xs font-semibold uppercase tracking-widest">
                Our Story
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-[1.1] tracking-tight mb-6">
              About{" "}
              <span className="text-amber-500">Nomadic Performance</span>
            </h1>
            <p className="text-zinc-400 text-lg leading-relaxed max-w-2xl">
              We exist for athletes who refuse to settle. Who chase excellence not
              because they have to—but because mediocrity is simply not an option.
              Nomadic Performance is a coaching company built around one
              principle: the best coaching should be accessible everywhere.
            </p>
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-3">
              Our Purpose
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-6 leading-tight">
              Democratizing Elite<br />Performance Knowledge
            </h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              For too long, access to elite coaching has been reserved for
              professional athletes with professional budgets. Nomadic Performance
              was founded to change that.
            </p>
            <p className="text-zinc-400 leading-relaxed mb-5">
              We synthesize the latest sports science research, combine it with
              hard-won field experience, and make it accessible to every athlete—
              from the weekend warrior to the aspiring professional—regardless of
              where they are in the world.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              Our mission is simple:{" "}
              <strong className="text-white">
                help athletes perform at the absolute ceiling of their potential
              </strong>
              —and enjoy the journey of getting there.
            </p>
          </div>

          {/* Mission statement card */}
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20 rounded-2xl p-8 md:p-10">
            <div className="w-12 h-12 bg-amber-500 rounded-xl flex items-center justify-center mb-6">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="w-7 h-7 text-zinc-900"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <blockquote className="text-white text-xl font-bold leading-snug mb-4">
              &ldquo;To make elite performance knowledge accessible to every athlete,
              regardless of where their journey takes them.&rdquo;
            </blockquote>
            <p className="text-amber-400 text-sm font-semibold uppercase tracking-widest">
              — Our Mission
            </p>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="border-t border-zinc-800 bg-zinc-900/40 py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-3">
              What We Stand For
            </p>
            <h2 className="text-3xl md:text-4xl font-extrabold text-white">
              Our Core Values
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v) => (
              <div
                key={v.title}
                className="bg-zinc-800/50 border border-zinc-700/50 rounded-xl p-6 hover:border-amber-500/30 transition-colors"
              >
                <div className="text-3xl mb-4">{v.icon}</div>
                <h3 className="text-white font-bold text-lg mb-2">{v.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coaching Pillars */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-14">
          <p className="text-amber-500 text-xs font-semibold uppercase tracking-widest mb-3">
            The Framework
          </p>
          <h2 className="text-3xl md:text-4xl font-extrabold text-white">
            The Four Pillars of Performance
          </h2>
          <p className="text-zinc-400 mt-4 max-w-xl mx-auto">
            Elite performance is built on four interconnected foundations.
            Neglect any one of them and you leave results on the table.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((p) => (
            <div
              key={p.number}
              className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-7 flex gap-5 hover:border-amber-500/30 transition-colors"
            >
              <div className="text-amber-500 font-black text-3xl leading-none flex-shrink-0 opacity-60">
                {p.number}
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{p.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{p.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-zinc-800 bg-zinc-900/50 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
            Ready to start your journey?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-xl mx-auto">
            Explore our library of evidence-based performance articles and
            start applying elite training principles to your own athletic journey.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/blog"
              className="bg-amber-500 hover:bg-amber-400 text-zinc-900 font-bold px-8 py-3.5 rounded-lg transition-colors"
            >
              Read the Blog
            </Link>
            <Link
              href="/"
              className="border border-zinc-600 hover:border-zinc-400 text-zinc-300 hover:text-white font-semibold px-8 py-3.5 rounded-lg transition-colors"
            >
              Go Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
