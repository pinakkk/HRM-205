import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminSignupForm } from "./form";

export default function AdminSignupPage() {
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
            href="/login/admin"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-full px-4 text-sm font-medium text-indigo-800 transition-colors hover:bg-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to admin sign-in</span>
          </Link>
        </div>
      </header>

      <div className="relative z-10 flex flex-1 items-center justify-center px-5 pb-10 pt-28 sm:px-6">
        <div className="w-full max-w-md rounded-2xl border border-white/60 bg-white/90 p-6 shadow-[0_1px_3px_rgba(67,56,202,0.05),0_20px_60px_-30px_rgba(67,56,202,0.22)] backdrop-blur-xl sm:p-9 animate-fade-up">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-indigo-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin portal
            </div>
            <h1 className="font-display text-3xl font-medium tracking-tight text-indigo-950">
              Create an admin account
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-indigo-700/80">
              Your account will have access to reward cycles, redemption review, and user management.
            </p>
          </div>

          <div className="mt-8">
            <AdminSignupForm />
          </div>

          <div className="mt-6 space-y-2 border-t border-indigo-100 pt-6 text-center text-sm">
            <p className="text-indigo-700">
              Already have an admin account?{" "}
              <Link
                href="/login/admin"
                className="font-medium text-indigo-800 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="text-indigo-700">
              Are you an employee?{" "}
              <Link
                href="/login/employee"
                className="font-medium text-indigo-800 underline-offset-4 hover:underline"
              >
                Use the employee portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
