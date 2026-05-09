import Link from "next/link";
import { Suspense } from "react";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { EmployeeAuthPanel } from "./form";

export default function EmployeeLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-white text-neutral-900">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-neutral-900 text-sm font-bold text-white">
              F
            </div>
            <span className="text-lg font-semibold tracking-tight">FairReward</span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-600 transition-colors hover:text-neutral-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-neutral-700">
              <ShieldCheck className="h-3.5 w-3.5" />
              Employee portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Welcome to FairReward</h1>
            <p className="mt-2 text-sm text-neutral-600">
              Sign in with your work Google account to check in, view KPIs, and
              redeem rewards.
            </p>
          </div>

          <Suspense fallback={<div className="h-32" />}>
            <EmployeeAuthPanel />
          </Suspense>

          <div className="space-y-3 border-t border-neutral-200 pt-6 text-center text-sm">
            <p className="text-neutral-500">
              First time here? Continuing with Google will create your account
              automatically — no separate sign-up needed.
            </p>
            <p className="text-neutral-600">
              HR or admin?{" "}
              <Link
                href="/login/admin"
                className="font-medium text-neutral-900 underline-offset-4 hover:underline"
              >
                Use the admin portal
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
