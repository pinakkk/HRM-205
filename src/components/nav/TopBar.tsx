import Link from "next/link";
import type { Profile } from "@/types/domain";
import { ThemeToggle } from "@/components/theme/ThemeToggle";

export function TopBar({ profile }: { profile: Profile }) {
  return (
    <header className="sticky top-0 z-50 flex h-[53px] items-center justify-end border-b bg-white/80 px-6 backdrop-blur-md dark:bg-neutral-950/80">
      {/* TopBar content moved to Sidebar bottom */}
    </header>
  );
}
