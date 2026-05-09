import Link from "next/link";
import { cn } from "@/lib/utils";

export type NavItem = { href: string; label: string; icon?: React.ReactNode };

export function Sidebar({
  title,
  items,
  current,
}: {
  title: string;
  items: NavItem[];
  current?: string;
}) {
  return (
    <aside className="hidden w-56 shrink-0 border-r bg-neutral-50 p-4 md:block dark:bg-neutral-950">
      <div className="mb-6 px-2 text-sm font-semibold uppercase tracking-wide text-neutral-500">
        {title}
      </div>
      <nav className="flex flex-col gap-1">
        {items.map((item) => {
          const active = current === item.href || current?.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm",
                active
                  ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-200"
                  : "hover:bg-neutral-100 dark:hover:bg-neutral-900",
              )}
            >
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
