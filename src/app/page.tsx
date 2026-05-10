import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

const metrics = [
  { label: "Audit ready", value: "100%" },
  { label: "Reward cycles", value: "12x" },
  { label: "Team visibility", value: "24/7" },
];

const features = [
  {
    title: "Bias-aware reviews",
    copy: "Flag gaps before rewards are published, with audit context ready for HR.",
    icon: ShieldCheck,
  },
  {
    title: "Clear performance signals",
    copy: "Give managers and employees one shared view of KPIs, feedback, and progress.",
    icon: TrendingUp,
  },
  {
    title: "Employee-first rewards",
    copy: "Make redemptions, bonuses, and recognition simple enough to use every week.",
    icon: Users,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-dvh overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f7f3ff_54%,#eee8ff_100%)] text-violet-950">
      <header className="fixed inset-x-0 top-3 z-50 px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/60 px-4 shadow-xl shadow-violet-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/45 sm:px-5">
          <Link href="/" className="flex min-h-11 items-center">
            <span className="brand-wordmark text-xl sm:text-2xl">FairReward</span>
          </Link>

          <nav className="flex items-center gap-2 sm:gap-3" aria-label="Primary navigation">
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 hover:text-violet-900"
            >
              Log in
            </Link>
            <Link
              href="/signup/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-full bg-violet-600 px-4 text-sm font-bold text-white shadow-lg shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-700"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="px-5 pb-14 pt-28 sm:px-6 sm:pb-20 sm:pt-32 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-4xl text-center">
              <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-violet-200 bg-white/80 px-4 py-2 text-sm font-semibold text-violet-600 shadow-sm">
                <Sparkles className="h-4 w-4" />
                Fair rewards, clearer decisions
              </div>
              <h1 className="mt-6 text-4xl font-extrabold leading-tight tracking-tight text-violet-950 sm:text-6xl lg:text-7xl">
                Reward your team with clarity and fairness.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-violet-700 sm:text-lg">
                FairReward helps HR teams run transparent reward cycles, spot bias early, and give
                employees a simple place to understand their growth.
              </p>

              <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-6 text-sm font-bold text-white shadow-xl shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-700 sm:w-auto"
                >
                  Open portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup/admin"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-violet-200 bg-white px-6 text-sm font-bold text-violet-950 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-50 sm:w-auto"
                >
                  Create admin account
                </Link>
              </div>
            </div>

            <div className="mt-14 overflow-hidden rounded-[2rem] border border-violet-100 bg-white/80 shadow-2xl shadow-violet-100/80 backdrop-blur">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-violet-100 p-6 sm:p-8 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-violet-500">Current cycle</p>
                      <h2 className="mt-1 text-2xl font-bold text-violet-950">May rewards</h2>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-4">
                    {[
                      { label: "Fairness audit", value: "92%", width: "w-[92%]" },
                      { label: "Published KPIs", value: "84%", width: "w-[84%]" },
                      { label: "Peer feedback", value: "76%", width: "w-[76%]" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-semibold text-violet-800">{item.label}</span>
                          <span className="font-bold text-violet-600">{item.value}</span>
                        </div>
                        <div className="h-2 rounded-full bg-violet-100">
                          <div className={`h-2 rounded-full bg-violet-600 ${item.width}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-6 sm:p-8">
                  <div className="grid gap-4 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-3xl border border-violet-100 bg-[#fbfaff] p-5"
                      >
                        <p className="text-3xl font-extrabold text-violet-950">{metric.value}</p>
                        <p className="mt-1 text-sm font-semibold text-violet-500">{metric.label}</p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 rounded-3xl bg-violet-600 p-5 text-white shadow-xl shadow-violet-200">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm font-semibold text-violet-100">Recommended action</p>
                        <h3 className="mt-1 text-xl font-bold">Review Sales allocation</h3>
                      </div>
                      <BarChart3 className="h-6 w-6 text-violet-100" />
                    </div>
                    <p className="mt-4 max-w-xl text-sm leading-6 text-violet-100">
                      Distribution is healthy overall. One department needs manager review before
                      rewards are finalized.
                    </p>
                  </div>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-3xl border border-violet-100 bg-white p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-violet-950">Cycle closes</p>
                        <p className="text-sm text-violet-500">May 28</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-3xl border border-violet-100 bg-white p-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-violet-950">Employees ready</p>
                        <p className="text-sm text-violet-500">148 profiles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="px-5 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-violet-500">
                Built for trust
              </p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-violet-950 sm:text-4xl">
                Everything HR needs to reward fairly.
              </h2>
            </div>

            <div className="mt-10 grid gap-4 md:grid-cols-3">
              {features.map((feature) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="rounded-3xl border border-violet-100 bg-white/80 p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-violet-100"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 text-xl font-bold text-violet-950">{feature.title}</h3>
                    <p className="mt-3 text-sm leading-6 text-violet-600">{feature.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <footer className="px-5 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 border-t border-violet-100 pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-violet-600 text-xs font-bold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-violet-950">FairReward</span>
          </div>
          <p className="text-sm text-violet-500">
            &copy; {new Date().getFullYear()} FairReward AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
