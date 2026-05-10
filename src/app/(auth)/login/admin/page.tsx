import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "./form";

export default function AdminLoginPage() {
  return (
    <main className="flex min-h-dvh flex-col overflow-x-hidden bg-[linear-gradient(180deg,#ffffff_0%,#f4f0ff_100%)] text-violet-950">
      <header className="fixed inset-x-0 top-3 z-50 px-4">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between rounded-full border border-white/70 bg-white/60 px-4 shadow-xl shadow-violet-200/40 backdrop-blur-xl supports-[backdrop-filter]:bg-white/45 sm:px-5">
          <Link href="/" className="flex min-h-11 items-center">
            <span className="brand-wordmark text-xl sm:text-2xl">FairReward</span>
          </Link>
          <Link
            href="/login"
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-sm font-semibold text-violet-700 transition-colors hover:bg-violet-50 hover:text-violet-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">All sign-in options</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <div className="w-full max-w-md rounded-[2rem] border border-violet-100 bg-white/85 p-5 shadow-2xl shadow-violet-100/80 backdrop-blur sm:p-8">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-violet-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-violet-600">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin portal
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-violet-950 sm:text-3xl">
              Admin sign in
            </h1>
          </div>

          <Suspense fallback={<div className="h-32" />}>
            <AdminLoginForm />
          </Suspense>

          <p className="mt-6 text-center text-sm text-violet-500">
            Need access?{" "}
            <Link
              href="/signup/admin"
              className="font-semibold text-violet-700 underline-offset-4 hover:underline"
            >
              Create admin account
            </Link>
          </p>
          <p className="mt-3 text-center text-sm text-violet-500">
            Employee?{" "}
            <Link
              href="/login/employee"
              className="font-semibold text-violet-700 underline-offset-4 hover:underline"
            >
              Use employee portal
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
