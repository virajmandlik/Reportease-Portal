import { FC, useEffect, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";
import { Sidebar } from "./SideBar/Sidebar";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Search, Command } from "lucide-react";

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

interface ReportVersion {
  log_id: number;
  title: string;
  description: string;
  file_path?: string;
}

const ReportVersionSelector: FC = () => {
  const { institute_id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const departmentName = query.get("departmentName") || "";

  const [user, setUser ] = useState<User | null>(null);
  const [year, setYear] = useState<string | null>(null);
  const [versions, setVersions] = useState<ReportVersion[]>([]);
  const [selectedVersion, setSelectedVersion] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [isVersionDialogOpen, setIsVersionDialogOpen] = useState<boolean>(false);
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState<boolean>(false);
  const [password, setPassword] = useState<string>("");

  const fetchVersions = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/pdf/report-versions/${departmentName}/${year}`
      );
      const data = await response.json();
      if (Array.isArray(data.logs)) {
        setVersions(data.logs);
      } else {
        console.error("Fetched data is not an array:", data);
        setVersions([]);
      }
    } catch (error) {
      console.error("Error fetching report versions:", error);
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

      setUser (userDetails);
    } catch (error) {
      console.error("Error decoding token:", error);
      navigate("/login");
    }
  }, [navigate]);

  useEffect(() => {
    if (year) {
      fetchVersions();
      setIsVersionDialogOpen(true);
    }
  }, [year]);

  const handleViewReport = () => {
    if (selectedVersion === null) {
      alert("Please select a report version.");
      return;
    }
    setIsPasswordDialogOpen(true); // Open password dialog
  };

  const handlePasswordSubmit = async () => {
    if (!password) {
      alert("Please enter the password.");
      return }

    const selectedReport = versions.find(
      (version) => version.log_id === selectedVersion
    );

    if (selectedReport) {
      const response = await fetch("http://localhost:3000/pdf/verify-report-access", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          logId: selectedReport.log_id,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // If access is verified, open the report in a new tab
        window.open(data.filePath, "_blank");
        setIsPasswordDialogOpen(false); // Close the password dialog
      } else {
        alert(data.message); // Show error message
        setPassword(""); // Clear the password input
      }
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="view-departmental-report" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0">
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
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">Select Report Version</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">Select Year</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]" aria-labelledby="select-year-dialog">
                <DialogHeader>
                  <DialogTitle>Select Report Year</DialogTitle>
                </DialogHeader>
                <Select
                  onValueChange={(value) => {
                    const selectedYear = value.split('-')[0]; // Get the lower year
                    setYear(selectedYear);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Year" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Years</SelectLabel>
                      {Array.from({ length: 10 }, (_, i) => {
                        const yearOption = (2000 + i).toString() + '-' + (2001 + i).toString();
                        return (
                          <SelectItem key={yearOption} value={yearOption}>
                            {yearOption}
                          </SelectItem>
                        );
                      })}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <DialogClose asChild>
                  <Button>Close</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <Dialog open={isVersionDialogOpen} onOpenChange={setIsVersionDialogOpen}>
              <DialogContent className="sm:max-w-[725px]" aria-labelledby="select-version-dialog">
                <DialogHeader>
                  <DialogTitle>Select Report Version</DialogTitle>
                </DialogHeader>
                <Select onValueChange=
                  {(value) => setSelectedVersion(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Version" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectLabel>Versions</SelectLabel>
                      {versions.map((version) => (
                        <SelectItem key={version.log_id} value={version.log_id.toString()}>
                          {version.report_name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <DialogClose asChild>
                  <Button onClick={handleViewReport}>View Report</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>

            <Dialog open={isPasswordDialogOpen} onOpenChange={setIsPasswordDialogOpen}>
              <DialogContent className="sm:max-w-[400px]" aria-labelledby="enter-password-dialog">
                <DialogHeader>
                  <DialogTitle>Enter Report Password</DialogTitle>
                </DialogHeader>
                <Input
                  type="password"
                  placeholder="Enter Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mb-4"
                />
                <DialogClose asChild>
                  <Button onClick={handlePasswordSubmit}>Submit</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
          <ScrollArea>
            <div>
              {versions.length > 0 ? (
                versions.map((version) => (
                  <div key={version.log_id}>
                    <h3>{version.report_name}</h3>
                    <p>{version.description || "No description available."}</p>
                  </div>
                ))
              ) : (
                <p>No versions available for the selected department and year.</p>
              )}
            </div>
          </ScrollArea>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};

export default ReportVersionSelector;