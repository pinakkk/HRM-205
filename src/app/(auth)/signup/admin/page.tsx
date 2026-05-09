import Link from "next/link";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { AdminSignupForm } from "./form";

export default function AdminSignupPage() {
  return (
    <main className="flex min-h-screen flex-col bg-neutral-950 text-neutral-100">
      <header className="border-b border-neutral-800 bg-neutral-950">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-white text-sm font-bold text-neutral-900">
              F
            </div>
            <span className="text-lg font-semibold tracking-tight">FairReward</span>
          </Link>
          <Link
            href="/login/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-neutral-400 transition-colors hover:text-neutral-100"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to admin sign-in
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <div className="mx-auto mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Admin portal
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              Create an admin account
            </h1>
            <p className="mt-2 text-sm text-neutral-400">
              Your account will have access to reward cycles, redemption review,
              and user management.
            </p>
          </div>

          <AdminSignupForm />

          <div className="space-y-3 border-t border-neutral-800 pt-6 text-center text-sm">
            <p className="text-neutral-400">
              Already have an admin account?{" "}
              <Link
                href="/login/admin"
                className="font-medium text-indigo-300 underline-offset-4 hover:underline"
              >
                Sign in
              </Link>
            </p>
            <p className="text-neutral-400">
              Are you an employee?{" "}
              <Link
                href="/login/employee"
                className="font-medium text-indigo-300 underline-offset-4 hover:underline"
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
