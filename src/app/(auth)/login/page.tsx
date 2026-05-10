import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

export default function LoginChooserPage() {
  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4f0ff_100%)] text-violet-950">
      <header className="fixed inset-x-0 top-3 z-50 px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/60 px-4 shadow-xl shadow-violet-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/45 sm:px-5">
          <Link href="/" className="flex min-h-11 items-center">
            <span className="brand-wordmark text-xl sm:text-2xl">FairReward</span>
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 hover:text-violet-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <div className="w-full max-w-4xl rounded-[2rem] border border-violet-100 bg-white/85 p-5 shadow-2xl shadow-violet-100/80 backdrop-blur sm:p-8 lg:p-10">
          <div className="mx-auto max-w-xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-violet-500">
              Secure access
            </p>
            <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight text-violet-950 sm:text-4xl">
              Sign in to FairReward
            </h1>
          </div>

          <div className="mt-9 grid gap-4 sm:grid-cols-2">
            <Link
              href="/login/employee"
              className="group flex min-h-48 flex-col justify-between rounded-3xl border border-violet-100 bg-[#fbfaff] p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-violet-300 hover:shadow-xl hover:shadow-violet-100"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <User className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-5 w-5 text-violet-400 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-500">Employee</p>
                <h2 className="mt-1 text-xl font-bold text-violet-950">Employee portal</h2>
              </div>
            </Link>

            <Link
              href="/login/admin"
              className="group flex min-h-48 flex-col justify-between rounded-3xl border border-violet-200 bg-violet-600 p-6 text-white shadow-xl shadow-violet-200 transition-all hover:-translate-y-0.5 hover:bg-violet-700"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/15 text-white">
                  <Building2 className="h-5 w-5" />
                </div>
                <ArrowRight className="mt-2 h-5 w-5 text-violet-100 transition-transform group-hover:translate-x-1" />
              </div>
              <div>
                <p className="text-sm font-semibold text-violet-100">Admin / HR</p>
                <h2 className="mt-1 text-xl font-bold">Admin portal</h2>
              </div>
            </Link>
          </div>

          <p className="mt-8 text-center text-sm text-violet-500">
            Need admin access?{" "}
            <Link
              href="/signup/admin"
              className="font-semibold text-violet-700 underline-offset-4 hover:underline"
            >
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
