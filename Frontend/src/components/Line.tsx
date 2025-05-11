"use client";

import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

const chartData = [
  { year: "2020", honors: 120, patents: 15, testScores: 85 },
  { year: "2021", honors: 150, patents: 20, testScores: 88 },
  { year: "2022", honors: 180, patents: 25, testScores: 90 },
  { year: "2023", honors: 200, patents: 30, testScores: 92 },
  { year: "2024", honors: 220, patents: 35, testScores: 95 },
];

const chartConfig = {
  honors: {
    label: "Honors and Achievements",
    color: "hsl(var(--chart-1))",
  },
  patents: {
    label: "Patents",
    color: "hsl(var(--chart-2))",
  },
  testScores: {
    label: "Test Scores",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig;

const CollegeAchievementsChart = () => {
  return (
    <Card className="w-[10cm] h-[8cm] p-4 flex flex-col shadow-lg rounded-xl bg-gradient-to-r from-blue-100 to-indigo-100">
      <CardHeader>
        <CardTitle>Year-wise College Achievements</CardTitle>
        <CardDescription>Overview from 2020 to 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              left: 12,
              right: 12,
              bottom: 10,
            }}
          >
            <CartesianGrid vertical={false} strokeDasharray="3 3" />
            <XAxis
              dataKey="year"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `\u2019${value.slice(2)}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => `${value}`}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="honors"
              name={chartConfig.honors.label}
              type="monotone"
              stroke="var(--color-honors)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              dataKey="patents"
              name={chartConfig.patents.label}
              type="monotone"
              stroke="var(--color-patents)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
            <Line
              dataKey="testScores"
              name={chartConfig.testScores.label}
              type="monotone"
              stroke="var(--color-testScores)"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <div className="grid gap-2">
          {/* <div className="flex items-center gap-2 font-medium leading-none">
              Positive growth in achievements <TrendingUp className="h-4 w-4" />
            </div> */}
          <div className="flex gap-2 items-center font-semibold">
            {/* <TrendingUp className="h-4 w-4 text-indigo-800" /> */}
           
          </div>
          <div className="text-gray-600 mt-1">
            Reflecting achievements over the past 5 years{" "}
            {/* <TrendingUp className="h-4 w-4" /> */}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

export default CollegeAchievementsChart;
