"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  type ChartOptions,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const PALETTE = ["#6366f1", "#22d3ee", "#bef264", "#fb923c", "#f472b6", "#94a3b8"];

export function DepartmentChart({ data }: { data: { label: string; total: number }[] }) {
  if (data.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-xs text-neutral-400">
        No points awarded this month yet.
      </div>
    );
  }

  const options: ChartOptions<"bar"> = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { display: false }, border: { display: false } },
      y: {
        grid: { display: false },
        border: { display: false },
        ticks: { font: { size: 12, weight: "bold" } },
      },
    },
  };

  const chartData = {
    labels: data.map((d) => d.label),
    datasets: [
      {
        data: data.map((d) => d.total),
        backgroundColor: data.map((_, i) => PALETTE[i % PALETTE.length]),
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  return <Bar options={options} data={chartData} />;
}
