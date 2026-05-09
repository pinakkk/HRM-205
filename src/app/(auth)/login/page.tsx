import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "./form";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome back</h1>
        <p className="text-sm text-neutral-500">Sign in to your FairReward account.</p>
      </div>
      <Suspense fallback={<div className="h-32" />}>
        <LoginForm />
      </Suspense>
      <p className="text-sm text-neutral-500">
        New here?{" "}
        <Link href="/signup" className="text-indigo-600 hover:underline">
          Create an account
        </Link>
      </p>
    </main>
  );
}
