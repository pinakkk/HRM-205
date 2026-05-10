'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export function KPIChart() {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom' as const,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value: any) => value + '%',
        },
      },
    },
  };

  const data = {
    labels: ['July', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
    datasets: [
      {
        label: 'Good',
        data: [75, 50, 86, 25, 75, 90],
        backgroundColor: '#bef264', // Lime-300
      },
      {
        label: 'Moderate',
        data: [50, 25, 60, 72, 64, 75],
        backgroundColor: '#22d3ee', // Cyan-400
      },
      {
        label: 'Critical',
        data: [25, 35, 50, 5, 35, 50],
        backgroundColor: '#f87171', // Red-400
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export function AttendanceChart() {
  const data = {
    labels: ['Present', 'On Leave', 'Absent'],
    datasets: [
      {
        data: [75, 20, 5],
        backgroundColor: [
          '#22d3ee', // Cyan-400
          '#fb923c', // Orange-400
          '#e2e8f0', // Slate-200
        ],
        borderWidth: 0,
        cutout: '70%',
      },
    ],
  };

  const options = {
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          boxWidth: 12,
          font: {
            size: 10
          }
        }
      },
    },
  };

  return (
    <div className="relative flex items-center justify-center">
      <Doughnut data={data} options={options} />
      <div className="absolute inset-0 flex flex-col items-center justify-center pb-8">
        <span className="text-sm font-medium text-neutral-400">Today</span>
        <span className="text-xl font-bold text-neutral-900 dark:text-white">75%</span>
        <span className="text-[10px] text-neutral-500">Moderate Concern</span>
      </div>
    </div>
  );
}
