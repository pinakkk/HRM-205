"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Download,
  FileText,
  Table,
  Filter,
  Calendar,
  TrendingUp,
  Award,
  Zap,
  ChevronDown,
  Loader2,
} from "lucide-react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler,
  type ChartOptions,
} from "chart.js";
import { Line, Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type WeekdayKey = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type Rarity = "platinum" | "gold" | "silver" | "bronze";

type ReportsData = {
  rangeDays: number;
  attendanceByWeekday: { day: WeekdayKey; presenceRate: number }[];
  performanceByDepartment: { department: string; avgScore: number; people: number }[];
  badgeDistribution: { rarity: Rarity; count: number }[];
  totals: {
    totalBadges: number;
    totalEmployees: number;
    topDepartment: string | null;
    topDeptScore: number;
  };
  generatedAt: string;
};

type ReportsContextValue = {
  data: ReportsData | null;
  loading: boolean;
  error: string | null;
  rangeDays: number;
  setRangeDays: (n: number) => void;
  refresh: () => void;
};

const ReportsContext = createContext<ReportsContextValue | null>(null);

function useReports() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("ReportsContext missing");
  return ctx;
}

const RANGE_OPTIONS = [
  { label: "Last 7 days", value: 7 },
  { label: "Last 30 days", value: 30 },
  { label: "Last 90 days", value: 90 },
];

export function ReportsProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<ReportsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rangeDays, setRangeDays] = useState(30);
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async (range: number) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/admin/reports?range=${range}`, {
        cache: "no-store",
        signal: controller.signal,
      });
      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as { title?: string } | null;
        throw new Error(j?.title ?? `Failed (${res.status})`);
      }
      const json = (await res.json()) as ReportsData;
      setData(json);
    } catch (e) {
      if ((e as { name?: string })?.name === "AbortError") return;
      setError(e instanceof Error ? e.message : "Failed to load reports");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData(rangeDays);
    return () => abortRef.current?.abort();
  }, [fetchData, rangeDays]);

  const value = useMemo<ReportsContextValue>(
    () => ({
      data,
      loading,
      error,
      rangeDays,
      setRangeDays,
      refresh: () => fetchData(rangeDays),
    }),
    [data, loading, error, rangeDays, fetchData],
  );

  return <ReportsContext.Provider value={value}>{children}</ReportsContext.Provider>;
}

function CardShell({
  title,
  subtitle,
  icon,
  iconTone,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  iconTone: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
          <p className="text-xs text-neutral-500">{subtitle}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${iconTone}`}>
          {icon}
        </div>
      </div>
      {children}
    </div>
  );
}

export function AttendanceAnalytics() {
  const { data, loading, error } = useReports();
  const rows = data?.attendanceByWeekday ?? [];

  const chartData = {
    labels: rows.map((r) => r.day),
    datasets: [
      {
        label: "Presence Rate",
        data: rows.map((r) => r.presenceRate),
        borderColor: "#dc2626",
        backgroundColor: "rgba(220, 38, 38, 0.1)",
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options: ChartOptions<"line"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: "#171717",
        padding: 12,
        titleFont: { size: 14, weight: "bold" },
        bodyFont: { size: 12 },
        cornerRadius: 8,
      },
    },
    scales: {
      y: { min: 0, max: 100, grid: { display: false } },
      x: { grid: { display: false } },
    },
  };

  return (
    <CardShell
      title="Attendance Trends"
      subtitle="Average presence rate per weekday"
      icon={<Calendar className="h-5 w-5" />}
      iconTone="bg-red-50 text-red-600"
    >
      <div className="h-[300px] w-full">
        {loading || !data ? (
          <SkeletonChart kind="line" />
        ) : error ? (
          <ErrorState message={error} />
        ) : (
          <Line data={chartData} options={options} />
        )}
      </div>
    </CardShell>
  );
}

export function PerformanceAnalytics() {
  const { data, loading, error } = useReports();
  const rows = data?.performanceByDepartment ?? [];

  const palette = [
    "rgba(59, 130, 246, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(245, 158, 11, 0.8)",
    "rgba(16, 185, 129, 0.8)",
    "rgba(236, 72, 153, 0.8)",
    "rgba(107, 114, 128, 0.8)",
    "rgba(14, 165, 233, 0.8)",
    "rgba(244, 63, 94, 0.8)",
  ];

  const chartData = {
    labels: rows.map((r) => r.department),
    datasets: [
      {
        label: "Average KPI Score",
        data: rows.map((r) => r.avgScore),
        backgroundColor: rows.map((_, i) => palette[i % palette.length]),
        borderRadius: 8,
      },
    ],
  };

  const options: ChartOptions<"bar"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      y: { border: { dash: [5, 5] }, min: 0, max: 100 },
      x: { grid: { display: false } },
    },
  };

  return (
    <CardShell
      title="Department Performance"
      subtitle="Weighted average KPI score by department"
      icon={<TrendingUp className="h-5 w-5" />}
      iconTone="bg-blue-50 text-blue-600"
    >
      <div className="h-[300px] w-full">
        {loading || !data ? (
          <SkeletonChart kind="bar" />
        ) : error ? (
          <ErrorState message={error} />
        ) : rows.length === 0 ? (
          <EmptyState message="No KPI data in this range." />
        ) : (
          <Bar data={chartData} options={options} />
        )}
      </div>
    </CardShell>
  );
}

export function RewardStatistics() {
  const { data, loading, error } = useReports();
  const rows = data?.badgeDistribution ?? [];

  const chartData = {
    labels: rows.map((r) => r.rarity.charAt(0).toUpperCase() + r.rarity.slice(1)),
    datasets: [
      {
        data: rows.map((r) => r.count),
        backgroundColor: ["#6366f1", "#fbbf24", "#94a3b8", "#f97316"],
        borderWidth: 0,
      },
    ],
  };

  const options: ChartOptions<"pie"> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: { usePointStyle: true, padding: 20, font: { size: 12, weight: "bold" } },
      },
    },
  };

  const total = rows.reduce((s, r) => s + r.count, 0);

  return (
    <CardShell
      title="Badge Distribution"
      subtitle="Rarity breakdown of awarded badges"
      icon={<Award className="h-5 w-5" />}
      iconTone="bg-amber-50 text-amber-600"
    >
      <div className="h-[300px] w-full">
        {loading || !data ? (
          <SkeletonChart kind="pie" />
        ) : error ? (
          <ErrorState message={error} />
        ) : total === 0 ? (
          <EmptyState message="No badges awarded in this range." />
        ) : (
          <Pie data={chartData} options={options} />
        )}
      </div>
    </CardShell>
  );
}

function SkeletonChart({ kind }: { kind: "line" | "bar" | "pie" }) {
  if (kind === "pie") {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="relative h-40 w-40">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-neutral-100 via-neutral-200 to-neutral-100 bg-[length:200%_100%] animate-pulse" />
        </div>
      </div>
    );
  }
  return (
    <div className="flex h-full items-end gap-2">
      {Array.from({ length: kind === "line" ? 7 : 6 }).map((_, i) => (
        <div
          key={i}
          className="flex-1 rounded-md bg-gradient-to-t from-neutral-200 to-neutral-100 dark:from-neutral-700 dark:to-neutral-800 animate-pulse"
          style={{ height: `${30 + (i * 73) % 60}%` }}
        />
      ))}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-neutral-400">
      {message}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center text-sm text-rose-500">
      {message}
    </div>
  );
}

export function ExportControls() {
  const { data, loading, rangeDays } = useReports();
  const [busy, setBusy] = useState<null | "csv" | "pdf">(null);

  const downloadCsv = () => {
    if (!data) return;
    setBusy("csv");
    try {
      const sections: string[] = [];

      sections.push(`Report Range,${rangeDays} days`);
      sections.push(`Generated At,${new Date(data.generatedAt).toISOString()}`);
      sections.push(`Total Employees,${data.totals.totalEmployees}`);
      sections.push(`Total Badges Awarded,${data.totals.totalBadges}`);
      sections.push(`Top Department,${csvCell(data.totals.topDepartment ?? "—")}`);
      sections.push("");
      sections.push("Attendance by Weekday");
      sections.push("Day,Presence Rate (%)");
      for (const r of data.attendanceByWeekday) sections.push(`${r.day},${r.presenceRate}`);
      sections.push("");
      sections.push("Department Performance");
      sections.push("Department,Average KPI Score (%),People");
      for (const r of data.performanceByDepartment) {
        sections.push(`${csvCell(r.department)},${r.avgScore},${r.people}`);
      }
      sections.push("");
      sections.push("Badge Distribution");
      sections.push("Rarity,Count");
      for (const r of data.badgeDistribution) sections.push(`${r.rarity},${r.count}`);

      const blob = new Blob([sections.join("\n")], { type: "text/csv;charset=utf-8" });
      triggerDownload(blob, `fairreward-report-${todayStamp()}.csv`);
    } finally {
      setBusy(null);
    }
  };

  const downloadPdf = () => {
    if (!data) return;
    setBusy("pdf");
    try {
      const win = window.open("", "_blank", "noopener,noreferrer");
      if (!win) {
        alert("Please allow popups to export the PDF.");
        return;
      }
      win.document.write(buildPrintableHtml(data, rangeDays));
      win.document.close();
      win.focus();
      setTimeout(() => {
        win.print();
      }, 350);
    } finally {
      setBusy(null);
    }
  };

  const disabled = loading || !data;

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Export Reports</h3>
        <p className="text-xs text-neutral-500">
          Generate and download the current view in your preferred format
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={downloadPdf}
          disabled={disabled || busy !== null}
          className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 text-left transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">PDF Report</p>
              <p className="text-[10px] text-neutral-500">Summary & visuals (print dialog)</p>
            </div>
          </div>
          {busy === "pdf" ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <Download className="h-4 w-4 text-neutral-400" />
          )}
        </button>

        <button
          type="button"
          onClick={downloadCsv}
          disabled={disabled || busy !== null}
          className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 text-left transition-all hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-50 group"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Table className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-neutral-900">Excel / CSV</p>
              <p className="text-[10px] text-neutral-500">Raw aggregated data</p>
            </div>
          </div>
          {busy === "csv" ? (
            <Loader2 className="h-4 w-4 animate-spin text-neutral-400" />
          ) : (
            <Download className="h-4 w-4 text-neutral-400" />
          )}
        </button>
      </div>
    </div>
  );
}

export function ReportsHeader() {
  const { rangeDays, setRangeDays, refresh, loading } = useReports();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    }
    if (menuOpen) document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const currentLabel =
    RANGE_OPTIONS.find((o) => o.value === rangeDays)?.label ?? `Last ${rangeDays} days`;

  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500">
          Visual insights into organizational performance and trends
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm hover:bg-neutral-50"
          >
            <Filter className="h-4 w-4 text-neutral-400" />
            <span className="text-xs font-bold text-neutral-600">{currentLabel}</span>
            <ChevronDown className="h-4 w-4 text-neutral-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 z-30 mt-2 w-44 overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-lg">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => {
                    setRangeDays(opt.value);
                    setMenuOpen(false);
                  }}
                  className={`flex w-full items-center justify-between px-3 py-2 text-left text-xs font-semibold transition-colors hover:bg-neutral-50 ${
                    opt.value === rangeDays ? "text-red-600" : "text-neutral-700"
                  }`}
                >
                  {opt.label}
                  {opt.value === rangeDays && <span className="text-[10px]">●</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={refresh}
          disabled={loading}
          className="flex h-10 items-center justify-center gap-2 rounded-xl bg-neutral-900 px-4 text-sm font-bold text-white shadow-lg shadow-neutral-200 transition-all hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
          {loading ? "Refreshing…" : "Refresh Data"}
        </button>
      </div>
    </div>
  );
}

export function AutomatedInsights() {
  const { data, loading } = useReports();

  return (
    <div className="mt-6 rounded-2xl bg-neutral-900 p-8 text-white shadow-xl relative overflow-hidden">
      <div className="absolute right-0 top-0 -mr-8 -mt-8 h-48 w-48 rounded-full bg-red-500/10 blur-3xl"></div>
      <div className="relative z-10">
        <h4 className="text-xl font-black mb-2">Automated Insights</h4>
        <p className="text-neutral-400 text-sm mb-6 leading-relaxed">
          {loading || !data
            ? "Crunching the latest numbers…"
            : data.totals.topDepartment
              ? `${data.totals.topDepartment} leads with a ${data.totals.topDeptScore}% average KPI score across ${data.totals.totalEmployees} employees over the last ${data.rangeDays} days.`
              : `${data.totals.totalEmployees} employees tracked over the last ${data.rangeDays} days. Not enough KPI data yet to rank departments.`}
        </p>
        <div className="flex flex-wrap gap-4">
          <InsightTile label="Top Dept" value={loading || !data ? null : data.totals.topDepartment ?? "—"} />
          <InsightTile
            label="Total Badges"
            value={loading || !data ? null : data.totals.totalBadges.toString()}
          />
        </div>
      </div>
    </div>
  );
}

function InsightTile({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-xl bg-white/5 p-4 border border-white/10 flex-1">
      <p className="text-[10px] font-bold text-neutral-500 uppercase mb-1">{label}</p>
      {value === null ? (
        <div className="h-5 w-20 rounded bg-white/10 animate-pulse" />
      ) : (
        <p className="text-lg font-black text-white">{value}</p>
      )}
    </div>
  );
}

function csvCell(s: string): string {
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function todayStamp(): string {
  const d = new Date();
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

function buildPrintableHtml(data: ReportsData, rangeDays: number): string {
  const esc = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

  const attendanceRows = data.attendanceByWeekday
    .map((r) => `<tr><td>${r.day}</td><td>${r.presenceRate}%</td></tr>`)
    .join("");
  const perfRows = data.performanceByDepartment
    .map(
      (r) =>
        `<tr><td>${esc(r.department)}</td><td>${r.avgScore}%</td><td>${r.people}</td></tr>`,
    )
    .join("");
  const badgeRows = data.badgeDistribution
    .map((r) => `<tr><td>${r.rarity}</td><td>${r.count}</td></tr>`)
    .join("");

  return `<!doctype html><html><head><meta charset="utf-8"><title>FairReward Report</title>
<style>
  *{box-sizing:border-box}
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;padding:32px;color:#111}
  h1{margin:0 0 4px;font-size:24px}
  h2{margin:24px 0 8px;font-size:16px;border-bottom:1px solid #e5e5e5;padding-bottom:4px}
  .meta{color:#666;font-size:12px;margin-bottom:24px}
  .grid{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:24px}
  .stat{border:1px solid #e5e5e5;border-radius:8px;padding:12px}
  .stat .l{font-size:10px;text-transform:uppercase;color:#888;letter-spacing:.05em}
  .stat .v{font-size:18px;font-weight:700;margin-top:4px}
  table{width:100%;border-collapse:collapse;font-size:13px}
  th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #eee}
  th{background:#fafafa;font-size:11px;text-transform:uppercase;color:#666}
  @media print{body{padding:16px}}
</style></head><body>
<h1>FairReward Reports &amp; Analytics</h1>
<div class="meta">Range: last ${rangeDays} days · Generated ${new Date(data.generatedAt).toLocaleString()}</div>
<div class="grid">
  <div class="stat"><div class="l">Employees</div><div class="v">${data.totals.totalEmployees}</div></div>
  <div class="stat"><div class="l">Badges Awarded</div><div class="v">${data.totals.totalBadges}</div></div>
  <div class="stat"><div class="l">Top Dept</div><div class="v">${esc(data.totals.topDepartment ?? "—")}</div></div>
  <div class="stat"><div class="l">Top Score</div><div class="v">${data.totals.topDeptScore}%</div></div>
</div>
<h2>Attendance by Weekday</h2>
<table><thead><tr><th>Day</th><th>Presence Rate</th></tr></thead><tbody>${attendanceRows}</tbody></table>
<h2>Department Performance</h2>
<table><thead><tr><th>Department</th><th>Avg KPI</th><th>People</th></tr></thead><tbody>${perfRows || `<tr><td colspan="3" style="color:#888">No data</td></tr>`}</tbody></table>
<h2>Badge Distribution</h2>
<table><thead><tr><th>Rarity</th><th>Count</th></tr></thead><tbody>${badgeRows}</tbody></table>
</body></html>`;
}
