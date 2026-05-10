import { requireAdmin } from "@/lib/auth";
import { 
  ReportsHeader,
  AttendanceAnalytics,
  PerformanceAnalytics,
  RewardStatistics,
  ExportControls
} from "./report-components";

export default async function AdminReportsPage() {
  await requireAdmin();

  return (
    <div className="flex flex-col gap-8 pb-10">
      <ReportsHeader />

      {/* Analytics Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Row 1 */}
        <AttendanceAnalytics />
        <PerformanceAnalytics />

        {/* Row 2 */}
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-3">
          <div className="md:col-span-1">
            <RewardStatistics />
          </div>
          <div className="md:col-span-2">
            <ExportControls />
            
            {/* Quick Insights Card */}
            <div className="mt-6 rounded-2xl bg-neutral-900 p-8 text-white shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"></div>
              <div className="relative z-10">
                <h4 className="text-xl font-black mb-2">Automated Insights</h4>
                <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
                  Based on recent data, the **Engineering** department has shown a 12% increase in productivity, while **Design** maintains the highest engagement rating.
                </p>
                <div className="flex flex-wrap gap-4">
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10 flex-1">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Top Dept</p>
                    <p className="text-lg font-black text-white">Design</p>
                  </div>
                  <div className="rounded-xl bg-white/5 p-4 border border-white/10 flex-1">
                    <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">Total Badges</p>
                    <p className="text-lg font-black text-white">174</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
