import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CircleUser,
  Command,
  Home,
  Menu,
  Package2,
  Search,
  UploadCloud,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './SideBar/Sidebar';
import ModeToggle from './mode-toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Label } from '@radix-ui/react-label';
import { ScrollArea } from '@/components/ui/scroll-area';
import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import { jwtDecode } from 'jwt-decode';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventCard } from './EventCard';


// Comprehensive Interfaces
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
  dept_id: number;
  dept_name: string;
}


interface Club {
  club_id: number;
  club_name: string;
}


// Event Type Enum for Strict Typing
enum EventTypeEnum {
  Technical = 'Technical',
  Cultural = 'Cultural',
  InstituteLevel = 'Institute-level',
  Other = 'Other'
}


// Host Type Enum
enum HostTypeEnum {
  Department = 'Department',
  Club = 'Club'
}


interface EventCardProps {
  event_id: number;
  event_name: string;
  event_description: string;
  event_type: string;
  event_date: string;
  dept_id: number;
}


export const CreateEvent: FC = () => {
  // State Management with Improved Typing
  const [user, setUser] = useState<User | null>(null);
  const [eventName, setEventName] = useState<string>('');
  const [eventDesc, setEventDesc] = useState<string>('');
  const [eventType, setEventType] = useState<EventTypeEnum | ''>('');
  const [eventDate, setEventDate] = useState<string>('');
  const [host, setHost] = useState<HostTypeEnum | ''>('');
  const [departments, setDepartments] = useState<Department[]>([]);
  const [clubs, setClubs] = useState<Club[]>([]);
  const [selectedDepartment, setSelectedDepartment] = useState<string>('');
  const [selectedClub, setSelectedClub] = useState<string>('');
  const [uploadType, setUploadType] = useState<'single' | 'bulk'>('single');
  const [file, setFile] = useState<File | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [events, setEvents] = useState<EventCardProps[]>([]);
  const navigate = useNavigate();


  // Comprehensive Data Fetching
  useEffect(() => {
    const fetchDepartmentsAndClubs = async () => {
      if (!user?.institute_id) return;


      try {
        // Fetch Departments
        const departmentResponse = await fetch(
          `http://localhost:3000/api/departmentNames/${user.institute_id}`
        );
        const departmentData: Department[] = await departmentResponse.json();
       
        // Ensure departments have valid structure
        const validDepartments = departmentData.map((dept, index) => ({
          dept_id: dept.dept_id || index + 1,
          dept_name: dept.dept_name
        }));


        setDepartments(validDepartments);


        // Fetch Clubs
        const clubResponse = await fetch(
          `http://localhost:3000/api/clubNamesOfInstitute/${user.institute_id}`
        );
        const clubData: Club[] = await clubResponse.json();
        setClubs(clubData);
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to fetch departments and clubs');
      }
    };


    fetchDepartmentsAndClubs();
  }, [user?.institute_id]);


  // User Authentication
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
        toast.error('Session expired. Please login again.');
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
        gender: decoded.gender,
        is_active: true,
        photoURL: null,
      };


      setUser(userDetails);
    } catch (err) {
      navigate('/login');
    }
  }, [navigate]);


  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log(user?.institute_id);
        if(!user?.institute_id)
          return;
        const response = await fetch(`http://localhost:3000/api/events/${user?.institute_id}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const eventsData = await response.json();
        console.log(eventsData);
        setEvents(eventsData);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setEvents([]);
      }
    };


    fetchEvents();


    // Polling interval for continuous updating
    // const interval = setInterval(fetchDepartments, 30000);


    // return () => clearInterval(interval); // Cleanup on unmount
  }, [user?.institute_id]); // Re-run if user or institute_id changes


  const handleUpdateEvent = async (updatedData) => {
    try {
      console.log(updatedData);
      const event_id = updatedData.event_id;
      const event_name = updatedData.event_name;
      const event_description = updatedData.event_description;
      const event_type = updatedData.event_type;
      const event_date = updatedData.event_date;
      console.log("SentData:", event_id, event_name, event_description, event_type, event_date);
      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/update-event/${event_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({event_name, event_description, event_type, event_date}),
      });
 
      if (response.ok) {
        toast.success('Event updated successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });


      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update event.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while updating the event.');
    }
  };  


  const handleDeleteEvent = async (data) => {
    try {
      const event_id = data.event_id;


      const token = Cookies.get('token');
      const response = await fetch(`http://localhost:3000/api/delete-event/${event_id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        }
      });
 
      if (response.ok) {
        toast.success('Event deleted successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
        });


      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to delete Event.');
      }
    } catch (error) {
      console.error(error)
      toast.error('An error occurred while deleting the Event.');
    }
  };  


  // Event Submission Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
 
    // Validation
    if (!eventName || !eventDesc || !eventType || !eventDate || !host) {
      toast.error('Please fill in all required fields');
      return;
    }
 
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }
 
    try {
      const submitData: any = {
        eventName,
        eventDescription: eventDesc,
        eventType,
        eventDate: new Date(eventDate).toISOString(),
        year: new Date(eventDate).getFullYear(),
      };
 
      // Handle Department or Club selection
      if (host === HostTypeEnum.Department) {
        if (!selectedDepartment) {
          toast.error('Please select a department');
          return;
        }
        submitData.deptId = selectedDepartment;
      } else if (host === HostTypeEnum.Club) {
        if (!selectedClub) {
          toast.error('Please select a club');
          return;
        }
        submitData.clubId = selectedClub;
      }
 
      const response = await fetch(
        `http://localhost:3000/api/create-event/${user?.institute_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(submitData),
        }
      );


      if (response.ok) {
        toast.success('Event created successfully!', {
          onClose: () => navigate(`/dashboard/${user?.username}`),
        });
        resetForm();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to create event');
      }
    } catch (err) {
      toast.error('An error occurred. Please try again later.');
    }
  };


  // Reset Form
  const resetForm = () => {
    setEventName('');
    setEventDesc('');
    setEventType('');
    setEventDate('');
    setHost('');
    setSelectedDepartment('');
    setSelectedClub('');
    setFile(null);
    setErrorMessage(null);
  };


  // File Upload Handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;


    const allowedExtension = '.xlsx';
    const maxSize = 5 * 1024 * 1024; // 5 MB


    if (!uploadedFile.name.endsWith(allowedExtension)) {
      setErrorMessage('Invalid file type. Please upload an .xlsx file.');
      return;
    }
    if (uploadedFile.size > maxSize) {
      setErrorMessage('File size exceeds 5 MB.');
      return;
    }
    setFile(uploadedFile);
    setErrorMessage(null);
  };


  const handleUpload = async () => {
    if (!file) return;


    const formData = new FormData();
    formData.append('file', file);


    try {
      const res = await fetch(
        `http://localhost:3000/api/events/upload-data/${user?.institute_id}`,
        {
          method: 'POST',
          body: formData,
        }
      );


      if (!res.ok) throw new Error('Upload failed');


      toast.success('Events uploaded successfully!');
      setFile(null); // Reset file after successful upload
    } catch (err) {
      console.error('Upload error:', err);
      toast.error(err.message);
    }
  };


  const handleDownload = () => {
    fetch(`http://localhost:3000/api/events/download-data`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const customFileName = 'Event_Data.xlsx';
        const a = document.createElement('a');
        a.href = url;
        a.download = customFileName;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => console.error('Download error:', err));
  };


  const handleTemplateDownload = () => {
    fetch(`http://localhost:3000/api/events/download-template`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to download template');
        return res.blob();
      })
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'event_template.xlsx';
        document.body.appendChild(a);
        a.click();
        a.remove();
      })
      .catch((err) => console.error('Template download error:', err));
  };


  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="create-event" />
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
                <Link to="/" className="flex items-center gap-2 text-lg font-semibold">
                  <Package2 className="h-6 w-6" />
                  <span className="sr-only">Acme Inc</span>
                </Link>
                <Link to="/" className="mx-[-0.65rem] flex items-center gap-4 rounded-xl px-3 py-2 text-muted-foreground hover:text-foreground">
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
                < Input
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
                  <CircleUser  className="h-5 w-5" />
                )}
                <span className="sr-only">Toggle user menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>
                {user?.username || 'My Account'}
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Profile Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Logout</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          <div className="flex items-center">
            <h1 className="text-2xl text-sidebar font-bold">Create Event</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2 hover:border-sidebar">
                  Manage Event Data
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]" aria-describedby="event-creation-dialog">
                <DialogHeader>
                  <DialogTitle id="event-creation-dialog">Manage Event Data</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="eventname" className="text-left">
                        Event Name
                      </Label>
                      <Input
                        id="eventname"
                        type="text"
                        required
                        value={eventName}
                        onChange={(e) => setEventName(e.target.value)}
                        placeholder="Event Name"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="description" className="text-left">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        required
                        value={eventDesc}
                        onChange={(e) => setEventDesc(e.target.value)}
                        placeholder="Description"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-left">
                        Event Type
                      </Label>
                      <Select
                        name="type"
                        onValueChange={(value) => setEventType(value as EventTypeEnum)}
                      >
                        <SelectTrigger className="w-[475px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Event Type</SelectLabel>
                            <SelectItem value={EventTypeEnum.Technical}>Technical</SelectItem>
                            <SelectItem value={EventTypeEnum.Cultural}>Cultural</SelectItem>
                            <SelectItem value={ EventTypeEnum.InstituteLevel}>Institute-level</SelectItem>
                            <SelectItem value={EventTypeEnum.Other}>Other</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="host" className="text-left">
                        Host
                      </Label>
                      <Select
                        name="host"
                        value={host}
                        onValueChange={(value) => {
                          setHost(value as HostTypeEnum);
                          setSelectedDepartment('');
                          setSelectedClub('');
                        }}
                      >
                        <SelectTrigger className="w-[475px]">
                          <SelectValue placeholder="Select Host" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Hosted by</SelectLabel>
                            <SelectItem value={HostTypeEnum.Department}>Department</SelectItem>
                            <SelectItem value={HostTypeEnum.Club}>Club</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>


                    {/* Conditional rendering for department selection */}
                    {host === HostTypeEnum.Department && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="department" className="text-left">
                          Select Department
                        </Label>
                        <Select
                          name="department"
                          value={selectedDepartment}
                          onValueChange={(value) => setSelectedDepartment(value)}
                        >
                          <SelectTrigger className="w-[475px]">
                            <SelectValue placeholder="Select Department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Departments</SelectLabel>
                              {departments.map((dept) => (
                                <SelectItem key={dept.dept_id} value={dept.dept_id.toString()}>
                                  {dept.dept_name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}


                    {/* Conditional rendering for club selection */}
                    {host === HostTypeEnum.Club && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="club" className="text-left">
                          Select Club
                        </Label>
                        <Select
                          name="club"
                          value={selectedClub}
                          onValueChange={(value) => setSelectedClub(value)}
                        >
                          <SelectTrigger className="w-[475px]">
                            <SelectValue placeholder="Select Club" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Available Clubs</SelectLabel>
                              {clubs.map((club) => (
                                <SelectItem key={club.club_id} value={club.club_id.toString()}>
                                  {club.club_name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}


                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="edate" className="text-left">
                        Date
                      </Label>
                      <Input
                        id="edate"
                        type="date"
                        required
                        value={eventDate}
                        onChange={(e) => setEventDate(e.target.value)}
                        className="col-span-3"
                      />
                    </div>
                    <div className="flex justify-between">
                      <Button
                        onClick={() =>
                          setUploadType(uploadType === 'single' ? 'bulk' : 'single')
                        }
                      >
                        Switch to {uploadType === 'single' ? 'Bulk' : 'Single'} Upload
                      </Button>
                    </div>
                    {uploadType === 'bulk' && (
                      <div>
                        <h3 className="text-lg font-semibold">Bulk Upload</h3>
                        <label htmlFor="file" className="block text-sm font-medium text-gray-600">
                          Upload File
                        </label>
                        <Input
                          id="file"
                          type="file"
                          onChange={handleFileChange}
                          className="mt-2 w-full"
                        />
                        {errorMessage && <div className="text-red-500">{errorMessage}</div>}
                        <Button
                          disabled={!file}
                          onClick={handleUpload}
                          className={`mt-4 flex items-center gap-2 px-4 py-2 rounded-md ${
                            file ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          }`}
                        >
                          <UploadCloud size={16} /> Upload
                        </Button>
                        <div className="
                          flex-wrap justify-end gap-3 mt-4">
                          <Button
                            onClick={handleDownload}
                            aria-label="Download event data"
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700"
                          >
                            Download Data
                          </Button>
                          <Button
                            onClick={handleTemplateDownload}
                            aria-label="Download sample event template"
                            className="flex items-center gap-2 px-4 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700"
                          >
                            <FileText size={16} /> Download Template
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
                <DialogClose>
                  <Button type="submit" onClick={handleSubmit} className="mr-4">
                    Create Event
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
          <div className="pl-3 grid gap-x-5 gap-y-4 grid-cols-2 md:grid-cols-3 md:gap-y-4 md:gap-x-16 lg:grid-cols-3 lg:gap-x-12 lg:gap-y-12">
              {events.map(event => (
                  <EventCard
                    event_id={event.event_id}
                    event_name={event.event_name}
                    event_description={event.event_description}
                    event_type={event.event_type}
                    event_date={event.event_date}
                    dept_id={event.dept_id}
                    onUpdate={handleUpdateEvent}
                    onDelete={handleDeleteEvent}
                    />
              ))}
          </div>
        </main>
      </div>
    </div>
  );
};




