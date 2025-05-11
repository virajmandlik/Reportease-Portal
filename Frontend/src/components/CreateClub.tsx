import { FC, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { CircleUser , Command, Home, Menu, Package2, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
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
import { Combobox } from "./Combobox";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue, } from "@/components/ui/select";
import { ClubCard } from "./ClubCard";


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


interface ClubCardProps {
  club_id: number;
  club_name: string;
  club_type: string;
  email_id: string;
}


export const CreateClub: FC = () => {
  const [user, setUser ] = useState<User | null>(null);
  const [clubName, setClubName] = useState("");
  const [clubType, setClubType] = useState("");
  const [coord, setCoord] = useState("");
  const [value, setValue] = useState("");
  const [open, setOpen] = useState(false);
  const [faculties, setFaculties] = useState<string[]>([]);
  const [clubs, setClubs] = useState<ClubCardProps[]>([]);
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


    const loadDepartments = async () => {
      const deptData = await fetchFaculties();
      setFaculties(deptData);
    };


    loadDepartments();
  }, [navigate]);


  const frameworks = faculties.map((faculty) => ({
    value: faculty,
    label: faculty,
  }));


  const handleFrameworkChange = (selectedValue: string) => {
    console.log("Selected:", selectedValue);
    setCoord(selectedValue);
  };


  useEffect(() => {
    const fetchClubs = async () => {
      try {
        console.log(user?.institute_id);
        if(!user?.institute_id)
          return;
        const response = await fetch(`http://localhost:3000/api/clubs/${user?.institute_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const programsData = await response.json();
        console.log(programsData);
        setClubs(programsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setClubs([]);
      }
    };


    // Initial fetch
    fetchClubs();


    // Polling interval for continuous updating
    // const interval = setInterval(fetchDepartments, 30000);


    // return () => clearInterval(interval); // Cleanup on unmount
  }, [user?.institute_id]);


  const handleUpdateClub = async (updatedData: any) => {
    console.log(updatedData);
    try {
      const club_head_email = updatedData.club_head;
      const club_type = updatedData.club_type
      const club_name = updatedData.club_name;
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/update-club/${updatedData.club_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({club_name, club_type, club_head_email}),
      });
 
      if (response.ok) {
        toast.success('Department updated successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });


      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update department.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the department.');
    }
  };  


  const handleDeleteClub = async (data) => {
    try {
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/delete-club/${data.club_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
 
      if (response.ok) {
        toast.success('Club deleted successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });


      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete club.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while deleting the club.');
    }
  };


  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        console.log('the user institute id is ', user?.institute_id);
        const response = await fetch(`http://localhost:3000/api/clubNames/${user?.institute_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format');
        }


        console.log('after sending the response is ', data);
        const formattedFaculties = data.map(faculty =>
          `${faculty.first_name} ${faculty.last_name}`
        );


        setFaculties(formattedFaculties);
        console.log(formattedFaculties);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setFaculties([]);
      }
    };


    if (user?.institute_id) {
      fetchDepartments();
    }
  }, [user?.institute_id]);


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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();


    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }


    try {
      // Split coord into firstName and lastName
      const nameParts = coord.trim().split(/\s+/); // Split by whitespace
      const firstName = nameParts[0]; // First part as firstName
      const lastName = nameParts.slice(1).join(" "); // Remaining parts as lastName


      const response = await fetch(`http://localhost:3000/api/create-club/${user?.institute_id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          clubName,
          clubType,
          firstName,
          lastName,
        }),
      });


      if (response.ok) {
        toast.success('Club created successfully!', {
          className: 'custom-toast',
          autoClose: 2000,
          onClose: () => navigate(`/admin/create-club`),
        });
        setClubType("");
        setCoord("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create club.');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again later.');
    }
  };


  const [clubFile, setClubFile] = useState<File | null>(null);




  const handleClubFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setClubFile(e.target.files[0]);
    }
  };




  const handleClubUpload = async () => {
    if (!clubFile) return;




    const formData = new FormData();
    formData.append("file", clubFile);
    formData.append("institute_id", user?.institute_id);




    try {
      const res = await fetch(`http://localhost:3000/api/club/upload-clubs`, {
        method: "POST",
        body: formData,
      });




      if (!res.ok) throw new Error("Upload failed");




      toast.success("Clubs uploaded successfully!");
      setClubFile(null); // Reset file after successful upload
    } catch (err) {
      console.error("Upload error:", err);
      toast.error(err.message);
    }
  };




  const handleClubTemplateDownload = () => {
    fetch(`http://localhost:3000/api/club/download-template`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to download template");
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "club_template.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Template download error:", err));
  };




  const handleClubDataDownload = () => {
    fetch(
      `http://localhost:3000/api/club/download-data?institute_id=${user?.institute_id}`
    )
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
        a.download = "Club_Data.xlsx";
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error("Download error:", err));
  };






  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="create-club" />
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
                  <Command className="absolute flex-shrink-0 size-3 text -gray-400 dark:text-white/60" />
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
            <h1 className="text-2xl text-primary font-bold">Create Club</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">Create Club</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Create Club</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="clubname" className="text-left">Club Name</Label>
                      <Input id="clubname" type="string" required value={clubName} onChange={(e) => setClubName(e.target.value)} placeholder="Club Name" className="col-span-3" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-left">Club Type</Label>
                      <Select name="type" onValueChange={(value) => setClubType((value))}>
                        <SelectTrigger className="w-[475px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Club Type</SelectLabel>
                            <SelectItem value="Technical">Technical</SelectItem>
                            <SelectItem value="Cultural">Cultural</SelectItem>
                            <SelectItem value="Academic">Academic</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="coord" className="text-left">Co-ordinator</Label>
                      <MyCombobox />
                    </div>
                  </div>
                </ScrollArea>
                <DialogClose>
                  <Button type="submit" onClick={handleSubmit} className="mr-4">Create Club</Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">
                  Create Multiple Clubs
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Bulk Club Creation</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="clubFile" className="text-left">
                      Upload CSV
                    </Label>
                    <Input
                      id="clubFile"
                      type="file"
                      accept=".csv"
                      onChange={handleClubFileChange}
                      className="col-span-3"
                    />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      onClick={handleClubUpload}
                      className="mt-4"
                      disabled={!clubFile}
                    >
                      Upload Clubs
                    </Button>
                    <Button
                      onClick={handleClubTemplateDownload}
                      className="mt-4 ml-2"
                    >
                      Download Template
                    </Button>
                    <Button
                      onClick={handleClubDataDownload}
                      className="mt-4 ml-2"
                    >
                      Download Club Data
                    </Button>
                  </div>
                </div>
                <DialogClose>
                  <Button type="button" className="mr-4">
                    Close
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pl-3 grid gap-x-10 gap-y-4 grid-cols-2 md:grid-cols-3 md:gap-y-4 md:gap-x-16 lg:grid-cols-3 lg:gap-x-32 lg:gap-y-4">
            {clubs.map((club) => (
              <ClubCard
              club_id={club.club_id}
              club_name={club.club_name}
              club_head={club.email_id}
              club_type={club.club_type}
              onUpdate={handleUpdateClub}
              onDelete={handleDeleteClub}
              faculties={faculties}
              />
            ))}
          </div>
        </main>
        <ToastContainer />
      </div>
    </div>
  );
};


