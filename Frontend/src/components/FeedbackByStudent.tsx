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
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { jwtDecode } from "jwt-decode";

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

interface Department {
  dept_name: string;
}

export const FeedbackByStudent: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [selectedDepartmentName, setSelectedDepartmentName] = useState<
    string | null
  >(null);
  const [feedback, setFeedback] = useState("");
  const [rating, setRating] = useState<number | null>(null);
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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
    }
  }, [navigate]);

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!user?.institute_id) return;

      try {
        const response = await fetch(
          `http://localhost:3000/api/departmentNames/${user.institute_id}`
        );
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error("Unexpected data format");
        }
        setDepartments(data); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartments([]); // Set empty array on error
      }
    };

    fetchDepartments();
  }, [user?.institute_id]);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleLogout = () => {
    Cookies.remove("token");
    navigate("/login");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }
    if (!selectedDepartmentName || !feedback || rating === null) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const username = user?.username;
      const response = await fetch(
        "http://localhost:3000/api/submit-feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            username,
            departmentName: selectedDepartmentName, // Send department name instead of ID
            feedback,
            rating,
          }),
        }
      );
      if (response.ok) {
        // console.log("Feedback submitted successfully!");
        toast.success("Feedback submitted successfully!", {
          className: "custom-toast",
          autoClose: 1000,
        });
        // Clear form inputs
      } else {
        const errorData = await response.json();
        console.error("Error submitting feedback:", errorData);
        toast.error(errorData.message || "Failed to submit feedback.");
      }
    } catch (err) {
      toast.error("feedback already given for that department..!", {
        className: "custom-toast",
        autoClose: 1000,
      });
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="feedback" />
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
            <form onSubmit={handleSubmit}>
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
                  dark:text-neutral-400 dark:placeholder:text-neutral-400 dark:focus:ring-neutral -600"
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
                {user?.displayName || "My Account"}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main
          className="flex flex-1 flex-col gap-4 p-4 ```tsx
        lg:gap-6 lg:p-6"
        >
          <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">
              Feedback
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">
                  Give Feedback
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Submit Feedback</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <form onSubmit={handleSubmit}>
                    {" "}
                    {/* Moved form here */}
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-left">
                          Department
                        </Label>
                        <select
                          id="department"
                          required
                          value={selectedDepartmentName || ""}
                          onChange={(e) =>
                            setSelectedDepartmentName(e.target.value)
                          }
                          className="col-span-3 border rounded-md p-2"
                        >
                          <option value="" disabled>
                            Select a department
                          </option>
                          {departments.map((department, index) => (
                            <option
                              key={`${department.dept_name}-${index}`}
                              value={department.dept_name}
                            >
                              {department.dept_name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="feedback" className="text-left">
                          Feedback
                        </Label>
                        <textarea
                          id="feedback"
                          required
                          value={feedback}
                          onChange={(e) => setFeedback(e.target.value)}
                          placeholder="Enter your feedback here"
                          className="col-span-3 border rounded-md p-2"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label className="block text-sm font-medium">
                          Rating
                        </Label>
                        <div className="flex space-x-2 col-span-3">
                          {[1, 2, 3, 4, 5].map((ratingValue) => (
                            <button
                              key={ratingValue}
                              type="button"
                              onClick={() => handleRatingChange(ratingValue)}
                              className={`text-2xl ${
                                rating === ratingValue
                                  ? "text-yellow-500"
                                  : "text-gray-500"
                              }`}
                            >
                              {ratingValue <= rating ? "⭐" : "☆"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                    <DialogClose>
                      <Button type="submit" className="mr-4">
                        Submit Feedback
                      </Button>
                    </DialogClose>
                  </form>
                </ScrollArea>
              </DialogContent>
            </Dialog>
            {/* Alert dialog for confirmation */}
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alert</DialogTitle>
                  <DialogDescription>
                    You need to log in again to continue. Do you want to log
                    out?
                  </DialogDescription>
                </DialogHeader>
                <div className="flex justify-end">
                  <Button
                    variant="outline"
                    onClick={() => setShowConfirmDialog(false)}
                  >
                    No
                  </Button>
                  <Button variant="primary" onClick={handleLogout}>
                    Yes
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};
