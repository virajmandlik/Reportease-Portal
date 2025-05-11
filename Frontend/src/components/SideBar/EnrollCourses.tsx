// components/EnrollCourses.tsx
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FC, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert } from "@/components/ui/alert";
import { toast } from "react-toastify";
interface EnrollCourses {
  user: {
    userid: number | null;
    type_id: number | null;
  } | null;
}

export const EnrollCourses: FC<EnrollCourses> = ({ user }) => {
  const [courses, setCourses] = useState<any[]>([]);
  const [selectedCourses, setSelectedCourses] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!user?.userid) {
        setError("User ID is missing");
        return;
      }

      try {
        setError(null);
        console.log("Fetching courses for userId:", user.userid);

        const response = await fetch(
          `http://localhost:3000/api/StudentCourses?userId=${user.userid}`
        );

        if (!response.ok) {
          console.error(
            "API response error:",
            response.status,
            response.statusText
          );
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        console.log("Fetched courses:", data);

        // Check if courses are available in the response data
        if (data && Array.isArray(data.courses)) {
          setCourses(data.courses);
        } else {
          setError("No courses found.");
        }
      } catch (error) {
        console.error("Error fetching courses:", error.message);
        setError("Error fetching courses. Please try again later.");
      }
    };

    if (user?.type_id === 4) fetchCourses();
  }, [user?.type_id, user?.userid]);

  const handleCourseSelection = (courseId: string) => {
    setSelectedCourses((prev) =>
      prev.includes(courseId)
        ? prev.filter((id) => id !== courseId)
        : [...prev, courseId]
    );
  };

  const handleSubmit = async () => {
    if (selectedCourses.length === 0) {
      setError("Please select at least one course to enroll.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("http://localhost:3000/api/enroll", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user?.userid,
          courses: selectedCourses,
        }),
      });

      if (!response.ok) throw new Error("Enrollment failed");

      const data = await response.json();
      console.log("Enrollment response:", data);

      setSuccessMessage("Enrollment successful!");
      setSelectedCourses([]);
    } catch (error) {
      console.error("Error during enrollment:", error.message);
      toast.error('Already enrolled..!', {
        className: "custom-toast",
        autoClose: 1000,
      })
      setError("Select different courses");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="secondary">Enroll</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enroll in Courses</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {error && <Alert variant="error">{error}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          {courses.length > 0 ? (
            courses.map((course) => (
              <div key={course.course_id} className="flex items-center gap-4">
                <Checkbox
                  checked={selectedCourses.includes(course.course_id)}
                  onCheckedChange={() =>
                    handleCourseSelection(course.course_id)
                  }
                />
                <span>{course.course_name}</span>
              </div>
            ))
          ) : (
            <p>No courses available for enrollment.</p>
          )}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Enroll"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EnrollCourses;
