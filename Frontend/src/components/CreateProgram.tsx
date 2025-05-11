import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CircleUser,
  Command,
  Home,
  Menu,
  Package2,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./SideBar/Sidebar";
import ModeToggle from "./mode-toggle";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProgramCard } from "./ProgramCard";




interface User {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photoURL: string | null;
  institute_id: number | null;
  type_id: number | null;
  is_active: boolean;
  gender: string;
}




interface ProgramCardProps {
  program_id: number;
  prog_name: string;
  dept_name: string;
  intake: number;
  duration: number;
  semester_count: number
}




export const CreateProgram: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [program, setProgram] = useState("");
  const [duration, setDuration] = useState(1);
  const [intake, setIntake] = useState(1);
  const [semesters, setSemesters] = useState(2);
  const [dept, setDept] = useState("");
  const [departments, setDepartments] = useState<string[]>([]);
  const [uploadType, setUploadType] = useState<"single" | "bulk">("single");
  const [programs, setPrograms] = useState<ProgramCardProps[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();








  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/acadDepartmentNames/${user?.institute_id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected data format");
        }
        setDepartments(data);
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]);
      }
    };








    if (user?.institute_id) {
      fetchDepartments();
    }
  }, [user?.institute_id]);




  useEffect(() => {
    const fetchPrograms = async () => {
      try {
        console.log(user?.institute_id);
        if(!user?.institute_id)
          return;
        const response = await fetch(`http://localhost:3000/api/programs/${user?.institute_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const programsData = await response.json();
        console.log(programsData);
        setPrograms(programsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setPrograms([]);
      }
    };




    // Initial fetch
    fetchPrograms();




    // Polling interval for continuous updating
    // const interval = setInterval(fetchDepartments, 30000);




    // return () => clearInterval(interval); // Cleanup on unmount
  }, [user?.institute_id]); // Re-run if user or institute_id changes




  const handleUpdateProgram = async (updatedData) => {
    try {
      console.log(updatedData);
      const program_name = updatedData.program_name;
      const duration = updatedData.duration;
      const intake = updatedData.intake;
      const semester_count = updatedData.semester_count;
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/update-program/${updatedData.program_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({program_name, duration, intake, semester_count}),
      });
 
      if (response.ok) {
        toast.success('Program updated successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });




      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update program.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the program.');
    }
  };  




  const handleDeleteProgram = async (data) => {
    try {
      const prog_id = data.program_id;




      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/delete-program/${prog_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
 
      if (response.ok) {
        toast.success('Program deleted successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });




      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete program.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while deleting the program.');
    }
  };




  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }








    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;








      if (decoded.exp < currentTime) {
        alert("Session expired. Please login again.");
        Cookies.remove("token");
        navigate("/login");
        return;
      }








      const userDetails: User = {
        username: decoded.username,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email,
        institute_id: decoded.institute_id,
        type_id: decoded.type_id,
        gender: decoded.gender,
      };








      setUser(userDetails);
    } catch (err) {
      navigate("/login");
      console.error(err);
    }
  }, [navigate]);








  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();








    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }








    try {
      const username = user?.username;
      console.log(username, program, duration, intake, semesters);








      const response = await fetch(
        `http://localhost:3000/api/create-program/${user?.username}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dept, program, duration, intake, semesters }),
        }
      );








      if (response.ok) {
        toast.success("Program created successfully!", {
          className: "custom-toast",
          autoClose: 2000,
          onClose: () => navigate(`/admin/create-program`),
        });
        setProgram("");
        setDuration(1);
        setIntake(1);
        setSemesters(2);
        setDept("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create program.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again later.");
      console.error(err);
    }
  };








  const handleBulkUpload = async () => {
    if (!file) return;








    const formData = new FormData();
    formData.append("file", file);








    try {
      const response = await fetch(
        `http://localhost:3000/api/bulk-program/upload/${user?.username}`,
        {
          method: "POST",
          body: formData,
        }
      );








      if (response.ok) {
        toast.success("Bulk upload successful!", {
          className: "custom-toast",
          autoClose: 2000,
        });
        setFile(null);
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Bulk upload failed.");
      }
    } catch (err) {
      toast.error("An error occurred during bulk upload.");
      console.error(err);
    }
  };








  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const uploadedFile = e.target.files[0];
      const allowedExtensions = [".csv", ".xlsx"]; // Allow both .csv and .xlsx
      const maxSize = 5 * 1024 * 1024; // 5 MB








      // Check if the uploaded file has a valid extension
      const isValidExtension = allowedExtensions.some((extension) =>
        uploadedFile.name.endsWith(extension)
      );
      if (!isValidExtension) {
        toast.error("Invalid file type. Please upload a .csv or .xlsx file.");
        return;
      }








      // Check if the uploaded file exceeds the maximum size
      if (uploadedFile.size > maxSize) {
        toast.error("File size exceeds 5 MB.");
        return;
      }








      // If both checks pass, set the file
      setFile(uploadedFile);
    }
  };








  const handleToggleUploadType = () => {
    setUploadType(uploadType === "single" ? "bulk" : "single");
  };








  const handleDownloadData = () => {
    fetch(`http://localhost:3000/api/bulk-program/download`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Course_Data.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error("Download error:", err));
  };








  const handleTemplateDownload = () => {
    fetch(`http://localhost:3000/api/bulk-program/template`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download template");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "Create_Program_Template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Template download error:", err));
  };








  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="create-programs" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="shrink-0 md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <nav className="grid gap-2 text-lg font-medium">
                <Link
                  to="/"
                  className="flex items-center gap-2 text-lg font-semibold"
                >
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link
                  to="/"
                  className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground"
                >
                  <Home className="h-5 w-5" />
                  Dashboard
                </Link>
              </nav>
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search or Type a Job"
                  className="h-10 px-3 mr-50 ring-offset-background file:border-0 file:bg-transparent file:text-sm
                  file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
                  focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed py-2 ps-10 pe-16
                  block w-1/2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-200
                  focus:ring-0 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-800 dark:border-neutral-700
                  dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral-600"
                />
                <div className="absolute inset-y-0 end-0 flex items-center pointer-events-none z-20 pe-3 text-gray-400">
                  <Command className="absolute flex-shrink-0 size-3 text-gray-400 dark:text-white/60" />
                </div>
              </div>
            </form>
          </div>
          <ModeToggle />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User  Avatar"
                    className="h-9 w-9 rounded-full"
                  />
                ) : (
                  <CircleUser className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-sidebar font-bold">Programs</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2 hover:border-sidebar">
                  Create Program
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Create Program</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="flex justify-between">
                      <Button onClick={handleToggleUploadType}>
                        Switch to {uploadType === "single" ? "Bulk" : "Single"}{" "}
                        Upload
                      </Button>
                    </div>
                    {uploadType === "single" ? (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="offer" className="text-left">
                            Offered by
                          </Label>
                          <Select
                            name="host"
                            value={dept}
                            onValueChange={(value) => setDept(value)}
                          >
                            <SelectTrigger className="w-[475px]">
                              <SelectValue placeholder="Select department" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectGroup>
                                <SelectLabel>Offered by</SelectLabel>
                                {departments.map((department) => (
                                  <SelectItem
                                    key={department.dept_name}
                                    value={department.dept_name}
                                  >
                                    {department.dept_name}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="program" className="text-left">
                            Program Name
                          </Label>
                          <Input
                            id="program"
                            type="string"
                            required
                            value={program}
                            onChange={(e) => setProgram(e.target.value)}
                            placeholder="Program Name"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="duration" className="text-left">
                            Duration (In Years)
                          </Label>
                          <Input
                            id="duration"
                            type="number"
                            min="1"
                            max="8"
                            required
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            placeholder="Duration (In Years)"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="intake" className="text-left">
                            Intake
                          </Label>
                          <Input
                            id="intake"
                            type="number"
                            min="1"
                            max="10000"
                            required
                            value={intake}
                            onChange={(e) => setIntake(e.target.value)}
                            placeholder="Intake"
                            className="col-span-3"
                          />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="totalsem" className="text-left">
                            Total Semesters
                          </Label>
                          <Input
                            id="totalsem"
                            type="number"
                            min="2"
                            max="16"
                            required
                            value={semesters}
                            onChange={(e) => setSemesters(e.target.value)}
                            placeholder="Total Semesters"
                            className="col-span-3"
                          />
                        </div>
                        <DialogClose>
                          <Button
                            type="submit"
                            onClick={handleSubmit}
                            className="mr-4"
                          >
                            Create Program
                          </Button>
                        </DialogClose>
                      </>
                    ) : (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="bulk-upload" className="text-left">
                            Bulk Upload
                          </Label>
                          <Input
                            id="bulk-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="col-span-3"
                          />
                        </div>
                        <Button
                          onClick={handleBulkUpload}
                          disabled={!file}
                          className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-md ${
                            file
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-300 text-gray-500 cursor-not-allowed"
                          }`}
                        >
                          Upload Bulk Data
                        </Button>
                      </>
                    )}
                    <div className="flex justify-between mt-4">
                      <Button
                        onClick={handleDownloadData}
                        className="bg-blue-500 text-white"
                      >
                        Download Data
                      </Button>
                      <Button
                        onClick={handleTemplateDownload}
                        className="bg-purple-500 text-white"
                      >
                        Download Template
                      </Button>
                    </div>
                  </div>
                </ScrollArea>
                <DialogClose />
              </DialogContent>
            </Dialog>
          </div>
          <div className="pl-3 grid gap-x-5 gap-y-4 grid-cols-2 md:grid-cols-3 md:gap-y-4 md:gap-x-16 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12">
              {programs.map(program => (
                  <ProgramCard
                    program_id={program.program_id}
                    program_name={program.prog_name}
                    department_name={program.dept_name}
                    intake={program.intake}
                    duration={program.duration}
                    semester_count={program.semester_count}
                    onUpdate={handleUpdateProgram}
                    onDelete={handleDeleteProgram}
                    />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};














