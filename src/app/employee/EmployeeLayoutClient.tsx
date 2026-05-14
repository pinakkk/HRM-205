'use client';

import { usePathname } from "next/navigation";
import { Sidebar, NavItem } from "@/components/nav/Sidebar";
import type { Profile } from "@/types/domain";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChatBot } from "@/components/ui/ChatBot";

export default function EmployeeLayoutClient({
  items,
  profile,
  children
}: {
  items: NavItem[];
  profile: Profile;
  children: React.ReactNode
}) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  return (
    <div className="flex flex-col md:flex-row flex-1 overflow-hidden bg-neutral-50 dark:bg-neutral-950 h-[100dvh]">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between bg-[#111111] p-4 text-white z-40 shrink-0">
        <div className="flex items-center gap-2">
          <span className="text-lg font-bold tracking-tight">FairReward</span>
          <div className="h-1.5 w-1.5 rounded-full bg-[#FF4D4D]"></div>
        </div>
        <button onClick={() => setIsMobileOpen(!isMobileOpen)} className="p-1">
          {isMobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Sidebar overlay for mobile */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar wrapper */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 transform transition-transform duration-300 md:relative md:translate-x-0 h-[100dvh]",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <Sidebar items={items} current={pathname} profile={profile} onClose={() => setIsMobileOpen(false)} hideScrollbar />
      </div>

      <div className="flex-1 flex overflow-hidden">
        <main className={cn(
          "flex-1 p-4 md:p-8 overflow-auto relative transition-all duration-500 ease-in-out",
          isChatOpen && "md:mr-0" // The flex-1 in a flex container with another element will compress automatically
        )}>
          {children}
        </main>
        <ChatBot isOpen={isChatOpen} setIsOpen={setIsChatOpen} />
      </div>
    </div>
  );
}
