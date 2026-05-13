import Link from "next/link";
import { cn } from "@/lib/utils";
import { LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/theme/ThemeToggle";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import type { Profile } from "@/types/domain";

export type NavItem = { href: string; label: string; icon?: React.ReactNode };

export function Sidebar({
  items,
  current,
  profile,
  onClose,
  hideScrollbar,
}: {
  items: NavItem[];
  current?: string;
  profile?: Profile;
  onClose?: () => void;
  hideScrollbar?: boolean;
}) {
  return (
    <aside
      className={cn(
        "flex w-72 shrink-0 flex-col bg-[#111111] p-6 h-full text-white z-[60] overflow-y-auto",
        hideScrollbar && "no-scrollbar",
      )}
    >
      <div className="mb-10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl font-black tracking-tighter text-white">HRM</span>
          <div className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]"></div>
        </div>
      </div>
      <nav className="flex flex-1 flex-col gap-1.5">
        {items.map((item) => {
          const active = current === item.href || (item.href !== "/admin" && item.href !== "/employee" && current?.startsWith(item.href + "/"));
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onClose}
              className={cn(
                "flex items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors",
                active
                  ? "bg-[#FF4D4D] text-white shadow-lg"
                  : "text-neutral-400 hover:bg-neutral-800 hover:text-white",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-4 border-t border-neutral-800 pt-6">
        {profile && (
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 rounded-full bg-neutral-800 flex items-center justify-center text-xs font-bold border border-neutral-700">
                {profile.full_name.charAt(0)}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-semibold truncate w-24">{profile.full_name}</span>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider">{profile.role}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              {profile.role === "employee" && <NotificationBell />}
              <ThemeToggle />
            </div>
          </div>
        )}

        <form action="/auth/sign-out" method="post">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-sm font-medium text-neutral-400 hover:bg-red-500/10 hover:text-red-500 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </div>
    </aside>
  );
}
