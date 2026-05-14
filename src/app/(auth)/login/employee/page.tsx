import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { EmployeeAuthPanel } from "./form";

function FormSkeleton() {
  return (
    <div className="mt-8 space-y-3">
      <div className="fr-skeleton h-12 w-full rounded-lg" />
      <div className="fr-skeleton h-3 w-2/3 rounded" />
    </div>
  );
}

export default function EmployeeLoginPage() {
  return (
    <main className="relative flex min-h-dvh flex-col overflow-hidden bg-[#f4f5ff] text-indigo-950">
      <div className="fr-blobs" aria-hidden />

      <header className="absolute inset-x-0 top-0 z-30">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-6 lg:px-8">
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

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_1px_3px_rgba(67,56,202,0.05),0_20px_60px_-30px_rgba(67,56,202,0.22)] backdrop-blur-xl sm:p-9 animate-fade-up">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Employee portal
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-indigo-950">
              Welcome back
            </h1>
          </div>

          <Suspense fallback={<FormSkeleton />}>
            <EmployeeAuthPanel />
          </Suspense>

          <p className="mt-6 text-center text-sm text-indigo-700">
            HR or admin?{" "}
            <Link
              href="/login/admin"
              className="font-medium text-indigo-800 underline-offset-4 hover:underline"
            >
              Use admin portal
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
