import { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";


interface ProgramCardProps {
  program_id: number;
  program_name: string;
  department_name: string;
  duration: number;
  intake: number;
  semester_count: number;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  width?: string;
  height?: string;
}


export function ProgramCard({
  program_id,
  program_name,
  department_name,
  duration,
  intake,
  semester_count,
  onUpdate,
  onDelete,
  width = "300px",
  height = "150px",
}: ProgramCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedProgramName, setUpdatedProgramName] = useState(program_name);
  const [updatedDeptName, setUpdatedDeptName] = useState(department_name);
  const [updatedDuration, setUpdatedDuration] = useState(duration);
  const [updatedIntake, setUpdatedIntake] = useState(intake);
  const [updatedSemesterCount, setUpdatedSemesterCount] = useState(semester_count);


  const handleUpdate = () => {
    onUpdate({
      program_id,
      program_name: updatedProgramName,
      duration: updatedDuration,
      intake: updatedIntake,
      semester_count: updatedSemesterCount,
    });
    setIsDialogOpen(false);
  };


  const handleDelete = () => {
    onDelete({ program_id });
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
                {program_name}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex flex-col items-start p-2">
              <div className="text-sm">
                <p className="text-center">{department_name}</p>
              </div>
            </CardFooter>
            <div className="absolute top-2 right-2">
              <Pencil className="hover:text-red-500" onClick={() => setIsDialogOpen(true)} />
            </div>
          </Card>
        </DialogTrigger>


        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-4">Edit Program</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Program Name</label>
              <Input
                value={updatedProgramName}
                onChange={(e) => setUpdatedProgramName(e.target.value)}
                placeholder="Program Name"
              />
            </div>
            <div>
              <label className="block mb-1">Department Name</label>
              <Input
                disabled
                value={updatedDeptName}
                onChange={(e) => setUpdatedDeptName(e.target.value)}
                placeholder="Program Name"
              />
            </div>
            <div>
              <label className="block mb-1">Duration</label>
              <Input
              type="number"
              min="1" max="8"
                value={updatedDuration}
                onChange={(e) => setUpdatedDuration(e.target.value)}
                placeholder="e.g., 4 years"
              />
            </div>
            <div>
              <label className="block mb-1">Intake</label>
              <Input
                type="number"
                min="1" max="50000"
                value={updatedIntake}
                onChange={(e) => setUpdatedIntake(Number(e.target.value))}
                placeholder="Intake"
              />
            </div>
            <div>
              <label className="block mb-1">Semester Count</label>
              <Input
                type="number"
                min="1" max="16"
                value={updatedSemesterCount}
                onChange={(e) => setUpdatedSemesterCount(Number(e.target.value))}
                placeholder="Semesters"
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




