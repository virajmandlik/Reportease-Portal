import { FC, useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UploadCloud, RefreshCw, Save, FileText,FolderKanban} from "lucide-react";
import { Link } from "react-router-dom";

interface AddDataDialogProps {
  activePage: string;
  user: {
    userid: number | null;
    email: string | null;
    username: string | null;
    institute_id: number | null;
    type_id: number | null;
  } | null;
}


export const AddDataDialog: FC<AddDataDialogProps> = ({ user }) => {
  const [selectedCourse, setSelectedCourse] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  //hk


  const [courses, setCourses] = useState<any[]>([]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/courses?userId=${user?.userid}`
        );
        if (!response.ok) throw new Error("Failed to fetch courses");
        const data = await response.json();
        console.log('the courses are',data)
        setCourses(data.courses || []);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };


    if (user?.type_id === 3) fetchCourses();
  }, [user?.type_id]);


  const handleUpload = (file: File, courseId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseId);
    console.log("Course id is: ", courseId);
    fetch("http://localhost:3000/api/upload", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Upload failed");
        alert("File uploaded successfully");
      })
      .catch((err) => console.error("Upload error:", err));
  };


  const handleUpdate = (file: File, courseId: string) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("course_id", courseId);


    fetch("http://localhost:3000/api/update", {
      method: "POST",
      body: formData,
    })
      .then((res) => {
        if (!res.ok) throw new Error("Update failed");
        alert("File updated successfully");
      })
      .catch((err) => console.error("Update error:", err));
  };


  const handleDownload = (courseId: string) => {
    fetch(`http://localhost:3000/api/download`)
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `course_${courseId}_data.xlsx`;
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Download error:", err));
  };


  const handleTemplateDownload = () => {
    fetch(`http://localhost:3000/api/download-template`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download template");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "result_template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Template download error:", err));
  };


  //hk


  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      ]; // Example for XLSX files
      if (!allowedTypes.includes(uploadedFile.type)) {
        alert("Please upload a valid file type.");
        return;
      }
      setFile(uploadedFile);
    }
  };


  const resetStates = () => {
    setSelectedCourse("");
    setFile(null);
  };


  return (
    <Dialog
      onOpenChange={(open) => {
        if (!open) resetStates();
      }}
    >
      <DialogTrigger asChild>
        <Button  variant="ghost"
          className={`flex place-self-start gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary text-muted-foreground   `}
        >
          <FolderKanban className="h-4 w-4"/>
          Manage Results
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg rounded-lg bg-white p-6 shadow-md">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-800">
            Manage Course Data
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          {/* Course Dropdown */}
          <div>
            <label
              htmlFor="course"
              className="block text-sm font-medium text-gray-600"
            >
              Course
            </label>
            <select
              id="course"
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="mt-2 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select a course</option>
              {courses.map((course) => (
                <option key={course.course_id} value={course.course_id}>
                  {course.course_name}
                </option>
              ))}
            </select>
          </div>


          {/* File Upload */}
          <div>
            <label
              htmlFor="file"
              className="block text-sm font-medium text-gray-600"
            >
              Upload File
            </label>
            <Input
              id="file"
              type="file"
              onChange={handleFileChange}
              className="mt-2 w-full"
            />
          </div>


          {/* Buttons */}
          <div className="flex flex-wrap justify-end gap-3">
            <Button
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                selectedCourse
                  ? "bg-blue-600 text-white hover:bg-blue-700"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => handleDownload(selectedCourse)}
              disabled={!selectedCourse}
              aria-label="Download course data"
            >
              <Save size={16} /> Download
            </Button>


            <Button
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                file && selectedCourse
                  ? "bg-yellow-500 text-white hover:bg-yellow-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => file && handleUpdate(file, selectedCourse)}
              disabled={!file || !selectedCourse}
              aria-label="Update course data"
            >
              <RefreshCw size={16} /> Update
            </Button>


            <Button
              className={`flex items-center gap-2 px-4 py-2 rounded-md ${
                file && selectedCourse
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
              onClick={() => file && handleUpload(file, selectedCourse)}
              disabled={!file || !selectedCourse}
              aria-label="Upload course data"
            >
              <UploadCloud size={16} /> Upload
            </Button>


            {/* Download Template Button */}
            <Button
              className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
              onClick={handleTemplateDownload}
              aria-label="Download sample template"
            >
              <FileText size={16} /> Download Template
            </Button>
          </div>
        </div>
        <DialogClose asChild>
          <Button
            className="  p-2 rounded-full bg-white text-gray-500 shadow-md hover:bg-blue-100 hover:text-blue-600 transition-all duration-200 ease-in-out focus:ring focus:ring-blue-400 focus:outline-none sm:top-4 sm:right-4"
            aria-label="Close"
          >
            Close
          </Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
};





