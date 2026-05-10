'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

export function PayrollHistoryChart() {
  const options = {
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
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value: any) => (value >= 1000 ? `${value / 1000}k` : value),
        },
      },
    },
  };

  const data = {
    labels: ['01 Mar', '02 Mar', '03 Mar', '04 Mar', '05 Mar', '06 Mar', '07 Mar', '08 Mar'],
    datasets: [
      {
        label: 'Total Payout',
        data: [5000, 6000, 6500, 4500, 4800, 6200, 4000, 1000],
        backgroundColor: '#4E9F9F', // Tealish
        borderRadius: 4,
      },
      {
        label: 'Delayed Payout',
        data: [1000, 500, 800, 1200, 700, 1500, 400, 200],
        backgroundColor: '#D1E8E8', // Light Teal
        borderRadius: 4,
      },
    ],
  };

  return <Bar options={options} data={data} />;
}

export function RequestsChart() {
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
    },
    elements: {
      line: {
        tension: 0.4,
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
      },
      y: {
        display: false,
      },
    },
  };

  const data = {
    labels: ['10 Mar', '11 Mar', '12 Mar', '13 Mar', '14 Mar'],
    datasets: [
      {
        fill: true,
        label: 'Requests',
        data: [35, 45, 40, 55, 42, 60, 58],
        borderColor: '#FF4D4D',
        backgroundColor: (context: any) => {
          const ctx = context.chart.ctx;
          const gradient = ctx.createLinearGradient(0, 0, 0, 300);
          gradient.addColorStop(0, 'rgba(255, 77, 77, 0.4)');
          gradient.addColorStop(1, 'rgba(255, 77, 77, 0)');
          return gradient;
        },
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        pointHoverBackgroundColor: '#FF4D4D',
        pointHoverBorderColor: '#fff',
        pointHoverBorderWidth: 2,
      },
    ],
  };

  return <Line options={options} data={data} />;
}
