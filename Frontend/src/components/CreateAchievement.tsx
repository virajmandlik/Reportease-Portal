import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUser , Command, Home, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Sidebar } from "./Sidebar/Sidebar";
import ModeToggle from "./mode-toggle";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Label } from "@radix-ui/react-label";
import { ScrollArea } from "@/components/ui/scroll-area";
import Cookies from 'js-cookie';
import { toast, ToastContainer } from 'react-toastify'; // Import ToastContainer
import 'react-toastify/dist/ReactToastify.css'; // Import CSS for toast notifications
import { jwtDecode } from 'jwt-decode';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


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


export const CreateAchievement: FC = () => {
  const [user, setUser ] = useState<User | null>(null);
  const [title, setTitle] = useState<string>();
  const [description, setDescription] = useState<string | null>();
  const [date, setDate] = useState<string>(); // Changed to string for date input
  const [issuer, setIssuer] = useState<string | null>();
  const [appNo, setAppNo] = useState<string | null>();
  const [score, setScore] = useState<number | null>();
  const [assoWith, setAssoWith] = useState<string>("");
  const [type, setType] = useState<string>();
  const [file, setFile] = useState<File | null>(null);
  const navigate = useNavigate();


  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }


    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;


      if (decoded.exp < currentTime) {
        alert('Session expired. Please login again.');
        Cookies.remove('token');
        navigate('/login');
        return;
      }


      const userDetails: User = {
        username: decoded.username,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email,
        institute_id: decoded.institute_id,
        type_id: decoded.type_id,
        gender: decoded.gender
      };


      setUser (userDetails);
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }


    try {
      const response = await fetch(`http://localhost:3000/api/create-achievement/${user?.username}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, date, assoWith, issuer, score, appNo, type }),
      });


      if (response.ok) {
        console.log('The achievement is added..!');
        toast.success('Achievement created successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
          onClose: () => navigate(`/admin/create-achievement`),
        });
        setTitle("");
        setDescription("");
        setIssuer(null);
        setScore(null);
        setAppNo(null);
        setType("");
        setAssoWith("");
      } else {
        const errorData = await response.text();
        toast.error(errorData || 'Failed to record achievement.');
      }
    } catch (err) {
      console.log(err);
      toast.error('An error occurred. Please try again later.');
 }
  };


  const handleBulkUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = Cookies.get("token");
    if (!token || !file || !user?.institute_id) {
      toast.error("Please provide all required fields.");
      return;
    }




    const formData = new FormData();
    formData.append("file", file);
    formData.append("institute_id", user.institute_id);




    try {
      const response = await fetch(
        `http://localhost:3000/api/achievement/bulk-achievement`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        }
      );




      if (response.ok) {
        toast.success("Bulk achievements uploaded successfully!", {
          className: "custom-toast",
          autoClose: 1000,
        });
        setFile(null); // Clear the file input after successful upload
      } else {
        const errorData = await response.text();
        toast.error(errorData || "Failed to upload bulk achievements.");
      }
    } catch (err) {
      console.log(err);
      toast.error("An error occurred. Please try again later.");
    }
  };




  const downloadTemplate = () => {
    const token = Cookies.get("token");
    if (!token) {
      navigate("/login");
      return;
    }




    // Trigger the download
    window.open(
      "http://localhost:3000/api/achievement/download-template",
      "_blank"
    );
  };




  const downloadData = () => {
    if (!user?.institute_id) {
      alert("Please enter an Institute ID.");
      return;
    }




    // Construct the URL with the institute_id as a query parameter
    const url = `http://localhost:3000/api/achievement/download-achievements?institute_id=${user?.institute_id}`;




    // Open the URL in a new tab to trigger the download
    window.open(url, "_blank");
  };




  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="create-achievement" />
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 sticky top-0">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
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
                  <img src={user.photoURL} alt="User  Avatar" className="h-9 w-9 rounded-full" />
                ) : (
                  <CircleUser  className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>{user?.username || "My Account"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/profile")}>Profile Settings</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-primary font-bold">Achievements</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">Add Achievement</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Add Achievement</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410 px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-left">Achievement To</Label>
                      <Select name="type" onValueChange={(value) => setType(value)}>
                        <SelectTrigger className="w-[475px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Type</SelectLabel>
                            <SelectItem value="Honor and Award">Honor and Award</SelectItem>
                            <SelectItem value="Patent">Patent</SelectItem>
                            <SelectItem value="Test Score">Test Score</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>


                    {type === 'Honor and Award' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="htitle" className="text-left">Title</Label>
                          <Input id="htitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="issuer" className="text-left">Issuer</Label>
                          <Input id="issuer" type="text" required value={issuer} onChange={(e) => setIssuer(e.target.value)} placeholder="Issuer" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="idate" className="text-left">Issue Date</Label>
                          <Input id="idate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="hassowith" className="text-left">Associated with</Label>
                          <Input id="hassowith" type="text" required value={assoWith} onChange={(e) => setAssoWith(e.target.value)} placeholder="Associated with" className="col-span-3" />
                        </div>
                      </>
                    )}
                    {type === 'Patent' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="ptitle" className="text-left">Patent Title</Label>
                          <Input id="ptitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Patent Title" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="appno" className="text-left">Application Number</Label>
                          <Input id="appno" type="text" required value={appNo} onChange={(e) => setAppNo(e.target.value)} placeholder="Application Number" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="pdate" className="text-left">Issue/Filing Date</Label>
                          <Input id="pdate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="passowith" className="text-left">Associated with</Label>
                          <Input id="passowith" type="text" required value={assoWith} onChange={(e) => setAssoWith(e.target.value)} placeholder="Associated with" className="col-span-3" />
                        </div>
                      </>
                    )}
                    {type === 'Other' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="otitle" className="text-left">Title</Label>
                          <Input id="otitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="col-span-3" />
                        </div>
                       
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="odate" className="text-left">Date</Label>
                          <Input id="odate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="oassowith" className="text-left">Associated with</Label>
                          <Input id="oassowith" type="text" required value={assoWith} onChange={(e) => setAssoWith(e.target.value)} placeholder="Associated with" className="col-span-3" />
                        </div>
                      </>
                    )}
                    {type === 'Test Score' && (
                      <>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="ttitle" className="text-left">Title</Label>
                          <Input id="ttitle" type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="score" className="text-left">Score</Label>
                          <Input id="score" type="number" required min="1" max="1000" value={score} onChange={(e) => setScore(Number(e.target.value))} placeholder="Score" className="col-span-3" />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                          <Label htmlFor="tdate" className="text-left">Test Date</Label>
                          <Input id="tdate" type="date" required value={date} onChange={(e) => setDate(e.target.value)} className="col-span-3" />
                        </div>
                      </>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="desc" className="text-left">Description</Label>
                      <Textarea id="desc" required value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" className="col-span-3" />
                    </div>
                  </div>
                </ScrollArea>
                <DialogClose>
                  <Button type="submit" onClick={handleSubmit} className="mr-4">Add Achievement</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
              {/* Bulk Achievement Dialog */}
              <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">
                  Bulk Achievement
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Upload Bulk Achievements</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Label htmlFor="file-upload" className="text-left">
                    Upload Excel File{" "}
                  </Label>
                  <Input
                    id="file-upload"
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={(e) =>
                      setFile(e.target.files ? e.target.files[0] : null)
                    }
                    className="col-span-3"
                  />
                  <Button
                    type="submit"
                    onClick={handleBulkUpload}
                    className="mr-4"
                  >
                    Upload Achievements
                  </Button>
                  <Button variant="outline" onClick={downloadData}>
                    Download Data
                  </Button>
                  <Button variant="outline" onClick={downloadTemplate}>
                    Download Template
                  </Button>
                </div>
                <DialogClose></DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};




