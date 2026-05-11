import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

export default function LoginChooserPage() {
  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[#fafaf7] text-violet-950">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-violet-100/70 bg-[#fafaf7]/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
          <Link href="/" className="flex min-h-11 items-center">
            <span className="brand-wordmark text-2xl sm:text-[1.7rem]">FairReward</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-violet-800 transition-colors hover:bg-violet-50"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <div className="w-full max-w-3xl rounded-2xl border border-violet-100 bg-white p-6 shadow-[0_1px_3px_rgba(76,29,149,0.04),0_20px_60px_-30px_rgba(76,29,149,0.18)] sm:p-10 animate-fade-up">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-xs font-medium uppercase tracking-[0.22em] text-violet-600">
              Secure access
            </p>
            <h1 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-violet-950 sm:text-4xl">
              Sign in to FairReward
            </h1>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Link
              href="/login/employee"
              className="group flex min-h-44 flex-col justify-between rounded-2xl border border-violet-100 bg-[#fbfaff] p-6 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-white hover:shadow-[0_10px_30px_-15px_rgba(76,29,149,0.25)] animate-fade-up [animation-delay:120ms]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-violet-100 text-violet-700">
                  <User className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-5 w-5 text-violet-400 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-violet-500">
                  Employee
                </p>
                <h2 className="mt-1.5 font-display text-xl font-medium text-violet-950">
                  Employee portal
                </h2>
              </div>
            </Link>

            <Link
              href="/login/admin"
              className="group flex min-h-44 flex-col justify-between rounded-2xl border border-violet-200 bg-violet-100 p-6 text-violet-950 transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:bg-violet-200/70 hover:shadow-[0_10px_30px_-15px_rgba(76,29,149,0.25)] animate-fade-up [animation-delay:200ms]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/70 text-violet-700">
                  <Building2 className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-5 w-5 text-violet-500 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <p className="text-xs font-medium uppercase tracking-wider text-violet-600">
                  Admin / HR
                </p>
                <h2 className="mt-1.5 font-display text-xl font-medium">Admin portal</h2>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-violet-600">
            Need admin access?{" "}
            <Link
              href="/signup/admin"
              className="font-medium text-violet-800 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
