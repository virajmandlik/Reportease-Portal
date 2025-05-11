import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Pencil, Trash2, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DeptCardProps {
  dept_id: number;
  dept_name: string;
  dept_type: number;
  department_id: number;
  institute_id: number;
  coordinator_id: number;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email: string;
  coordinator_phone: string;
  coordinator_gender: string;
  coordinator_username: string;
  width?: string;
  height?: string;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
}

export function DeptCard({
  dept_id,
  dept_name,
  coordinator_email,
  coordinator_first_name,
  coordinator_last_name,
  institute_id,
  onUpdate,
  onDelete,
}: // width = "300px",
// height = "150px"
DeptCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedDeptName, setUpdatedDeptName] = useState(dept_name);
  const [updatedCoordinatorEmail, setUpdatedCoordinatorEmail] =
    useState(coordinator_email);
  const [emails, setEmails] = useState<string[]>([]);

  useEffect(() => {
    const fetchEmails = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/facultyEmails/${institute_id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected data format");
        }
        setEmails(data);
      } catch (error) {
        console.error("Error fetching emails:", error);
        setEmails([]);
      }
    };

    if (institute_id) {
      fetchEmails();
    }
  }, [institute_id]);

  const handleUpdate = () => {
    onUpdate({
      dept_name: updatedDeptName,
      coordinator_email: updatedCoordinatorEmail,
      dept_id: dept_id,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete({
      dept_id: dept_id,
    });
    setIsDialogOpen(false);
  };

  return (
    <>
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Card
            // style={{ width, height }}
            className="relative rounded-lg border bg-card text-card-foreground shadow-sm cursor-pointer shadow-sm hover:shadow-xl hover:border-2 hover:border-black w-auto"
          >
            <CardHeader>
              <CardTitle className="text-center tracking-tight text-lg font-medium">
                {dept_name}
              </CardTitle>
            </CardHeader>

            <CardFooter className="flex flex-col items-start p-2">
              <div className="text-md place-self-center">
                <div className="flex items-center gap-1">
                  <User className="h-4 w-4" />
                  <span>
                    {coordinator_first_name + " " + coordinator_last_name}
                  </span>
                </div>
              </div>
            </CardFooter>
            <div className="absolute top-2 right-2">
              <Pencil
                className="hover:text-red-500"
                onClick={() => setIsDialogOpen(true)}
              />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="p-6 max-w-lg mx-auto">
          <ScrollArea>
            <DialogHeader>
              <DialogTitle className="text-2xl font-semibold mb-4">
                Edit Department
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mb-4">
              <div>
                <label className="block mb-1">Department Name</label>
                <Input
                  value={updatedDeptName}
                  onChange={(e) => setUpdatedDeptName(e.target.value)}
                  placeholder="Department Name"
                />
              </div>
              <div>
                <label htmlFor="offer" className="block mb-1">
                  Coordinator Email
                </label>
                <Select
                  name="host"
                  value={updatedCoordinatorEmail}
                  onValueChange={(value) => setUpdatedCoordinatorEmail(value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select email" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Email</SelectLabel>
                      {emails.map((email) => (
                        <SelectItem key={email.email_id} value={email.email_id}>
                          {email.email_id}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogClose asChild>
              <div className="flex flex-row justify-between w-full space-x-4">
                <Button
                  className="flex-1 mt-4 py-2 px-4 rounded"
                  onClick={handleUpdate}
                >
                  Update
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 mt-4 py-2 px-4 rounded"
                  onClick={handleDelete}
                >
                  <Trash2 /> Delete
                </Button>
              </div>
            </DialogClose>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </>
  );
}
