"use client"

import { LabelList, Pie, PieChart } from "recharts"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

const chartData = [
  { asset: "Projects", budget: 400000, fill: "#FF6384" },
  { asset: "Events", budget: 1473000, fill: "#36A2EB" },
  { asset: "Salaries", budget: 8500000, fill: "#FFCE56" },
  { asset: "Infrastructure", budget: 3700000, fill: "#4BC0C0" },
  { asset: "Clubs", budget: 500000, fill: "#9966FF" },
  { asset: "Others", budget: 350000, fill: "#FF9F40" },
]

const chartConfig = {
  budget: {
    label: "Budget",
  },
  Projects: {
    label: "Projects",
    color: "#FF6384",
  },
  Events: {
    label: "Events",
    color: "#36A2EB",
  },
  Salaries: {
    label: "Salaries",
    color: "#FFCE56",
  },
  Infrastructure: {
    label: "Infrastructure",
    color: "#4BC0C0",
  },
  Clubs: {
    label: "Clubs",
    color: "#9966FF",
  },
  Others: {
    label: "Others",
    color: "#FF9F40",
  },
} satisfies ChartConfig

export function Financial() {
  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Financial Insights</CardTitle>
        <CardDescription>2024</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px] [&_.recharts-text]:fill-background"
        >
          <PieChart>
            <ChartTooltip
              content={<ChartTooltipContent nameKey="budget" hideLabel />}
            />
            <Pie data={chartData} dataKey="budget" nameKey="asset">
              <LabelList
                dataKey="asset"
                className="fill-background"
                stroke="none"
                fontSize={12}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col gap-2 text-sm"></CardFooter>
    </Card>
  )
}
