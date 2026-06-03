import ChatWidget from "@/components/ChatWidget";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="border-b border-white/10 bg-slate-900/80 px-4 py-3 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-center text-sm font-medium text-slate-200">
          🤖 AI Support Demo
        </div>
      </div>

      <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,_rgba(59,130,246,0.18),_transparent_35%),radial-gradient(circle_at_top_right,_rgba(16,185,129,0.14),_transparent_30%),linear-gradient(180deg,_#0f172a_0%,_#111827_100%)]" />

        <div className="mx-auto grid max-w-6xl gap-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-8">
            <span className="inline-flex w-fit rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-blue-200">
              FlowCRM
            </span>

            <div className="space-y-5">
              <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-white sm:text-5xl lg:text-6xl">
                The CRM Built for Modern Teams
              </h1>
              <p className="max-w-2xl text-base leading-8 text-slate-300 sm:text-lg">
                FlowCRM helps sales and support teams move faster with unified conversations,
                automated lead capture, and a support assistant that never misses a follow-up.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <button className="rounded-full bg-blue-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/30 transition hover:bg-blue-400">
                Start Free Trial
              </button>
              <button className="rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10">
                Book a Demo
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: "⚡",
                  title: "Fast Setup",
                  text: "Launch your support and sales workflows in minutes.",
                },
                {
                  icon: "🤝",
                  title: "Unified Inbox",
                  text: "Track every customer conversation in one place.",
                },
                {
                  icon: "📈",
                  title: "Smart Insights",
                  text: "See pipeline trends and support performance at a glance.",
                },
              ].map((card) => (
                <div
                  key={card.title}
                  className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-[0_20px_60px_rgba(15,23,42,0.25)] backdrop-blur"
                >
                  <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500/15 text-2xl">
                    {card.icon}
                  </div>
                  <h2 className="text-base font-semibold text-white">{card.title}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-300">{card.text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-6 rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-[0_30px_80px_rgba(15,23,42,0.35)] backdrop-blur">
            <div className="rounded-[1.5rem] border border-emerald-400/20 bg-emerald-400/10 p-5">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-200">Pricing</p>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-slate-950/50 p-5">
                  <p className="text-sm font-medium text-slate-300">Starter</p>
                  <p className="mt-3 text-3xl font-semibold text-white">$29</p>
                  <p className="mt-2 text-sm text-slate-300">For growing teams getting started.</p>
                </div>
                <div className="rounded-2xl border border-blue-400/30 bg-blue-500/10 p-5">
                  <p className="text-sm font-medium text-blue-100">Business</p>
                  <p className="mt-3 text-3xl font-semibold text-white">$79</p>
                  <p className="mt-2 text-sm text-slate-300">For teams that need automation and scale.</p>
                </div>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-slate-950/40 p-5 text-sm leading-7 text-slate-300">
              Support, sales, and lead capture all work together to keep your team focused on the right conversations.
            </div>
          </div>
        </div>
      </section>

      <ChatWidget />
    </main>
  );
}