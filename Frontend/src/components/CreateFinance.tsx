import { FC, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CircleUser,
  Command,
  Home,
  Menu,
  Package2,
  Search,
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
import { Sidebar } from './Sidebar/Sidebar';
import ModeToggle from './mode-toggle';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
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

export const CreateFinance: FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [finType, setFinType] = useState<string>('');
  const [finTo, setFinTo] = useState<string>('');
  const [finDesc, setFinDesc] = useState<string>();
  const [amount, setAmount] = useState<number>();
  const [departments, setDepartments] = useState<string[]>([]);
  const [infrastructure, setInfrastructure] = useState<string[]>([]);
  const [events, setEvents] = useState<string[]>([]);
  const navigate = useNavigate();
  const [year, setYear] = useState<number | string>(''); // Initialize with an empty string to allow placeholder

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/departmentNames/${user?.institute_id}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format');
        }
        setDepartments(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setDepartments([]);
      }
    };

    if (user?.institute_id) {
      fetchDepartments();
    }
  }, [user?.institute_id]);

  useEffect(() => {
    const fetchInfrastructure = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/infrastructureNames/${user?.institute_id}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format');
        }
        setInfrastructure(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setInfrastructure([]);
      }
    };

    if (user?.institute_id) {
      fetchInfrastructure();
    }
  }, [user?.institute_id]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/eventNames/${user?.institute_id}`
        );
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        if (!Array.isArray(data)) {
          throw new Error('Unexpected data format');
        }
        setEvents(data);
      } catch (error) {
        console.error('Error fetching departments:', error);
        setEvents([]);
      }
    };

    if (user?.institute_id) {
      fetchEvents();
    }
  }, [user?.institute_id]);

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
        gender: decoded.gender,
      };

      setUser(userDetails);
    } catch (err) {
      navigate('/login');
    }

    // const loadDepartments = async () => {
    //   const deptData = await fetchDepartments();
    //   setDepartments(deptData);
    // };

    // loadDepartments();
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Log the values being sent
    console.log({
      finType,
      finTo,
      finDesc,
      amount,
      year,
      institute_id: user?.institute_id,
    });

    try {
      const response = await fetch(
        `http://localhost:3000/api/create-finance/${user?.institute_id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ finType, finTo, finDesc, amount, year }),
        }
      );

      // Log the response status and text
      console.log('Response Status:', response.status);
      const responseText = await response.text();
      console.log('Response Text:', responseText);

      if (response.ok) {
        alert('Finance recorded successfully!');
        toast.success('Finance recorded successfully!', {
          className: 'custom-toast',
          autoClose: 1000,
          onClose: () => navigate(`/add-finance`),
        });
        setAmount(0);
        setFinDesc('');
        setFinTo('');
        setFinType('');
        setYear('');
      } else {
        // Attempt to parse the response as JSON
        try {
          const errorData = JSON.parse(responseText);
          toast.error(errorData.message || 'Failed to record finance.', {
            className: 'custom-toast',
            autoClose: 1000,});
        } catch (parseError) {
          toast.error(
            'Failed to record finance.' ,{
              className: 'custom-toast',
              autoClose: 1000,
            }
          );
        }
      }
    } catch (err) {
      console.log('the error is ', err);
      toast.error('An error occurred. Please try again later.', {
        className: 'custom-toast',
        autoClose: 1000,});
    }
  };

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr]">
      <Sidebar user={user} activePage="add-finance" />
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
            <h1 className="text-2xl text-primary font-bold">Finance</h1>
          </div>
          <div className="flex flex-col items-center justify-center">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" className="mb-4 border-2">
                  Add Finance
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[725px]">
                <DialogHeader>
                  <DialogTitle>Add Finance</DialogTitle>
                </DialogHeader>
                <ScrollArea className="max-h-[410px] p-4">
                  <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="type" className="text-left">
                        Finance To
                      </Label>
                      <Select
                        name="type"
                        onValueChange={(value) => setFinType(value)}
                      >
                        <SelectTrigger className="w-[475px]">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectGroup>
                            <SelectLabel>Type</SelectLabel>
                            <SelectItem value="Club">Club</SelectItem>
                            <SelectItem value="Department">
                              Department
                            </SelectItem>
                            <SelectItem value="Events">Event</SelectItem>
                            <SelectItem value="Infrastructure">
                              Infrastructure
                            </SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    </div>

                    {finType === 'Department' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept" className="text-left">
                          Department
                        </Label>
                        <Select
                          name="dept"
                          value={finTo}
                          onValueChange={(value) => setFinTo(value)}
                        >
                          <SelectTrigger className="w-[475px]">
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Department</SelectLabel>
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
                    )}
                    {finType === 'Infrastructure' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept" className="text-left">
                          Infrastructure
                        </Label>
                        <Select
                          name="dept"
                          value={finTo}
                          onValueChange={(value) => setFinTo(value)}
                        >
                          <SelectTrigger className="w-[475px]">
                            <SelectValue placeholder="Select record" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Infrastructure Record</SelectLabel>
                              {infrastructure.map((infra) => (
                                <SelectItem
                                  key={infra.description}
                                  value={infra.description}
                                >
                                  {infra.description}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}

                    {finType === 'Events' && (
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="dept" className="text-left">
                          Event
                        </Label>
                        <Select
                          name="dept"
                          value={finTo}
                          onValueChange={(value) => setFinTo(value)}
                        >
                          <SelectTrigger className="w-[475px]">
                            <SelectValue placeholder="Select event" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>Event</SelectLabel>
                              {events.map((event) => (
                                <SelectItem
                                  key={event.event_name}
                                  value={event.event_name}
                                >
                                  {event.event_name}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="amount" className="text-left">
                        Amount
                      </Label>
                      <Input
                        id="amount"
                        type="number"
                        required
                        min="1"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="Amount"
                        className="col-span-3"
                      />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="infradesc" className="text-left">
                        Description
                      </Label>
                      <Textarea
                        id="infradesc"
                        required
                        value={finDesc}
                        onChange={(e) => setFinDesc(e.target.value)}
                        placeholder="Description"
                        className="col-span-3"
                      />
                    </div>

                    <div className="grid grid-cols-4 items-center gap-4">
                      <Label htmlFor="year" className="text-left">
                        Year
                      </Label>
                      <Input
                        id="year"
                        type="number"
                        required
                        min="1900"
                        max={new Date().getFullYear()}
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="Year"
                        className="col-span-3"
                      />
                    </div>
                  </div>
                </ScrollArea>
                <DialogClose>
                  <Button type="submit" onClick={handleSubmit} className="mr-4">
                    Create Finance Record
                  </Button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </div>
  );
};
