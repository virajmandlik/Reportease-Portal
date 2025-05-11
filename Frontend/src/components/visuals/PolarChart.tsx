// PolarAreaChart.tsx
import React, { useEffect, useState } from "react";
import { PolarArea } from "react-chartjs-2";
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  RadialLinearScale,
} from "chart.js";

// Register the necessary components
ChartJS.register(ArcElement, Tooltip, Legend, RadialLinearScale);

interface ClubData {
  club_type: string;
  club_count: number;
}

interface PolarAreaChartProps {
  institute_id: number;
}

const PolarAreaChart: React.FC<PolarAreaChartProps> = ({ institute_id }) => {
  const [data, setData] = useState<ClubData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchClubData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/get-typewise-club-count/${institute_id}`
        );
        const result = await response.json();
        setData(result);
      } catch (error) {
        console.error("Error fetching club data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClubData();
  }, [institute_id]);

  const chartData = {
    labels: data.map((item) => item.club_type),
    datasets: [
      {
        label: "Club Count",
        data: data.map((item) => item.club_count),
        backgroundColor: [
          "rgba(255, 99, 132, 0.6)",
          "rgba(54, 162, 235, 0.6)",
          "rgba(255, 206, 86, 0.6)",
          "rgba(75, 192, 192, 0.6)",
          "rgba(153, 102, 255, 0.6)",
          "rgba(255, 159, 64, 0.6)",
        ],
      },
    ],
  };

  return (
    <div>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <PolarArea data={chartData} options={{ responsive: true }} />
      )}
    </div>
  );
};

export default PolarAreaChart;
