import { requireUser } from "@/lib/auth";
import { Sidebar } from "@/components/nav/Sidebar";
import { TopBar } from "@/components/nav/TopBar";
import {
  LayoutDashboard,
  CalendarCheck,
  BarChart3,
  MessageSquare,
  Trophy,
  ShoppingBag,
  ShieldCheck,
  BadgeDollarSign,
  Coins
} from "lucide-react";

const items = [
  { href: "/employee", label: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" /> },
  { href: "/employee/attendance", label: "Attendance", icon: <CalendarCheck className="h-4 w-4" /> },
  { href: "/employee/kpis", label: "KPIs", icon: <BarChart3 className="h-4 w-4" /> },
  { href: "/employee/feedback", label: "Feedback", icon: <MessageSquare className="h-4 w-4" /> },
  { href: "/employee/leaderboard", label: "Leaderboard", icon: <Trophy className="h-4 w-4" /> },
  { href: "/employee/rewards", label: "Rewards & Points", icon: <BadgeDollarSign className="h-4 w-4" /> },
  { href: "/employee/bonus", label: "Bonus", icon: <Coins className="h-4 w-4" /> },
  { href: "/employee/store", label: "Redeem", icon: <ShoppingBag className="h-4 w-4" /> },
  { href: "/employee/consent", label: "Privacy", icon: <ShieldCheck className="h-4 w-4" /> },
];

import EmployeeLayoutClient from "./EmployeeLayoutClient";

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
