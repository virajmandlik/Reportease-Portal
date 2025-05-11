"use client";

import { useState } from "react";
import { TrendingUp, Filter } from "lucide-react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const chartData = [
  { year: "2018", placements: 300, companies: 60, highestCTC: 6.5 },
  { year: "2019", placements: 350, companies: 60, highestCTC: 8.0 },
  { year: "2020", placements: 250, companies: 55, highestCTC: 7.68 },
  { year: "2021", placements: 400, companies: 85, highestCTC: 18.75 },
  { year: "2022", placements: 389, companies: 90, highestCTC: 21.74 },
  { year: "2023", placements: 450, companies: 99, highestCTC: 23.0 },
];

const Bar2 = () => {
  const [selectedMetric, setSelectedMetric] = useState("placements");
  const [isFilterModalOpen, setFilterModalOpen] = useState(false);

  const handleFilterClick = () => setFilterModalOpen(!isFilterModalOpen);

  return (
    <Card
      className="w-[10cm] h-[8cm] p-4 flex flex-col shadow-lg rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100"
    >
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg font-bold text-indigo-800">Year-wise Data</CardTitle>
            <CardDescription className="text-sm text-indigo-600">2018 - 2023</CardDescription>
          </div>
          <button
            onClick={handleFilterClick}
            className="p-2 bg-indigo-200 rounded-full shadow-md hover:bg-indigo-300"
          >
            <Filter className="h-5 w-5 text-indigo-700" />
          </button>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <BarChart
          width={300}
          height={200}
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity={0.8} />
              <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#d1d5db" />
          <XAxis
            dataKey="year"
            tickLine={false}
            fontSize={12}
            stroke="#4b5563"
            tick={{ dy: 5 }}
          />
          <YAxis fontSize={12} stroke="#4b5563" />
          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              borderRadius: "10px",
              border: "1px solid #e5e7eb",
            }}
            cursor={{ fill: "rgba(79, 70, 229, 0.2)" }}
          />
          <Legend wrapperStyle={{ top: -10, left: 0 }} />
          <Bar dataKey={selectedMetric} fill="url(#barGradient)" radius={5} barSize={30} />
        </BarChart>
      </CardContent>
      <CardFooter className="text-sm text-indigo-700">
        <div className="flex gap-2 items-center font-semibold">
          <TrendingUp className="h-4 w-4 text-indigo-800" />
          <span>Dynamic Data Visualization</span>
        </div>
        <div className="text-gray-600 mt-1">
          Filter by metric: Placements, Companies, or CTC.
        </div>
      </CardFooter>
      {isFilterModalOpen && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex justify-center items-center">
          <div className="bg-white rounded-lg p-6 shadow-lg">
            <h3 className="text-lg font-semibold text-indigo-800 mb-4">Select Metric</h3>
            <div className="flex flex-col gap-3">
              {["placements", "companies", "highestCTC"].map((metric) => (
                <button
                  key={metric}
                  onClick={() => {
                    setSelectedMetric(metric);
                    setFilterModalOpen(false);
                  }}
                  className={`p-2 text-sm rounded-md ${
                    selectedMetric === metric
                      ? "bg-indigo-600 text-white"
                      : "bg-gray-100 hover:bg-indigo-100"
                  }`}
                >
                  {metric === "placements"
                    ? "No. of Students Placed"
                    : metric === "companies"
                    ? "No. of Companies Visited"
                    : "Highest CTC (in LPA)"}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
};

export default Bar2;
