import Link from "next/link";
import type { Profile } from "@/types/domain";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header className="flex items-center justify-between border-b bg-white px-6 py-3 dark:bg-neutral-950">
      <div className="flex items-center gap-3">
        <Link href="/" className="font-semibold">
          FairReward AI
        </Link>
        <span className="text-xs text-neutral-500">
          {profile.role === "admin" ? "HR Admin" : "Employee"}
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-neutral-600">{profile.full_name}</span>
        <form action="/auth/sign-out" method="post">
          <button className="text-sm text-neutral-600 hover:text-neutral-900">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
