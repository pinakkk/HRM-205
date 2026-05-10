"use client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

export function DepartmentChart() {
  const options = {
    indexAxis: 'y' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          display: false,
        },
        border: {
          display: false,
        }
      },
      y: {
        grid: {
          display: false,
        },
        border: {
          display: false,
        },
        ticks: {
          font: {
            size: 12,
            weight: 'bold' as const,
          }
        }
      },
    },
  };

  const data = {
    labels: ['Engineering', 'Marketing', 'Sales', 'Product', 'Design'],
    datasets: [
      {
        data: [12500, 8400, 15200, 9100, 11300],
        backgroundColor: [
          '#6366f1', // Indigo-500
          '#22d3ee', // Cyan-400
          '#bef264', // Lime-300
          '#fb923c', // Orange-400
          '#f472b6', // Pink-400
        ],
        borderRadius: 8,
        barThickness: 20,
      },
    ],
  };

  return <Bar options={options} data={data} />;
}
