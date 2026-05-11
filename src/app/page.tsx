import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  CalendarCheck,
  ShieldCheck,
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
    <div className="min-h-dvh overflow-x-hidden bg-[#fafaf7] text-violet-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-violet-100/70 bg-[#fafaf7]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 items-center">
            <span className="brand-wordmark text-2xl sm:text-[1.7rem]">FairReward</span>
          </Link>

          <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary navigation">
            <Link
              href="/login"
              className="inline-flex min-h-10 items-center rounded-full px-4 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-50"
            >
              Log in
            </Link>
            <Link
              href="/signup/admin"
              className="inline-flex min-h-10 items-center justify-center rounded-full bg-violet-200 px-4 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-300"
            >
              Get started
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <section className="px-5 pb-16 pt-32 sm:px-6 sm:pb-24 sm:pt-36 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="mx-auto max-w-3xl text-center animate-fade-up [animation-delay:80ms]">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-600">
                For HR & people teams
              </p>
              <h1 className="mt-5 font-display text-[2.5rem] font-medium leading-[1.05] tracking-tight text-violet-950 sm:text-6xl lg:text-[4.25rem]">
                Reward your team with{" "}
                <span className="italic text-violet-700">clarity</span> and fairness.
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-base leading-7 text-violet-800/80 sm:text-lg sm:leading-8">
                FairReward helps HR teams run transparent reward cycles, surface bias before it ships,
                and give every employee a clear view of how their work is recognized.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/login"
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-violet-200 px-6 text-sm font-semibold text-violet-900 transition-colors hover:bg-violet-300 sm:w-auto"
                >
                  Open portal
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/signup/admin"
                  className="inline-flex min-h-12 w-full items-center justify-center rounded-full border border-violet-200 bg-white px-6 text-sm font-semibold text-violet-900 transition-colors hover:border-violet-300 hover:bg-violet-50 sm:w-auto"
                >
                  Create admin account
                </Link>
              </div>
            </div>

            <div className="mt-16 overflow-hidden rounded-2xl border border-violet-100 bg-white shadow-[0_1px_3px_rgba(76,29,149,0.04),0_20px_60px_-30px_rgba(76,29,149,0.18)] animate-fade-up [animation-delay:240ms]">
              <div className="grid gap-0 lg:grid-cols-[0.9fr_1.1fr]">
                <div className="border-b border-violet-100 p-7 sm:p-9 lg:border-b-0 lg:border-r">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-violet-500">
                        Current cycle
                      </p>
                      <h2 className="mt-2 font-display text-2xl font-medium text-violet-950">
                        May rewards
                      </h2>
                    </div>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                      <BadgeCheck className="h-5 w-5" />
                    </div>
                  </div>

                  <div className="mt-8 space-y-5">
                    {[
                      { label: "Fairness audit", value: "92%", width: "w-[92%]" },
                      { label: "Published KPIs", value: "84%", width: "w-[84%]" },
                      { label: "Peer feedback", value: "76%", width: "w-[76%]" },
                    ].map((item) => (
                      <div key={item.label}>
                        <div className="mb-2 flex items-center justify-between text-sm">
                          <span className="font-medium text-violet-900">{item.label}</span>
                          <span className="font-semibold tabular-nums text-violet-700">
                            {item.value}
                          </span>
                        </div>
                        <div className="h-1.5 overflow-hidden rounded-full bg-violet-100">
                          <div
                            className={`h-full rounded-full bg-violet-400 ${item.width}`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-7 sm:p-9">
                  <div className="grid gap-3 sm:grid-cols-3">
                    {metrics.map((metric) => (
                      <div
                        key={metric.label}
                        className="rounded-xl border border-violet-100 bg-[#fbfaff] p-5"
                      >
                        <p className="font-display text-3xl font-medium tabular-nums text-violet-950">
                          {metric.value}
                        </p>
                        <p className="mt-1 text-xs font-medium uppercase tracking-wider text-violet-500">
                          {metric.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 rounded-xl border border-violet-200 bg-violet-100 p-5 text-violet-950">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-violet-600">
                          Recommended action
                        </p>
                        <h3 className="mt-1.5 font-display text-xl font-medium">
                          Review Sales allocation
                        </h3>
                      </div>
                      <BarChart3 className="h-5 w-5 shrink-0 text-violet-600" />
                    </div>
                    <p className="mt-3 max-w-xl text-sm leading-6 text-violet-700/90">
                      Distribution is healthy overall. One department needs manager review before
                      rewards are finalized.
                    </p>
                  </div>

                  <div className="mt-4 grid gap-3 sm:grid-cols-2">
                    <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-white p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                        <CalendarCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-950">Cycle closes</p>
                        <p className="text-sm text-violet-500">May 28</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 rounded-xl border border-violet-100 bg-white p-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                        <Users className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-violet-950">Employees ready</p>
                        <p className="text-sm text-violet-500">148 profiles</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-violet-100/70 px-5 py-20 sm:px-6 sm:py-24 lg:px-8">
          <div className="mx-auto max-w-6xl">
            <div className="max-w-2xl animate-fade-up">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-600">
                Built for trust
              </p>
              <h2 className="mt-4 font-display text-3xl font-medium tracking-tight text-violet-950 sm:text-4xl">
                Everything HR needs to reward fairly.
              </h2>
            </div>

            <div className="mt-12 grid gap-px overflow-hidden rounded-xl border border-violet-100 bg-violet-100 md:grid-cols-3">
              {features.map((feature, idx) => {
                const Icon = feature.icon;

                return (
                  <article
                    key={feature.title}
                    className="bg-white p-7 transition-colors hover:bg-[#fbfaff] animate-fade-up"
                    style={{ animationDelay: `${120 + idx * 90}ms` }}
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-50 text-violet-700">
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="mt-6 font-display text-xl font-medium text-violet-950">
                      {feature.title}
                    </h3>
                    <p className="mt-3 text-sm leading-6 text-violet-700/80">{feature.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
