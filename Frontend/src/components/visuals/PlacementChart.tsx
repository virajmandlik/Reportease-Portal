// PlacementChart.tsx
import React, { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

// Register the necessary components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface PlacementData {
  type: string;
  opportunities_count: number;
}

interface PlacementChartProps {
  institute_id: number;
}

const PlacementChart: React.FC<PlacementChartProps> = ({ institute_id }) => {
  const [data, setData] = useState<PlacementData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPlacementData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/get-placement-data/${institute_id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching placement data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPlacementData();
  }, [institute_id]);

  const chartData = {
    labels: data.map((item) => item.type),
    datasets: [
      {
        label: "Opportunities Count",
        data: data.map((item) => item.opportunities_count),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: "Placement Opportunities",
      },
    },
  };

  return (
    <div>
      {loading ? <p>Loading...</p> : <Bar data={chartData} options={options} />}
    </div>
  );
};

export default PlacementChart;
