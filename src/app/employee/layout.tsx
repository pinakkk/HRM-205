import { requireUser } from "@/lib/auth";
import {
  LayoutDashboard,
  User,
  CalendarCheck,
  BarChart3,
  BadgeDollarSign,
  Award,
  Coins,
  MessageSquare,
  Trophy,
  Bell,
  Settings,
} from "lucide-react";
import EmployeeLayoutClient from "./EmployeeLayoutClient";

const items = [
  { href: "/employee", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/employee/profile", label: "My Profile", icon: <User className="h-4 w-4" /> },
  { href: "/employee/attendance", label: "Attendance", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/employee/performance", label: "Performance", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/employee/rewards", label: "Rewards & Points", icon: <BadgeDollarSign className="h-4 w-4" /> },
  { href: "/employee/badges", label: "Badges & Achievements", icon: <Award className="h-4 w-4" /> },
  { href: "/employee/bonus", label: "Bonuses", icon: <Coins className="h-4 w-4" /> },
  { href: "/employee/feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/employee/leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { href: "/employee/notifications", label: "Notifications", icon: <Bell className="h-4 w-4" /> },
  { href: "/employee/settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
];

export default async function EmployeeLayout({ children }: { children: React.ReactNode }) {
  const me = await requireUser();
  return (
    <div className="flex min-h-screen">
      <EmployeeLayoutClient items={items} profile={me.profile}>
        {children}
      </EmployeeLayoutClient>
    </div>
  );
}
