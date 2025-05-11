import { FC } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

interface RoleBasedDialogProps {
  courses: any[];
  selectedCourses: string[];
  isLoading: boolean;
  onCourseToggle: (id: string) => void;
  onConfirm: () => void;
}

export const RoleBasedDialog: FC<RoleBasedDialogProps> = ({
  courses,
  selectedCourses,
  isLoading,
  onCourseToggle,
  onConfirm,
}) => (
  <Dialog>
    <DialogTrigger asChild>
      <Button className="my-2">Select Courses</Button>
    </DialogTrigger>
    <DialogContent className="sm:max-w-[600px]">
      <DialogHeader>
        <DialogTitle>Select Courses</DialogTitle>
      </DialogHeader>
      <ScrollArea className="max-h-[400px]">
        {isLoading ? (
          <p>Loading courses...</p>
        ) : courses.length === 0 ? (
          <p>No courses available.</p>
        ) : (
          <Select
            multiple
            value={selectedCourses}
            onValueChange={onCourseToggle}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select Courses" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Courses</SelectLabel>
                {courses.map((course) => (
                  <SelectItem
                    key={course.course_id}
                    value={course.course_id.toString()}
                  >
                    {course.course_name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        )}
      </ScrollArea>
      <div className="flex justify-end mt-4 gap-2">
        <DialogClose asChild>
          <Button variant="secondary">Cancel</Button>
        </DialogClose>
        <Button onClick={onConfirm} disabled={selectedCourses.length === 0}>
          Confirm
        </Button>
      </div>
    </DialogContent>
  </Dialog>
);
