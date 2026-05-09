import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";

const items = [
  { href: "/employee", label: "Dashboard" },
  { href: "/employee/attendance", label: "Attendance" },
  { href: "/employee/kpis", label: "KPIs" },
  { href: "/employee/feedback", label: "Feedback" },
  { href: "/employee/leaderboard", label: "Leaderboard" },
  { href: "/employee/store", label: "Redeem" },
];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div className="flex min-h-screen flex-col">
      <TopBar profile={me.profile} />
      <div className="flex flex-1">
        <Sidebar title="Employee" items={items} />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
