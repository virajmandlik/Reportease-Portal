"use client";

import * as React from "react";
import { TrendingUp } from "lucide-react";
import { Label, Pie, PieChart } from "recharts";
import axios from "axios";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface DepartmentData {
  dept_name: string;
  student_count: number;
}

interface PieInteractiveProps {
  institute_id: number | undefined; // Add institute_id prop
}

export function PieInteractive({ institute_id }: PieInteractiveProps) {
  const [chartData, setChartData] = React.useState<DepartmentData[]>([]);
  const totalStudents = React.useMemo(() => {
    return chartData.reduce((acc, curr) => acc + curr.student_count, 0);
  }, [chartData]);

  React.useEffect(() => {
    const fetchDepartmentWiseStudentCount = async () => {
      try {
        console.log(
          "Fetching department-wise student count for institute_id:",
          institute_id
        );
        const response = await axios.get(
          `http://localhost:3000/api/get-deptwise-student-count/${institute_id}`
        );
        if (response.data && Array.isArray(response.data)) {
          console.log("Response data:", response.data);
          setChartData(response.data);
        } else {
          console.error("Unexpected data format:", response.data);
        }
      } catch (error) {
        console.error("Error fetching department-wise student counts:", error);
      }
    };

    if (institute_id) {
      fetchDepartmentWiseStudentCount();
    }
  }, [institute_id]);

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Department-wise Student Count</CardTitle>
        <CardDescription>Total Students: {totalStudents}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{}} // Provide a default empty object
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <Pie
              data={chartData}
              dataKey="student_count"
              nameKey="dept_name"
              cx="50%"
              cy="50%"
              outerRadius={80}
              fill="#8884d8"
              label
            >
              {chartData.map((entry, index) => (
                <Label key={`label-${index}`} value={entry.dept_name} />
              ))}
            </Pie>
            <ChartTooltip>
              <ChartTooltipContent />
            </ChartTooltip>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter>
        <TrendingUp className="h-4 w-4" />
      </CardFooter>
    </Card>
  );
}
