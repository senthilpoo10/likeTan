import React from "react";
import { Bar, Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface GameStatsChartProps {
  labels: string[];
  data: number[];
  title: string;
  type?: "bar" | "line" | "pie";
  width?: string | number;
  height?: string | number;
}

const GameStatsChart: React.FC<GameStatsChartProps> = ({
  labels,
  data,
  title,
  type = "bar",
  width = 400, // Default width
  height = 300, // Default height
}) => {
  const chartData = {
    labels,
    datasets: [
      {
        label: title,
        data,
        backgroundColor:
          type === "pie"
            ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
            : "rgba(75, 192, 192, 0.6)",
        borderColor:
          type === "pie"
            ? ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0", "#9966FF"]
            : "rgba(75, 192, 192, 1)",
        borderWidth: 1,
        fill: type === "line",
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Allow custom dimensions
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: title,
      },
    },
  };

  switch (type) {
    case "line":
      return (
        <div style={{ width, height }}>
          <Line data={chartData} options={options} />
        </div>
      );
    case "pie":
      return (
        <div style={{ width, height }}>
          <Pie data={chartData} options={options} />
        </div>
      );
    case "bar":
    default:
      return (
        <div style={{ width, height }}>
          <Bar data={chartData} options={options} />
        </div>
      );
  }
};

export default GameStatsChart;
