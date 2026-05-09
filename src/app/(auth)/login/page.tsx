import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, User } from "lucide-react";

export default function LoginChooserPage() {
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
        <div className="w-full max-w-3xl space-y-10">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight">
              Sign in to FairReward
            </h1>
            <p className="mt-3 text-base text-neutral-600">
              Choose the portal that matches your role.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <Link
              href="/login/employee"
              className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-200 bg-white p-7 shadow-sm transition-all hover:-translate-y-0.5 hover:border-neutral-900 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-100 text-neutral-900 transition-colors group-hover:bg-neutral-900 group-hover:text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                  Employee
                </p>
                <h2 className="mt-1 text-xl font-semibold">Continue as employee</h2>
                <p className="mt-2 text-sm text-neutral-600">
                  Check in, view your KPIs, redeem rewards, and submit feedback.
                  Sign in with Google.
                </p>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-neutral-900">
                Go to employee sign-in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>

            <Link
              href="/login/admin"
              className="group relative flex flex-col gap-4 rounded-2xl border border-neutral-900 bg-neutral-950 p-7 text-neutral-100 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-neutral-800 text-neutral-100 transition-colors group-hover:bg-white group-hover:text-neutral-900">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-neutral-400">
                  Admin / HR
                </p>
                <h2 className="mt-1 text-xl font-semibold">Continue as admin</h2>
                <p className="mt-2 text-sm text-neutral-400">
                  Run reward cycles, review redemptions, and manage users. Sign
                  in with Google or admin credentials.
                </p>
              </div>
              <div className="mt-auto inline-flex items-center gap-1 text-sm font-semibold">
                Go to admin sign-in
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </div>
            </Link>
          </div>

          <p className="text-center text-sm text-neutral-500">
            New employees sign up automatically when continuing with Google. New
            admins can{" "}
            <Link
              href="/signup/admin"
              className="font-medium text-neutral-900 underline-offset-4 hover:underline"
            >
              create an admin account
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  );
}
