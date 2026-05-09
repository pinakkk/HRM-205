import Link from "next/link";
import { ArrowRight, ShieldCheck, TrendingUp, Users } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white text-neutral-900">
      {/* Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-white font-bold">
              F
            </div>
            <span className="text-xl font-semibold tracking-tight">FairReward</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-medium text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-neutral-900 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-neutral-800"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-7xl">
              Reward your team with clarity and fairness.
            </h1>
            <p className="mt-6 text-lg leading-8 text-neutral-600 sm:text-xl">
              The modern, bias-aware, and AI-assisted compensation system built for forward-thinking HR teams and their employees. No guesswork, just equitable rewards.
            </p>
            <div className="mt-10 flex items-center justify-center gap-4">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 rounded-md bg-neutral-900 px-6 py-3 text-sm font-medium text-white shadow-sm transition-all hover:bg-neutral-800 hover:-translate-y-0.5"
              >
                Get started for free
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-md border border-neutral-200 bg-white px-6 py-3 text-sm font-medium text-neutral-900 shadow-sm transition-colors hover:bg-neutral-50 hover:-translate-y-0.5"
              >
                Employee Portal
              </Link>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="border-t border-neutral-200 bg-neutral-50 px-6 py-24 sm:py-32 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="mb-16 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">
                A system built for trust
              </h2>
              <p className="mt-4 text-lg text-neutral-600">
                Designed to minimize bias and maximize transparency across your entire organization.
              </p>
            </div>
            
            <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3">
              {/* Feature 1 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-900 text-white">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Bias-Aware Engine</h3>
                <p className="mt-2 text-neutral-600">
                  Our AI models analyze compensation data to identify and flag potential discrepancies, ensuring fair pay for everyone.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg border border-neutral-200 bg-white text-neutral-900 shadow-sm">
                  <TrendingUp className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Performance Tracking</h3>
                <p className="mt-2 text-neutral-600">
                  Tie rewards directly to transparent, measurable performance metrics that employees understand and trust.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="flex flex-col items-center text-center sm:items-start sm:text-left sm:col-span-2 lg:col-span-1 lg:mx-0 mx-auto">
                <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900">
                  <Users className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-neutral-900">Unified HR Platform</h3>
                <p className="mt-2 text-neutral-600">
                  A seamless experience for both administrators and employees, bringing all compensation data into one place.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-200 bg-white px-6 py-12 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-neutral-900 text-xs font-bold text-white">
              F
            </div>
            <span className="text-sm font-semibold tracking-tight text-neutral-900">FairReward</span>
          </div>
          <p className="text-sm text-neutral-500">
            &copy; {new Date().getFullYear()} FairReward AI. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
