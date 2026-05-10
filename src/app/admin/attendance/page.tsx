import { requireAdmin } from "@/lib/auth";
import { 
  AdminAttendanceStats, 
  AttendanceTable, 
  LeaveApprovalSection, 
  LateArrivalTracking,
  AttendanceReportSummary
} from "./attendance-admin-components";
import { Bell, Search, Calendar as CalendarIcon, Filter } from "lucide-react";

export default async function AdminAttendancePage() {
  const me = await requireAdmin();
  const today = new Date().toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="flex flex-col gap-8 pb-10">
      {/* Header Section */}
      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Attendance Management</h1>
          <p className="text-sm text-neutral-500">Monitor employee presence, manage leaves, and track late arrivals ({today})</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <Bell className="h-5 w-5" />
          </button>
          <button className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl border border-neutral-200 bg-white text-sm font-bold text-neutral-600 hover:bg-neutral-50 shadow-sm">
            <CalendarIcon className="h-4 w-4" />
            <span>Today</span>
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <AdminAttendanceStats />

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Attendance Table */}
        <div className="lg:col-span-2">
          <AttendanceTable />
        </div>

        {/* Sidebar Sections */}
        <div className="flex flex-col gap-6">
          <LeaveApprovalSection />
          <LateArrivalTracking />
        </div>
      </div>

      {/* Reports Section */}
      <div className="grid gap-6 lg:grid-cols-1">
        <AttendanceReportSummary />
      </div>
    </div>
  );
}
