import { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface InfrastructureCardProps {
  infra_id: number;
  department: string;
  description: string;
  budget: number;
  start_date: Date;
  end_date: Date;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  width?: string;
  height?: string;
}

export function InfraCard({
  infra_id,
  department,
  description,
  budget,
  start_date,
  end_date,
  onUpdate,
  onDelete,
  dept,
  width = "300px",
  height = "200px",
}: InfrastructureCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedDepartment, setUpdatedDepartment] = useState(department);
  const [updatedDescription, setUpdatedDescription] = useState(description);
  const [updatedBudget, setUpdatedBudget] = useState(budget.toString());
  const [updatedStartDate, setUpdatedStartDate] = useState(new Date(start_date).toISOString().split("T")[0]);
  const [updatedEndDate, setUpdatedEndDate] = useState(new Date(end_date).toISOString().split("T")[0]);
  const [departments, setDepartments] = useState<string[]>(dept);

  const handleUpdate = () => {
    onUpdate({
      infra_id,
      department: updatedDepartment,
      description: updatedDescription,
      budget: parseFloat(updatedBudget),
      start_date: new Date(updatedStartDate),
      end_date: new Date(updatedEndDate),
    });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete({ infra_id });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Card
            style={{ width, height }}
            className="relative rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer"
          >
            <CardHeader>
            <CardTitle className="text-center tracking-tight text-lg font-medium">
                {description}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex flex-col items-start p-2">
              <div className="text-sm">
                <p><b>Budget:</b> ${budget}</p>
                <p><b>Start Date:</b> {new Date(start_date).toISOString().split("T")[0]}</p>
                <p><b>End Date:</b> {new Date(end_date).toISOString().split("T")[0]}</p>
              </div>
            </CardFooter>
            <div className="absolute top-2 right-2">
              <Pencil className="hover:text-red-500" onClick={() => setIsDialogOpen(true)} />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-4">Edit Infrastructure</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Department</label>
              {/* <Input
                value={updatedDepartment}
                onChange={(e) => setUpdatedDepartment(e.target.value)}
                placeholder="Department"
              /> */}
              <Select name="dept" value={updatedDepartment} onValueChange={(value) => setUpdatedDepartment((value))}>
                      <SelectTrigger className="w-[475px]">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Department</SelectLabel>
                          {departments.map((department) => (
                            <SelectItem key={department.dept_name} value={department.dept_name}>
                              {department.dept_name}
                            </SelectItem>
                          ))}xa
                        </SelectGroup>
                      </SelectContent>
                    </Select>
            </div>
            <div>
              <label className="block mb-1">Description</label>
              <Textarea
                value={updatedDescription}
                onChange={(e) => setUpdatedDescription(e.target.value)}
                placeholder="Description"
              />
            </div>
            <div>
              <label className="block mb-1">Budget</label>
              <Input
                type="number"
                value={updatedBudget}
                onChange={(e) => setUpdatedBudget(e.target.value)}
                placeholder="Budget"
              />
            </div>
            <div>
              <label className="block mb-1">Start Date</label>
              <Input
                type="date"
                value={updatedStartDate}
                onChange={(e) => setUpdatedStartDate(e.target.value)}
              />
            </div>
            <div>
              <label className="block mb-1">End Date</label>
              <Input
                type="date"
                value={updatedEndDate}
                onChange={(e) => setUpdatedEndDate(e.target.value)}
              />
            </div>
          </div>
          <DialogClose asChild>
            <div className="flex flex-row justify-between w-full space-x-4 mt-4">
              <Button className="flex-1 py-2 px-4 rounded" onClick={handleUpdate}>
                Update
              </Button>
              <Button
                variant="destructive"
                className="flex-1 py-2 px-4 rounded"
                onClick={handleDelete}
              >
                <Trash2 /> Delete
              </Button>
            </div>
          </DialogClose>
        </DialogContent>
      </Dialog>
    </>
  );
}
