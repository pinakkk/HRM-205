"use client";

import { useState, useEffect } from "react";
import { 
  Clock, 
  MapPin, 
  Calendar as CalendarIcon, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  LogOut,
  LogIn
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AttendanceSummary() {
  const stats = [
    { label: "Days Present", value: "18", icon: <CheckCircle2 className="text-green-500" />, sub: "This month" },
    { label: "Days Absent", value: "02", icon: <XCircle className="text-red-500" />, sub: "This month" },
    { label: "Late Arrivals", value: "01", icon: <AlertCircle className="text-amber-500" />, sub: "This month" },
    { label: "Leave Balance", value: "12", icon: <CalendarIcon className="text-indigo-500" />, sub: "Annual" },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="flex flex-col gap-1 rounded-xl border border-neutral-200 bg-white p-5 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <div className="h-8 w-8 rounded-lg bg-neutral-50 p-1.5 dark:bg-neutral-800">
              {stat.icon}
            </div>
            <span className="text-2xl font-bold text-neutral-900 dark:text-white">{stat.value}</span>
          </div>
          <div className="mt-2 text-sm font-medium text-neutral-500">{stat.label}</div>
          <div className="text-[10px] text-neutral-400">{stat.sub}</div>
        </div>
      ))}
    </div>
  );
}

export function CheckInCard() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [isCheckedIn, setIsCheckedIn] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAction = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/attendance/check-in", { method: "POST" });
      if (res.ok) {
        setIsCheckedIn(!isCheckedIn);
      }
    } catch (error) {
      console.error("Action failed", error);
    }
    setLoading(false);
  };

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
      <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400">
            <Clock className="h-8 w-8" />
          </div>
          <div>
            <div className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-white">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
            <div className="text-sm text-neutral-500">
              {currentTime.toLocaleDateString([], { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button 
            onClick={handleAction}
            disabled={loading || isCheckedIn}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all",
              isCheckedIn 
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed dark:bg-neutral-800" 
                : "bg-indigo-600 text-white hover:bg-indigo-700 shadow-md shadow-indigo-200 dark:shadow-none"
            )}
          >
            {isCheckedIn ? <CheckCircle2 className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {loading ? "Processing..." : isCheckedIn ? "Checked In" : "Clock In"}
          </button>
          
          <button 
            onClick={handleAction}
            disabled={loading || !isCheckedIn}
            className={cn(
              "flex items-center justify-center gap-2 rounded-lg px-6 py-2.5 text-sm font-bold transition-all border",
              !isCheckedIn 
                ? "border-neutral-200 text-neutral-400 cursor-not-allowed dark:border-neutral-800" 
                : "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/30 dark:hover:bg-red-900/10"
            )}
          >
            <LogOut className="h-4 w-4" />
            {loading ? "Processing..." : "Clock Out"}
          </button>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-6 border-t border-neutral-100 pt-6 dark:border-neutral-800">
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <MapPin className="h-3 w-3" />
          <span>Work from Office</span>
        </div>
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <AlertCircle className="h-3 w-3" />
          <span>Shift: 09:00 AM - 06:00 PM</span>
        </div>
      </div>
    </div>
  );
}

export function AttendanceCalendar() {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const date = new Date();
  const currentMonth = date.toLocaleString('default', { month: 'long' });
  const currentYear = date.getFullYear();

  // Mock calendar data
  const calendarDays = Array.from({ length: 31 }, (_, i) => ({
    day: i + 1,
    status: Math.random() > 0.2 ? 'present' : (Math.random() > 0.5 ? 'absent' : 'leave'),
    isToday: i + 1 === date.getDate()
  }));

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Attendance Calendar</h3>
        <div className="flex items-center gap-4">
          <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">{currentMonth} {currentYear}</span>
          <div className="flex gap-1">
            <button className="rounded-md border border-neutral-200 p-1 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button className="rounded-md border border-neutral-200 p-1 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg bg-neutral-200 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800">
        {days.map(d => (
          <div key={d} className="bg-neutral-50 py-2 text-center text-[10px] font-bold uppercase text-neutral-500 dark:bg-neutral-900/50">
            {d}
          </div>
        ))}
        {calendarDays.map((d, i) => (
          <div key={i} className="relative h-20 bg-white p-2 dark:bg-neutral-900">
            <span className={cn(
              "text-xs font-bold",
              d.isToday ? "flex h-5 w-5 items-center justify-center rounded-full bg-indigo-600 text-white" : "text-neutral-500"
            )}>
              {d.day}
            </span>
            <div className="mt-2">
              <div className={cn(
                "h-1.5 w-full rounded-full",
                d.status === 'present' ? "bg-green-500" : (d.status === 'absent' ? "bg-red-500" : "bg-indigo-500")
              )} />
              <div className="mt-1 text-[8px] font-medium text-neutral-400 capitalize">
                {d.status}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap gap-4 text-[10px] font-medium text-neutral-500">
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-green-500" /> Present
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-red-500" /> Absent
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-indigo-500" /> On Leave
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-2 rounded-full bg-amber-500" /> Holiday
        </div>
      </div>
    </div>
  );
}

export function LeaveRecords() {
  const leaves = [
    { type: "Sick Leave", date: "12 May 2025", duration: "1 Day", status: "Approved" },
    { type: "Casual Leave", date: "20 May 2025", duration: "2 Days", status: "Pending" },
    { type: "Annual Leave", date: "01 Jun 2025", duration: "5 Days", status: "Rejected" },
  ];

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm dark:bg-neutral-900 dark:border-neutral-800">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-lg font-bold text-neutral-900 dark:text-white">Leave Records</h3>
        <button className="text-sm font-bold text-indigo-600 hover:text-indigo-700">Request Leave</button>
      </div>

      <div className="space-y-4">
        {leaves.map((leave, i) => (
          <div key={i} className="flex items-center justify-between rounded-lg border border-neutral-100 p-4 hover:bg-neutral-50 dark:border-neutral-800 dark:hover:bg-neutral-800/50 transition-colors">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                <CalendarIcon className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900 dark:text-white">{leave.type}</h4>
                <p className="text-xs text-neutral-500">{leave.date} • {leave.duration}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold border",
                leave.status === 'Approved' ? "bg-green-50 text-green-600 border-green-100 dark:bg-green-900/20 dark:border-green-900/30" : 
                (leave.status === 'Pending' ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:border-amber-900/30" : 
                "bg-red-50 text-red-600 border-red-100 dark:bg-red-900/20 dark:border-red-900/30")
              )}>
                {leave.status}
              </span>
              <button className="text-neutral-400 hover:text-neutral-600">
                <MoreVertical className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
