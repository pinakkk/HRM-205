import { requireAdmin } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import {
  LayoutDashboard,
  Users,
  CheckSquare,
  Settings,
  Calendar as CalendarIcon,
  Star,
  Trophy,
  Award,
  BarChart
} from "lucide-react";
import AdminLayoutClient from "./AdminLayoutClient";

const items = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/users", label: "Employees", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/attendance", label: "Attendance", icon: <CalendarIcon className="h-5 w-5" /> },
  { href: "/admin/kpis", label: "Approvals", icon: <CheckSquare className="h-5 w-5" /> },
  { href: "/admin/feedback", label: "Feedback", icon: <Star className="h-5 w-5" /> },
  { href: "/admin/leaderboard", label: "Leaderboard", icon: <Trophy className="h-5 w-5" /> },
  { href: "/admin/badges", label: "Badges", icon: <Award className="h-5 w-5" /> },
  { href: "/admin/reports", label: "Reports", icon: <BarChart className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <AdminLayoutClient items={items} title="HR Admin" profile={me.profile}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
