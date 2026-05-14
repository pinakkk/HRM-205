import { requireAdmin } from "@/lib/auth";
import {
  ReportsHeader,
  AttendanceAnalytics,
  PerformanceAnalytics,
  RewardStatistics,
  ExportControls,
  ReportsProvider,
  AutomatedInsights,
} from "./report-components";

export default async function AdminReportsPage() {
  await requireAdmin();

  return (
    <ReportsProvider>
      <div className="flex flex-col gap-8 pb-10">
        <ReportsHeader />

        <div className="grid gap-6 lg:grid-cols-2">
          <AttendanceAnalytics />
          <PerformanceAnalytics />

          <div className="lg:col-span-2 grid gap-6 md:grid-cols-3">
            <div className="md:col-span-1">
              <RewardStatistics />
            </div>
            <div className="md:col-span-2">
              <ExportControls />
              <AutomatedInsights />
            </div>
          </div>
        </div>
      </div>
    </ReportsProvider>
  );
}
