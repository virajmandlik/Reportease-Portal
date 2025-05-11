import { useState } from "react";
import { Card, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Button } from "./ui/button";
import { Pencil, Trash2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Combobox } from "./Combobox";

interface ClubCardProps {
  club_id: number;
  club_name: string;
  club_type: string;
  club_head: string;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  faculties: string[];
  width?: string;
  height?: string;
}

export function ClubCard({
  club_id,
  club_name,
  club_type,
  club_head,
  onUpdate,
  onDelete,
  width = "300px",
  height = "200px",
}: ClubCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedClubName, setUpdatedClubName] = useState(club_name);
  const [updatedClubType, setUpdatedClubType] = useState(club_type);
  const [updatedClubHead, setUpdatedClubHead] = useState(club_head);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [value, setValue] = useState(club_head);
  const [open, setOpen] = useState(false);

  const frameworks = faculties.map((faculty) => ({
    value: faculty,
    label: faculty,
  }));

  const handleFrameworkChange = (selectedValue: string) => {
    console.log("Selected:", selectedValue);
    setUpdatedClubHead(selectedValue);
  };

  const MyCombobox = () => {
    return (
      <Combobox
        frameworks={frameworks}
        value={value}
        setValue={setValue}
        open={open}
        setOpen={setOpen}
        onChange={handleFrameworkChange}
      />
    );
  };

  const handleUpdate = () => {
    onUpdate({
      club_id,
      club_name: updatedClubName,
      club_type: updatedClubType,
      club_head: updatedClubHead,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete({ club_id });
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
                {club_name}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex flex-col items-start p-2">
              <div className="text-sm">
                <p><b>Type:</b> {club_type}</p>
                <p><b>Head:</b> {club_head}</p>
              </div>
            </CardFooter>
            <div className="absolute top-2 right-2">
              <Pencil className="hover:text-red-500" onClick={() => setIsDialogOpen(true)} />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-4">Edit Club</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Club Name</label>
              <Input
                value={updatedClubName}
                onChange={(e) => setUpdatedClubName(e.target.value)}
                placeholder="Club Name"
              />
            </div>
            <div>
              <label className="block mb-1">Club Type</label>
              <Select
                name="type"
                value={updatedClubType}
                onValueChange={(value) => setUpdatedClubType(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Club Type</SelectLabel>
                    <SelectItem value="Technical">Technical</SelectItem>
                    <SelectItem value="Cultural">Cultural</SelectItem>
                    <SelectItem value="Academic">Academic</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block mb-1">Club Head</label>
              <Input
                value={updatedClubHead}
                onChange={(e) => setUpdatedClubHead(e.target.value)}
                placeholder="Club Head"
              />
              {/* <MyCombobox/> */}
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