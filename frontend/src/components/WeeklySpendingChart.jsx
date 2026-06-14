import React, { useMemo } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { useGroupDetails } from "../hooks/useGroups";
import { formatCurrency } from "../utils/format";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
);

const getWeekStart = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday as start
  return new Date(d.setDate(diff));
};

const startOfWeek = (d) => {
  const dt = new Date(d);
  const day = dt.getDay();
  const diff = dt.getDate() - day + (day === 0 ? -6 : 1);
  dt.setHours(0, 0, 0, 0);
  dt.setDate(diff);
  return dt;
};

const WeeklySpendingChart = ({ groupId, weeks = 8 }) => {
  const { data: group } = useGroupDetails(groupId);
  const expenses = group?.expenses || [];

  const { labels, totals } = useMemo(() => {
    // compute week buckets ending this week, for `weeks` number of weeks
    const now = new Date();
    const weekStarts = [];
    const weekLabels = [];
    const millisPerWeek = 7 * 24 * 60 * 60 * 1000;
    const thisWeekStart = startOfWeek(now);
    for (let i = weeks - 1; i >= 0; i--) {
      const start = new Date(thisWeekStart.getTime() - i * millisPerWeek);
      weekStarts.push(start);
      const label = `${start.getMonth() + 1}/${start.getDate()}`;
      weekLabels.push(label);
    }

    const totalsArr = new Array(weeks).fill(0);

    expenses.forEach((exp) => {
      const created = new Date(
        exp.created_at || exp.createdAt || exp.createdAt,
      );
      if (isNaN(created)) return;
      for (let i = 0; i < weekStarts.length; i++) {
        const start = weekStarts[i];
        const end = new Date(start.getTime() + millisPerWeek);
        if (created >= start && created < end) {
          // keep amounts in smallest unit (paise/cents) to reuse formatCurrency
          totalsArr[i] += Number(exp.amount || 0);
          break;
        }
      }
    });

    return { labels: weekLabels, totals: totalsArr };
  }, [group, weeks]);

  const data = {
    labels,
    datasets: [
      {
        label: "Weekly Spend",
        data: totals,
        fill: true,
        backgroundColor: "rgba(99,102,241,0.08)",
        borderColor: "rgba(99,102,241,1)",
        tension: 0.25,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (context) => `${formatCurrency(context.parsed.y)}`,
        },
      },
    },
    scales: {
      y: {
        ticks: {
          callback: (val) => `${formatCurrency(val)}`,
        },
      },
    },
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-4">
      <h4 className="text-sm font-bold text-slate-900 mb-3">
        Weekly Spending (last {labels.length} weeks)
      </h4>
      {labels.length === 0 ? (
        <p className="text-xs text-slate-400">No data available</p>
      ) : (
        <Line data={data} options={options} />
      )}
    </div>
  );
};

export default WeeklySpendingChart;
