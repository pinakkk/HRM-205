import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="text-4xl font-bold tracking-tight">FairReward AI</h1>
      <p className="text-lg text-neutral-600">
        Bias-aware, AI-assisted reward & compensation system for HR teams.
      </p>
      <div className="flex gap-3">
        <Link
          href="/login"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Log in
        </Link>
        <Link
          href="/signup"
          className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-neutral-50"
        >
          Sign up
        </Link>
      </div>
    </main>
  );
}
