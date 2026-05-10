"use client";

import { useState } from "react";
import {
  Users,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Search,
  MoreVertical,
  ArrowUpRight,
  Filter,
  Download
} from "lucide-react";
import { cn } from "@/lib/utils";

export function AdminAttendanceStats() {
  const stats = [
    { label: "Total Present", value: "142", trend: "+12", icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />, bgColor: "bg-emerald-50" },
    { label: "On Leave", value: "12", trend: "-2", icon: <Calendar className="h-5 w-5 text-blue-600" />, bgColor: "bg-blue-50" },
    { label: "Late Arrivals", value: "08", trend: "+3", icon: <AlertCircle className="h-5 w-5 text-amber-600" />, bgColor: "bg-amber-50" },
    { label: "Absent", value: "05", trend: "+1", icon: <XCircle className="h-5 w-5 text-rose-600" />, bgColor: "bg-rose-50" },
  ];

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat, i) => (
        <div key={i} className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl", stat.bgColor)}>
              {stat.icon}
            </div>
            <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              <ArrowUpRight className="h-3 w-3" /> {stat.trend}
            </div>
          </div>
          <p className="text-xs font-bold text-neutral-400 uppercase tracking-wider">{stat.label}</p>
          <div className="mt-1 text-2xl font-black text-neutral-900">{stat.value}</div>
        </div>
      ))}
    </div>
  );
}

export function AttendanceTable() {
  const [search, setSearch] = useState("");

  const attendanceData = [
    { id: 1, name: "Alex Rivera", dept: "Engineering", checkIn: "08:45 AM", status: "On Time", avatar: "A" },
    { id: 2, name: "Sarah Chen", dept: "Design", checkIn: "09:15 AM", status: "Late", avatar: "S" },
    { id: 3, name: "James Wilson", dept: "Marketing", checkIn: "08:30 AM", status: "On Time", avatar: "J" },
    { id: 4, name: "Maria Garcia", dept: "Product", checkIn: "09:45 AM", status: "Late", avatar: "M" },
    { id: 5, name: "David Kim", dept: "Sales", checkIn: "08:55 AM", status: "On Time", avatar: "D" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white shadow-sm overflow-hidden">
      <div className="flex flex-col gap-4 border-b border-neutral-50 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Attendance Records</h3>
          <p className="text-xs text-neutral-500">View and manage daily employee attendance</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search employee..."
              className="h-10 w-full rounded-xl border border-neutral-200 pl-10 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 sm:w-64"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="flex h-10 w-10 items-center justify-center rounded-xl border border-neutral-200 text-neutral-600 hover:bg-neutral-50">
            <Filter className="h-5 w-5" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-neutral-50 text-xs font-bold text-neutral-400 uppercase tracking-wider">
              <th className="px-6 py-4">Employee</th>
              <th className="px-6 py-4">Department</th>
              <th className="px-6 py-4">Check In</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {attendanceData.map((record) => (
              <tr key={record.id} className="group hover:bg-neutral-50 transition-colors">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 overflow-hidden rounded-full bg-neutral-100 flex items-center justify-center text-xs font-bold text-neutral-500 border border-neutral-200">
                      {record.avatar}
                    </div>
                    <span className="text-sm font-bold text-neutral-900">{record.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-sm text-neutral-600">{record.dept}</td>
                <td className="px-6 py-4 text-sm font-medium text-neutral-900">{record.checkIn}</td>
                <td className="px-6 py-4">
                  <span className={cn(
                    "inline-flex rounded-full px-2.5 py-0.5 text-[10px] font-bold",
                    record.status === "On Time" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"
                  )}>
                    {record.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <button className="text-neutral-400 hover:text-neutral-600">
                    <MoreVertical className="h-5 w-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function LeaveApprovalSection() {
  const leaves = [
    { id: 1, name: "Emily Blunt", type: "Sick Leave", dates: "12 May - 14 May", status: "Pending", avatar: "E" },
    { id: 2, name: "Robert Fox", type: "Annual Leave", dates: "20 May - 25 May", status: "Pending", avatar: "R" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Leave Approvals</h3>
          <p className="text-xs text-neutral-500">Manage pending leave requests</p>
        </div>
        <span className="rounded-full bg-red-50 px-2.5 py-0.5 text-xs font-bold text-red-600">
          {leaves.length} Pending
        </span>
      </div>
      <div className="space-y-4">
        {leaves.map((leave) => (
          <div key={leave.id} className="flex flex-col gap-4 rounded-2xl border border-neutral-50 p-4 hover:border-red-100 transition-colors sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-neutral-100 flex items-center justify-center text-sm font-bold text-neutral-500">
                {leave.avatar}
              </div>
              <div>
                <h4 className="text-sm font-bold text-neutral-900">{leave.name}</h4>
                <div className="flex items-center gap-2 text-xs text-neutral-500">
                  <span className="font-medium text-red-600">{leave.type}</span>
                  <span>•</span>
                  <span>{leave.dates}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex-1 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white hover:bg-emerald-700 sm:flex-none">
                Approve
              </button>
              <button className="flex-1 rounded-xl border border-neutral-200 px-4 py-2 text-xs font-bold text-neutral-600 hover:bg-neutral-50 sm:flex-none">
                Reject
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function LateArrivalTracking() {
  const lateComers = [
    { name: "Sarah Chen", delay: "15 mins", time: "09:15 AM", avatar: "S" },
    { name: "Maria Garcia", delay: "45 mins", time: "09:45 AM", avatar: "M" },
    { name: "Kevin Hart", delay: "10 mins", time: "09:10 AM", avatar: "K" },
  ];

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Late Arrival Tracking</h3>
        <p className="text-xs text-neutral-500">Recent late entries today</p>
      </div>
      <div className="space-y-4">
        {lateComers.map((person, i) => (
          <div key={i} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-amber-50 flex items-center justify-center text-[10px] font-bold text-amber-600">
                {person.avatar}
              </div>
              <div>
                <p className="text-sm font-bold text-neutral-900">{person.name}</p>
                <p className="text-[10px] text-neutral-500">{person.time}</p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-600">+{person.delay}</span>
          </div>
        ))}
      </div>
      <button className="mt-6 w-full rounded-xl border border-neutral-100 py-2.5 text-xs font-bold text-neutral-400 hover:bg-neutral-50 hover:text-neutral-600 transition-all">
        View All Late Arrivals
      </button>
    </div>
  );
}

export function AttendanceReportSummary() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Attendance Trends</h3>
          <p className="text-xs text-neutral-500">Monthly overview of employee presence</p>
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2 text-xs font-bold text-white hover:bg-neutral-800">
          <Download className="h-3.5 w-3.5" /> Export Report
        </button>
      </div>
      <div className="flex h-48 items-center justify-center rounded-2xl bg-neutral-50 border border-dashed border-neutral-200">
        <div className="text-center">
          <Calendar className="mx-auto h-8 w-8 text-neutral-300" />
          <p className="mt-2 text-xs font-medium text-neutral-400">Attendance chart visualization will appear here</p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-emerald-50/50 p-4 border border-emerald-100">
          <p className="text-[10px] font-bold text-emerald-600 uppercase">Avg Presence</p>
          <p className="text-xl font-black text-emerald-900">94.2%</p>
        </div>
        <div className="rounded-xl bg-rose-50/50 p-4 border border-rose-100">
          <p className="text-[10px] font-bold text-rose-600 uppercase">Avg Lateness</p>
          <p className="text-xl font-black text-rose-900">4.8%</p>
        </div>
      </div>
    </div>
  );
}
