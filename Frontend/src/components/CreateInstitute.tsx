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
import { Combobox } from "./Combobox";

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

const frameworks = [
  {
    value: "Andaman and Nicobar Islands",
    label: "Andaman and Nicobar Islands",
  },
  { value: "Andhra Pradesh", label: "Andhra Pradesh" },
  { value: "Arunachal Pradesh", label: "Arunachal Pradesh" },
  { value: "Assam", label: "Assam" },
  { value: "Bihar", label: "Bihar" },
  { value: "Chandigarh", label: "Chandigarh" },
  { value: "Chhattisgarh", label: "Chhattisgarh" },
  {
    value: "Dadra and Nagar Haveli and Daman and Diu",
    label: "Dadra and Nagar Haveli and Daman and Diu",
  },
  { value: "Delhi", label: "Delhi" },
  { value: "Goa", label: "Goa" },
  { value: "Gujarat", label: "Gujarat" },
  { value: "Haryana", label: "Haryana" },
  { value: "Himachal Pradesh", label: "Himachal Pradesh" },
  { value: "Jammu and Kashmir", label: "Jammu and Kashmir" },
  { value: "Jharkhand", label: "Jharkhand" },
  { value: "Karnataka", label: "Karnataka" },
  { value: "Kerala", label: "Kerala" },
  { value: "Ladakh", label: "Ladakh" },
  { value: "Lakshadweep", label: "Lakshadweep" },
  { value: "Madhya Pradesh", label: "Madhya Pradesh" },
  { value: "Maharashtra", label: "Maharashtra" },
  { value: "Manipur", label: "Manipur" },
  { value: "Meghalaya", label: "Meghalaya" },
  { value: "Mizoram", label: "Mizoram" },
  { value: "Nagaland", label: "Nagaland" },
  { value: "Odisha", label: "Odisha" },
  { value: "Puducherry", label: "Puducherry" },
  { value: "Punjab", label: "Punjab" },
  { value: "Rajasthan", label: "Rajasthan" },
  { value: "Sikkim", label: "Sikkim" },
  { value: "Tamil Nadu", label: "Tamil Nadu" },
  { value: "Telangana", label: "Telangana" },
  { value: "Tripura", label: "Tripura" },
  { value: "Uttar Pradesh", label: "Uttar Pradesh" },
  { value: "Uttarakhand", label: "Uttarakhand" },
  { value: "West Bengal", label: "West Bengal" },
];

export const CreateInstitute: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [institute, setInstitute] = useState("");
  const [addressl1, setAddressL1] = useState("");
  const [subdist, setSubdist] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("India");
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [isChecked, setIsChecked] = useState(false); // State for checkbox
  const navigate = useNavigate();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false); // State for confirmation dialog
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [isEnrollmentKeyCopied, setIsEnrollmentKeyCopied] = useState(false);

  const handleFrameworkChange = (selectedValue: string) => {
    console.log("Selected Framework:", selectedValue);
    setState(selectedValue);
  };
  const [domainName, setDomainName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");


  const handleInputChange = (e) => {
    const value = e.target.value;
    setDomainName(value);


    // Validation logic
    if (!value.includes("@")) {
      setErrorMessage("The domain must include '@'.");
    } else {
      setErrorMessage(""); // Clear error if valid
    }
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

  useEffect(() => {
    if (institute) {
      const key =
        institute.slice(0, 3).toUpperCase() +
        Math.random().toString(36).substring(2, 8).toUpperCase();
      setEnrollmentKey(key.slice(0, 10)); // Limit to 10 characters
    }
  }, [institute]);

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
    if (
      !institute ||
      !addressl1 ||
      !subdist ||
      !district ||
      !state ||
      !country
    ) {
      alert("Please fill in all required fields.");
      return;
    }

    if (!isEnrollmentKeyCopied) {
      alert("Please confirm that you have copied the enrollment key.");
      return;
    }

    try {
      const username = user?.username;
      const response = await fetch("http://localhost:3000/create-institute", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          username,
          institute,
          addressl1,
          subdist,
          district,
          state,
          country,
          enrollmentKey,
        }),
      });

      if (response.ok) {
        toast.success("Institute created successfully!", {
          className: "custom-toast",
          autoClose: 2000,
        });
        console.log("hey..123");
        // Log out the user after creating the institute
        setShowConfirmDialog(true);
        // handleLogout();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "Failed to create institute.");
      }
    } catch (err) {
      toast.error("An error occurred. Please try again later.");
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="add-data" />
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
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">
              Create Institute
            </h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">
                  Create Institute
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Create Institute</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="jtitle" className="text-left">
                        Institute Name
                      </Label>
                      <Input
                        id="jtitle"
                        required
                        value={institute}
                        onChange={(e) => setInstitute(e.target.value)}
                        placeholder="Institute Name"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="dept" className="text-left">
                        Address Line 1
                      </Label>
                      <Input
                        id="dept"
                        required
                        value={addressl1}
                        onChange={(e) => setAddressL1(e.target.value)}
                        placeholder="Address Line 1"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="role" className="text-left">
                        Subdistrict
                      </Label>
                      <Input
                        id="role"
                        required
                        value={subdist}
                        onChange={(e) => setSubdist(e.target.value)}
                        placeholder="Subdistrict"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="whatdo" className="text-left">
                        District
                      </Label>
                      <Input
                        id="role"
                        required
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        placeholder="District"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="benefits" className="text-left">
                        State/UT
                      </Label>
                      <MyCombobox />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="benefits" className="text-left">
                        Country
                      </Label>
                      <Input
                        id="role"
                        required
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="Country"
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <label htmlFor="domain" className="text-left">
                        Enter Domain Name
                      </label>
                      <input
                        id="domain"
                        required
                        value={domainName}
                        onChange={handleInputChange}
                        placeholder="@gmail.com"
                        className="col-span-3 border p-2 rounded"
                      />
                    </div>




                    <div className="grid gap-2">
                      <div className="flex items-center pt-2">
                        <Label htmlFor="enrollment_key">Enrollment Key</Label>
                      </div>
                      <Input
                        id="enrollment_key"
                        type="text"
                        name="enrollment_key"
                        value={enrollmentKey}
                        readOnly
                      />
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          id="copy-confirmation"
                          checked={isEnrollmentKeyCopied}
                          onChange={(e) =>
                            setIsEnrollmentKeyCopied(e.target.checked)
                          }
                        />
                        <Label htmlFor="copy-confirmation" className="ml-2">
                          I have copied the enrollment key
                        </Label>
                      </div>
                    </div>
                  </div>
                </ScrollArea>
                <DialogClose>
                  <Button type="submit" onClick={handleSubmit} className="mr-4">
                    Create Institute
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            {/* Alert thing */}
            <Dialog
              open={showConfirmDialog}
              onOpenChange={setShowConfirmDialog}
            >
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Alert </DialogTitle>
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
