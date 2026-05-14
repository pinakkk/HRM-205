import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

export default function LoginChooserPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-[#f4f5ff] text-indigo-950">
      <div className="fr-blobs" aria-hidden />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-indigo-500" aria-hidden />
            <span className="brand-wordmark text-2xl sm:text-[1.7rem]">FairReward</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-indigo-800 transition-colors hover:bg-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex min-h-dvh items-center justify-center px-4 pb-10 pt-24 sm:px-6 sm:pt-28">
        <div className="w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/60 bg-white/70 shadow-[0_1px_3px_rgba(67,56,202,0.05),0_30px_80px_-30px_rgba(67,56,202,0.28)] backdrop-blur-xl animate-fade-up">
          <div className="grid lg:grid-cols-[0.95fr_1.05fr]">
            {/* Left — marketing panel */}
            <aside className="relative hidden overflow-hidden bg-gradient-to-br from-indigo-600 via-indigo-500 to-indigo-400 p-10 text-white lg:flex lg:flex-col lg:justify-end">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-white/15 blur-3xl"
              />
              <div
                aria-hidden
                className="pointer-events-none absolute -bottom-28 -left-20 h-80 w-80 rounded-full bg-sky-300/25 blur-3xl"
              />

              <div className="relative">
                <h2 className="font-display text-4xl font-medium leading-[1.1] tracking-tight">
                  Reward your team the <span className="italic text-indigo-100">fair</span> way.
                </h2>
              </div>
            </aside>

            {/* Right — role chooser */}
            <section className="bg-white p-7 sm:p-10">
              <h1 className="font-display text-3xl font-medium leading-tight tracking-tight text-indigo-950 sm:text-4xl">
                Sign in
              </h1>

              <div className="mt-8 grid gap-3">
                <Link
                  href="/login/employee"
                  className="group flex items-center justify-between gap-4 rounded-2xl border border-indigo-100 bg-[#f8f9ff] p-5 transition-all hover:-translate-y-0.5 hover:border-indigo-300 hover:bg-white hover:shadow-[0_14px_36px_-18px_rgba(67,56,202,0.3)]"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 transition-colors group-hover:bg-indigo-600 group-hover:text-white">
                      <User className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-lg font-medium text-indigo-950">
                      Employee
                    </h2>
                  </div>
                  <ArrowRight className="h-5 w-5 shrink-0 text-indigo-400 transition-all group-hover:translate-x-1 group-hover:text-indigo-700" />
                </Link>

                <Link
                  href="/login/admin"
                  className="group relative flex items-center justify-between gap-4 overflow-hidden rounded-2xl border border-indigo-900/15 bg-gradient-to-br from-indigo-700 via-indigo-600 to-indigo-500 p-5 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(67,56,202,0.55)]"
                >
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/10 blur-2xl"
                  />
                  <div className="relative flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15 text-white ring-1 ring-white/20 backdrop-blur">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-lg font-medium">Admin</h2>
                  </div>
                  <ArrowRight className="relative h-5 w-5 shrink-0 text-indigo-100 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </section>
          </div>
        </div>
      </div>
    </main>
  );
}
