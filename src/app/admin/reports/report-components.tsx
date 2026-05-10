"use client";

import { useState } from "react";
import { 
  BarChart, 
  LineChart, 
  PieChart, 
  Download, 
  FileText, 
  Table, 
  Filter,
  Calendar,
  TrendingUp,
  Award,
  Users,
  Zap,
  ChevronDown
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
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import { cn } from "@/lib/utils";

// Register ChartJS components
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
  Filler
);

export function AttendanceAnalytics() {
  const data = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Presence Rate',
        data: [92, 95, 88, 94, 91, 45, 38],
        borderColor: '#dc2626',
        backgroundColor: 'rgba(220, 38, 38, 0.1)',
        fill: true,
        tension: 0.4,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: '#171717',
        padding: 12,
        titleFont: { size: 14, weight: 'bold' as const },
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
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Attendance Trends</h3>
          <p className="text-xs text-neutral-500">Weekly average presence percentage</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-50 text-red-600">
          <Calendar className="h-5 w-5" />
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Line data={data} options={options} />
      </div>
    </div>
  );
}

export function PerformanceAnalytics() {
  const data = {
    labels: ['Engineering', 'Design', 'Marketing', 'Sales', 'HR', 'Ops'],
    datasets: [
      {
        label: 'Average KPI Score',
        data: [88, 92, 78, 85, 90, 82],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(107, 114, 128, 0.8)',
        ],
        borderRadius: 8,
      },
    ],
  };

  const options: ChartOptions<'bar'> = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
    },
    scales: {
      y: { border: { dash: [5, 5] } },
      x: { grid: { display: false } },
    },
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Department Performance</h3>
          <p className="text-xs text-neutral-500">KPI metrics compared across departments</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
          <TrendingUp className="h-5 w-5" />
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Bar data={data} options={options} />
      </div>
    </div>
  );
}

export function RewardStatistics() {
  const data = {
    labels: ['Platinum', 'Gold', 'Silver', 'Bronze'],
    datasets: [
      {
        data: [12, 28, 45, 89],
        backgroundColor: [
          '#6366f1',
          '#fbbf24',
          '#94a3b8',
          '#f97316',
        ],
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          usePointStyle: true,
          padding: 20,
          font: { size: 12, weight: 'bold' as const },
        },
      },
    },
  };

  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-neutral-900">Badge Distribution</h3>
          <p className="text-xs text-neutral-500">Rarity breakdown of awarded badges</p>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
          <Award className="h-5 w-5" />
        </div>
      </div>
      <div className="h-[300px] w-full">
        <Pie data={data} options={options} />
      </div>
    </div>
  );
}

export function ExportControls() {
  return (
    <div className="rounded-2xl border border-neutral-100 bg-white p-6 shadow-sm">
      <div className="mb-6">
        <h3 className="text-lg font-bold text-neutral-900">Export Reports</h3>
        <p className="text-xs text-neutral-500">Generate and download data in various formats</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <button className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-600 group-hover:scale-110 transition-transform">
              <FileText className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-900">PDF Report</p>
              <p className="text-[10px] text-neutral-500">Summary & Visuals</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-neutral-400" />
        </button>

        <button className="flex items-center justify-between rounded-xl border border-neutral-200 p-4 hover:bg-neutral-50 transition-all group">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <Table className="h-5 w-5" />
            </div>
            <div className="text-left">
              <p className="text-sm font-bold text-neutral-900">Excel Data</p>
              <p className="text-[10px] text-neutral-500">Raw CSV Records</p>
            </div>
          </div>
          <Download className="h-4 w-4 text-neutral-400" />
        </button>
      </div>
    </div>
  );
}

export function ReportsHeader() {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-bold text-neutral-900">Reports & Analytics</h1>
        <p className="text-sm text-neutral-500">Visual insights into organizational performance and trends</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 rounded-xl border border-neutral-200 bg-white px-3 py-2 shadow-sm">
          <Filter className="h-4 w-4 text-neutral-400" />
          <span className="text-xs font-bold text-neutral-600">Last 30 Days</span>
          <ChevronDown className="h-4 w-4 text-neutral-400" />
        </div>
        <button className="flex h-10 px-4 items-center justify-center gap-2 rounded-xl bg-neutral-900 text-sm font-bold text-white hover:bg-neutral-800 shadow-lg shadow-neutral-200 transition-all">
          <Zap className="h-4 w-4" />
          Refresh Data
        </button>
      </div>
    </div>
  );
}
