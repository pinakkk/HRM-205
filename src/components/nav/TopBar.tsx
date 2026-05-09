import Link from "next/link";
import type { Profile } from "@/types/domain";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

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
      <div className="flex items-center gap-3">
        <span className="text-sm text-neutral-600 dark:text-neutral-300">{profile.full_name}</span>
        <ThemeToggle />
        <form action="/auth/sign-out" method="post">
          <button className="text-sm text-neutral-600 hover:text-neutral-900 dark:text-neutral-300 dark:hover:text-white">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
