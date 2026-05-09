import Link from "next/link";
import { SignupForm } from "./form";

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center gap-6 px-6">
      <div>
        <h1 className="text-2xl font-bold">Create your account</h1>
        <p className="text-sm text-neutral-500">Join your team on FairReward.</p>
      </div>
      <SignupForm />
      <p className="text-sm text-neutral-500">
        Already have an account?{" "}
        <Link href="/login" className="text-indigo-600 hover:underline">
          Sign in
        </Link>
      </p>
    </main>
  );
}
