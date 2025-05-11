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

interface EventCardProps {
  event_id: number;
  event_name: string;
  event_description: string;
  event_type: string;
  event_date: string;
  dept_id: number;
  onUpdate: (data: any) => void;
  onDelete: (data: any) => void;
  width?: string;
  height?: string;
}

export function EventCard({
  event_id,
  event_name,
  event_description,
  event_type,
  event_date,
  dept_id,
  onUpdate,
  onDelete,
  width = "300px",
  height = "200px",
}: EventCardProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [updatedEventName, setUpdatedEventName] = useState(event_name);
  const [updatedEventDescription, setUpdatedEventDescription] = useState(event_description);
  const [updatedEventType, setUpdatedEventType] = useState(event_type);
  const [updatedEventDate, setUpdatedEventDate] = useState(event_date);

  const handleUpdate = () => {
    onUpdate({
      event_id,
      event_name: updatedEventName,
      event_description: updatedEventDescription,
      event_type: updatedEventType,
      event_date: updatedEventDate,
    });
    setIsDialogOpen(false);
  };

  const handleDelete = () => {
    onDelete({ event_id });
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
                {event_name}
              </CardTitle>
            </CardHeader>
            <CardFooter className="flex flex-col items-start p-2">
              <div className="text-sm">
                <p><b>Type:</b> {event_type}</p>
                <p><b>Date:</b> {event_date}</p>
              </div>
            </CardFooter>
            <div className="absolute top-2 right-2">
              <Pencil className="hover:text-red-500" onClick={() => setIsDialogOpen(true)} />
            </div>
          </Card>
        </DialogTrigger>

        <DialogContent className="p-6 max-w-lg mx-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold mb-4">Edit Event</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="block mb-1">Event Name</label>
              <Input
                value={updatedEventName}
                onChange={(e) => setUpdatedEventName(e.target.value)}
                placeholder="Event Name"
              />
            </div>
            <div>
              <label className="block mb-1">Event Description</label>
              <Textarea
                value={updatedEventDescription}
                onChange={(e) => setUpdatedEventDescription(e.target.value)}
                placeholder="Event Description"
              />
            </div>
            <div>
              <label className="block mb-1">Event Type</label>
              {/* <Input
                value={updatedEventType}
                onChange={(e) => setUpdatedEventType(e.target.value)}
                placeholder="Event Type"
              /> */}
              <Select name="type" value={updatedEventType} onValueChange={(value) => setUpdatedEventType((value))}>
                      <SelectTrigger className="w-[475px]">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Event Type</SelectLabel>
                          <SelectItem value="Technical">Technical</SelectItem>
                          <SelectItem value="Cultural">Cultural</SelectItem>
                          <SelectItem value="Institute-level">Institute-level</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
            </div>
            <div>
              <label className="block mb-1">Event Date</label>
              <Input
                type="date"
                value={updatedEventDate.toLocaleString()}
                onChange={(e) => setUpdatedEventDate(e.target.value)}
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
