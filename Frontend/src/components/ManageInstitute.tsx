import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import {
  CircleUser,
  Home,
  Menu,
  Package2,
  Search,
  Command,
  User,
  Landmark,
} from "lucide-react";
import { jwtDecode } from "jwt-decode";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import ModeToggle from "./mode-toggle";
import { Sidebar } from "./SideBar/Sidebar";
import Cookies from "js-cookie";
import { Combobox } from "./Combobox";
import Institute from '../components/icons/institute.png'




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




interface Institute {
  institute: string | null;
  addressl1: string | null;
  subdist: string | null;
  district: string | null;
  state: string | null;
  country: string | null;
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




export const ManageInstitute: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [institute, setInstitute] = useState("");
  const [addressl1, setAddressL1] = useState("");
  const [subdist, setSubdist] = useState("");
  const [district, setDistrict] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("");
  const [loading, setLoading] = useState<boolean>(false);
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();




  const handleFrameworkChange = (selectedValue: string) => {
    console.log("Selected Framework:", selectedValue);
    setState(selectedValue);
  };




  const MyCombobox = () => {
    useEffect(() => {
      const fetchState = async () => {
        try {
          if (state) {
            const matchedFramework = frameworks.find(
              (item) => item.value === state
            );
            if (matchedFramework) {
              setValue(matchedFramework.value); // Set initial value if valid
            } else {
              console.warn(
                "State received from backend does not match frameworks."
              );
            }
          }
        } catch (error) {
          console.error("Error fetching state from backend:", error);
        }
      };




      fetchState();
    }, []);




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
        is_active: decoded.is_active,
        photoURL: decoded.photoURL, // If you have this in the token
      };




      setUser(userDetails);
    } catch (err) {
      navigate("/login");
    }
  }, [navigate]);




  useEffect(() => {
    const fetchInstitute = async () => {
      if (!user?.username) return;




      try {
        console.log("Fetching for user:", user.username);
        const response = await fetch(
          `http://localhost:3000/api/get-institute/${user.username}`,
          {
            method: "GET",
          }
        );
        const data = await response.json();
        console.log("Fetched data:", data);
        setInstitute(data.name);
        setAddressL1(data.addressl1);
        setSubdist(data.subdist);
        setDistrict(data.district);
        setState(data.state);
        setCountry(data.country);
        // Handle the fetched data if needed
      } catch (error) {
        console.error("Error fetching institute data:", error);
      }
    };




    fetchInstitute();
  }, [user]);




  // Update institute details
  const handleSaveChanges = async () => {
    try {
      const instituteDetails: Institute = {
        institute: institute,
        addressl1: addressl1,
        subdist: subdist,
        district: district,
        state: state,
        country: country,
      };
      const response = await fetch(
        `http://localhost:3000/api/set-institute/${user?.username}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(instituteDetails),
        }
      );




      if (response.ok) {
        alert("Institute details updated successfully!");
      } else {
        console.error("Failed to save changes");
      }
    } catch (error) {
      console.error("Error updating institute data", error);
    }
  };




  if (loading) {
    return <div>Loading...</div>;
  }




  const handleLogout = async () => {
    setUser(null);
    navigate("/login");
  };




  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="manage-institute" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0 z-10 bg-opacity-100 opacity-100">
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
          <div className="">
            <ModeToggle />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="secondary" size="icon" className="rounded-full">
                {user?.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt="User Avatar"
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
              <DropdownMenuItem
                onClick={() => {
                  navigate("/profile");
                }}
              >
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuItem>Support</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 m-4 overflow-auto">
          <div className="space-y-0.5">
            <div className="">
              <div className="flex flex-row gap-2">
                <div className="h-10 w-10">
              <img src={Institute} alt="Institute" />
              </div>
              <h2 className="text-2xl font-bold tracking-tight pt-2 text-sidebar">
                Manage Institute
              </h2>
              </div>
              <p className="text-muted-foreground pb-6">
                Edit your institute information here
              </p>
              <Separator />
            </div>
            <h2 className="text-xl font-medium p-2 font-extrabold text-lighter">Institute Details</h2>
            <Separator className="shrink-0 bg-border h-[1px] my-2 w-1/2" />




            <div className="mt-4">
              <Label
                htmlFor="instname"
                className="block text-sm font-medium leading-6 text-lighter dark:text-lighter pt-2"
              >
                Institute Name
              </Label>
              <div className="mt-2">
                <Input
                  type="string"
                  name="instname"
                  placeholder="Institute Name"
                  id="instname"
                  disabled
                  value={institute || ""}
                  onChange={(e) => setInstitute(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-neutral-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>
            <p className="text-sm text-muted-foreground pb-3">
              Please contact system administrator if you need to change
              institute name.
            </p>




            <div className="mt-4">
              <Label
                htmlFor="addrl1"
                className="block text-sm font-medium leading-6 text-lighter dark:text-lighter"
              >
                Address Line 1
              </Label>
              <div className="mt-2 pb-4">
                <Input
                  type="string"
                  name="addrl1"
                  placeholder="Address Line 1"
                  id="addrl1"
                  value={addressl1 || ""}
                  onChange={(e) => setAddressL1(e.target.value)}
                  className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-neutral-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                />
              </div>
            </div>




            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 sm:col-span-3 mr-3">
                <Label
                  htmlFor="subdist"
                  className="block text-sm font-medium leading-6 text-lighter dark:text-lighter"
                >
                  Sub-district
                </Label>
                <div className="mt-2 pb-4">
                  <Input
                    type="text"
                    name="subdist"
                    placeholder="Sub-district"
                    id="subdist"
                    value={subdist}
                    onChange={(e) => setSubdist(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-neutral-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>




              <div className="flex-1 sm:col-span-3">
                <Label
                  htmlFor="district"
                  className="block text-sm font-medium leading-6 text-lighter dark:text-lighter"
                >
                  District
                </Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    name="district"
                    placeholder="District"
                    id="district"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-neutral-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>




            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 sm:col-span-3 mr-3">
                <Label
                  htmlFor="state"
                  className="block text-sm font-medium leading-6 text-lighter dark:text-lighter"
                >
                  State
                </Label>
                <div className="mt-2 pb-3">
                  <MyCombobox />
                </div>
              </div>




              <div className="flex-1 sm:col-span-3">
                <Label
                  htmlFor="country"
                  className="block text-sm font-medium leading-6 text-lighter dark:text-lighter"
                >
                  Country
                </Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    name="country"
                    placeholder="Country"
                    id="country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="block w-full rounded-md border-0 py-1.5 text-gray-900 dark:text-neutral-200 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                  />
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 mt-4">
              <div className="flex-1 sm:col-span-3 w-1/2">
                <div className="mt-2">
                  <Button onClick={handleSaveChanges} className="w-1/2">
                    Save Changes
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};














