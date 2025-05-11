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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectGroup, SelectItem,SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DeptCard } from "./DeptCard";
import AccessControl from "./ABC";


interface User {
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  institute_id: number | null;
  type_id: number | null;
  is_active: boolean;
  gender: string;
}


interface DeptCardProps {
  dept_name: string;
  dept_type: number;
  institute_id: number;
  coordinator_id: number;
  coordinator_first_name: string;
  coordinator_last_name: string;
  coordinator_email: string;
  width?: string;
  height?: string;
  department_id: number;
}


export const AccessPage: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
  const [department, setDepartment] = useState("");
  const [deptType, setDeptType] = useState("");
  const [deptSubType, setDeptSubType] = useState("");
  const [departments, setDepartments] = useState<DeptCardProps[]>([]);
  const [coordData, setCoordData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    phone_number: 0,
    gender: "",
    password: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();


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
        is_active: true,
      };


      setUser(userDetails);
    } catch (err) {
      console.log(err);
      navigate("/login");
    }
  }, [navigate]);


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setCoordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log(user?.institute_id);
        if(!user?.institute_id)
          return;
        const response = await fetch(`http://localhost:3000/api/departments/${user?.institute_id}`);
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const departments = await response.json();
        setDepartments(departments);
      } catch (error) {
        console.error("Error fetching departments:", error);
        return [];
      }
    };


    fetchDepartments();


  }, [user?.institute_id]);
 


  const handleUpdateDepartment = async (updatedData) => {
    try {
      const dept_name = updatedData.dept_name;
      const coordemail = updatedData.coordinator_email;
      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/update-department/${updatedData.dept_id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ dept_name, coordemail }),
        }
      );


      if (response.ok) {
        toast.success("Department updated successfully!", {
          className: "custom-toast",
          autoClose: 1000,
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to update department.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while updating the department.");
    }
  };


  const handleDeleteDepartment = async (data) => {
    try {
      const dept_id = data.dept_id;


      const token = Cookies.get("token");
      const response = await fetch(
        `http://localhost:3000/api/delete-department/${dept_id}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );


      if (response.ok) {
        toast.success("Department deleted successfully!", {
          className: "custom-toast",
          autoClose: 1000,
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to delete department.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while deleting the department.");
    }
  };


  const handleDeptTypeChange = (value: string) => {
    setDeptType(value);
    if (value === "Non-Academic") {
      setDepartment("");
    }
  };


  const handleDeptSubTypeChange = (value: string) => {
    setDeptSubType(value);
    setDepartment(value);
  };


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    if (
      !department ||
      !deptType ||
      !coordData.first_name ||
      !coordData.last_name ||
      !coordData.email ||
      !coordData.password
    ) {
      toast.error("Please fill in all required fields.");
      return;
    }


    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }


    try {
      const username = user?.username;
      const institute_id = user?.institute_id;


      const response = await fetch(
        "http://localhost:3000/api/create-department",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            institute_id,
            department,
            deptType,
            coordData,
          }),
        }
      );


      if (response.ok) {
        setCoordData({
          username: "",
          first_name: "",
          last_name: "",
          email: "",
          phone_number: 0,
          gender: "",
          password: "",
        });
        setDepartment("");
        setDeptType("");
        setDeptSubType("");
        setIsDialogOpen(false);
        alert("Department and coordinator created successfully!");
        toast.success("Department created successfully!", {
          className: "custom-toast",
          autoClose: 2000,
          onClose: () => navigate(`/dashboard/${username}`),
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create department.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again later." + err);
    }
  };


  const handleBulkSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }


    if (file) {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("institute_id", user?.institute_id); // Include institute_id


      try {
        const response = await fetch(
          "http://localhost:3000/api/departments/upload",
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${token}`,
            },
            body: formData,
          }
        );


        if (response.ok) {
          toast.success("Departments uploaded successfully!", {
            className: "custom-toast",
            autoClose: 2000,
            onClose: () => navigate(`/dashboard/${user?.username}`),
          });
        } else {
          const errorData = await response.json();
          toast.error(errorData.message || "Failed to upload departments.");
        }
      } catch (err) {
        toast.error(
          "An error occurred while uploading the file. Please try again later." +
            err
        );
      }
    } else {
      toast.error("Please select a file to upload.");
    }
  };


  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(
        "http://localhost:3000/api/departments/template"
      );
      if (!response.ok) {
        throw new Error("Failed to download template");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "department_template.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Error downloading template: " + error.message);
    }
  };


  const handleDownloadData = async (institute_id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/api/departments/download?institute_id=${user?.institute_id}`
      );
      if (!response.ok) {
        throw new Error("Failed to download data");
      }
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = window.URL.createObjectURL(blob);
      link.setAttribute("download", "departments_data.xlsx");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      toast.error("Error downloading data: " + error.message);
    }
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="access-control" />
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
            <SheetContent side="left " className="flex flex-col">
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
                <CircleUser className="h-5 w-5" />
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
            <AccessControl/>
        </main>
      </div>
    </div>
  );
};






