import { requireAdmin } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  Calendar as CalendarIcon,
  CheckSquare,
  Gift,
  Coins,
  Award,
  Star,
  Trophy,
  BarChart,
  Megaphone,
  Settings,
} from "lucide-react";
import AdminLayoutClient from "./AdminLayoutClient";

const items = [
  { href: "/admin", label: "Dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
  { href: "/admin/users", label: "Employee Management", icon: <Users className="h-5 w-5" /> },
  { href: "/admin/attendance", label: "Attendance Management", icon: <CalendarIcon className="h-5 w-5" /> },
  { href: "/admin/kpis", label: "Performance Management", icon: <CheckSquare className="h-5 w-5" /> },
  { href: "/admin/rewards", label: "Reward Management", icon: <Gift className="h-5 w-5" /> },
  { href: "/admin/allocator", label: "Bonus Management", icon: <Coins className="h-5 w-5" /> },
  { href: "/admin/badges", label: "Badge Management", icon: <Award className="h-5 w-5" /> },
  { href: "/admin/feedback", label: "Feedback & Reviews", icon: <Star className="h-5 w-5" /> },
  { href: "/admin/leaderboard", label: "Leaderboard Control", icon: <Trophy className="h-5 w-5" /> },
  { href: "/admin/reports", label: "Reports & Analytics", icon: <BarChart className="h-5 w-5" /> },
  { href: "/admin/announcements", label: "Announcements", icon: <Megaphone className="h-5 w-5" /> },
  { href: "/admin/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const me = await requireAdmin();
  return (
    <div className="flex min-h-screen">
      <AdminLayoutClient items={items} profile={me.profile}>
        {children}
      </AdminLayoutClient>
    </div>
  );
}
