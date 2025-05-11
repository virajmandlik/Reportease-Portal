import { FC, useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { StatsCard } from './StatsCard';
import { PieInteractive } from './visuals/PieInteractive';
import {
  CircleUser,
  Home,
  Menu,
  Package2,
  Search,
  Command,
  User,
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
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import ModeToggle from './mode-toggle';
import { Sidebar } from './SideBar/Sidebar';
import PolarAreaChart from "./visuals/PolarChart";
import PlacementChart from './visuals/PlacementChart';
import Bar2 from './Bar';
import CollegeAchievementsChart from './Line';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer"
import { Minus, Plus } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer } from "recharts"
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'react-toastify';
import ActivityLog from './ActivityLog';
import Line from './Line';
import LineV1 from './LineV1';
import {ResearchPaper} from './Donut';
import {Events} from './BarV2'
import { Financial } from './Pie';


interface User {
  userid: number | null;
  email: string | null;
  first_name: string | null;
  last_name: string | null;
  username: string | null;
  photoURL: string | null;
  institute_id: number | null;
  department: string | null;
  mobile: string | null;
  type_id: number | null;
  is_active: boolean;
  gender: string;
}


const data = [
  {
    goal: 400,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 239,
  },
  {
    goal: 300,
  },
  {
    goal: 200,
  },
  {
    goal: 278,
  },
  {
    goal: 189,
  },
  {
    goal: 349,
  },
]


const graphOptions = [
  { id: 'pie', label: 'Pie Chart - Department-wise student count', component: PieInteractive },
  { id: 'polar', label: 'Polar Area Chart - Count of clubs with types', component: PolarAreaChart },
  { id: 'placement', label: 'Bar Graph - Career opportunities count with types', component: PlacementChart },
];


export const Dashboard: FC = () => {
  const { username } = useParams();
  const navigate = useNavigate();
 


  // User state
  const [user, setUser] = useState<User | null>(null);
  console.log(user);
  const [notificationCount, setNotificationCount] = useState(0);
  const [userType, setUserType] = useState<number | null>(null);
  const [goal, setGoal] = useState(350)
  const [selectedGraphs, setSelectedGraphs] = useState<string[]>([]);
 
  function onClick(adjustment: number) {
    setGoal(Math.max(200, Math.min(400, goal + adjustment)))
  }


  const fetchPhotoURL = async (userid: number | null) => {
    console.log(userid);


    if (!userid) return;


    try {
      // const response = await fetch(`/api/get-photo-url?user_id=${userId}`);


      const response = await fetch(
        `http://localhost:3000/api/user-photo/${userid}`
      );


      const data = await response.json();


      console.log(data.photoURL);


      if (response.ok && data.photoURL) {
        // setUser((prevUser) => ({
        //   ...prevUser,
        //   photoURL: data.photoUrl,
        // }));
        console.log('data.photoUrl', data.photoURL);
        setUser((prevUser) => ({
          ...(prevUser ?? {
            photoURL: null,
            institute_id: null,
            userid: null,
            email: null,
            first_name: null,
            last_name: null,
            username: null,
            department: null,
            type_id: null,
            gender: null,
            is_active: false,
            mobile: null,
          }), // Default empty values for user
          photoURL: data.photoURL,
        }));




        console.log(user?.photoURL); // setUser({ ...user, photoURL: data.photoUrl });
      }
    } catch (error) {
      console.error('Error fetching photo URL:', error);
    }
  };
  useEffect(() => {
    const token = Cookies.get('token');
    if (!token) {
      navigate('/login');
      return;
    }
    console.log('the token is', token);
    try {
      const decoded: any = jwtDecode(token);
      const currentTime = Date.now() / 1000;


      if (decoded.exp < currentTime) {
        alert('Session expired. Please login again.');
        Cookies.remove('token');
        navigate('/login');
        return;
      } else if (decoded.username !== username) {
        navigate('/login');
        return;
      }


      // Assuming the decoded token has these fields
      const userDetails: User = {
        userid: decoded.id,
        username: decoded.username,
        first_name: decoded.first_name,
        last_name: decoded.last_name,
        email: decoded.email_id,
        institute_id: decoded.institute_id,
        department: decoded.department,
        type_id: decoded.type_id,
        gender: decoded.gender,
        photoURL: decoded.photoURL,
        is_active: false,
        mobile: decoded.mobile_number,
      };


      // console.log('the user details',userDetails);
      // console.log("DataType of type_id is:", typeof user?.type_id);


      setUser(userDetails);
      setNotificationCount(decoded.notificationCount || 0); // Set notification count if available
      setUserType(decoded.type_id);
    } catch (err) {
      navigate('/login');
    }
  }, [username, navigate]);


  useEffect(() => {
    const savedGraphs = localStorage.getItem('selectedGraphs');
    if (savedGraphs) {
      setSelectedGraphs(JSON.parse(savedGraphs));
    }
  }, []);


  // Save user selections to local storage
  const saveSelections = () => {
    localStorage.setItem('selectedGraphs', JSON.stringify(selectedGraphs));
    toast.success("Visualizations updated!", {
      className: "custom-toast",
      autoClose: 1200,
    });
  };


  // Handle graph selection
  const toggleGraphSelection = (id: string) => {
    setSelectedGraphs((prev) => {
      if (prev.includes(id)) {
        return prev.filter((graphId) => graphId !== id);
      } else if (prev.length < 6) {
        return [...prev, id];
      }
      return prev; // Limit to 6 selections
    });
  };


  const handleLogout = async () => {
    Cookies.remove('token'); // Remove the token on logout
    setUser(null);
    navigate('/login');
  };
  // console.log('the user at dashboard is', user);
  useEffect(() => {
    if (user?.userid) {
      fetchPhotoURL(user.userid);
      const interval = setInterval(fetchPhotoURL, 600000, user.userid);
      return () => clearInterval(interval);
    }
  });




  return (
    <>
      <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[230px_1fr] bg-customBackground">
        <Sidebar user={user} activePage="dashboard" />
        <div className="flex flex-col">
          <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
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
                <div className='text-right'>
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button variant="default">Customize Visualizations</Button>
                  </DrawerTrigger>
                  <DrawerContent className='h-[80vh] overflow-auto'>
                  <ScrollArea className="p-4">
                    <div className="mx-auto w-full h-auto">
                      <DrawerHeader>
                        <DrawerTitle>Graphs & Charts</DrawerTitle>
                        <DrawerDescription>Select all the visualizations you'd like on your dashboard</DrawerDescription>
                      </DrawerHeader>
                      <div className="flex flex-col gap-2">
                        {graphOptions.map(({ id, label }) => (
                          <div
                            key={id}
                            className={`flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-gray-200 ${selectedGraphs.includes(id) ? 'bg-gray-300' : ''}`}
                            onClick={() => toggleGraphSelection(id)}
                          >
                            <span>{label }</span>
                            {selectedGraphs.includes(id) && <span>✔️</span>}
                          </div>
                        ))}
                      </div>
                      <DrawerHeader>
                        <DrawerTitle>Statistics</DrawerTitle>
                        <DrawerDescription>Select all the statistics you'd like on your dashboard</DrawerDescription>
                      </DrawerHeader>
                      <div className="pl-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {user?.type_id === 1 && (
                          <>
                            {/* Admin-specific cards */}
                            <StatsCard title="Programs Offered" entity="programs" username={user?.username} />
                            <StatsCard title="Total Departments" entity="departments" username={user?.username} />
                            <StatsCard title="Faculty Count" entity="faculty" username={user?.username} />
                            <StatsCard title="Total Students" entity="students" username={user?.username}/>
                            <StatsCard title="Total Clubs" entity="clubs" username={user?.username}/>
                          </>
                        )}
                      </div>
                      <div className="flex justify-end mt-4">
                        <DrawerClose asChild>
                        <Button variant="default" onClick={saveSelections}>Save visualizations</Button>
                        </DrawerClose>
                      </div>
                    </div>
                    </ScrollArea>
                  </DrawerContent>
                </Drawer>
                </div>
              </form>
            </div>
            <div className="">
              <ModeToggle />
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="secondary"
                  size="icon"
                  className="rounded-full"
                >
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
                  {user?.username || 'My Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => navigate(`/profile/${user?.userid}`)}
                >
                  Profile Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/support')}>
                  Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </header>
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
              <h1 className="text-2xl text-sidebar font-bold">
                Welcome,{' '}
                {`${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
                  'User'}
              </h1>
            </div>
            <div className='grid grid-cols-[2fr_1fr] gap-8 flex flex-col'>
            <div className="pl-3 grid gap-4 grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
              {user?.type_id === 1 && (
                <>
                  {/* Admin-specific cards */}
                  <StatsCard title="Programs Offered" entity="programs" username={user?.username} />
                  <StatsCard title="Total Departments" entity="departments" username={user?.username} />
                  <StatsCard title="Faculty Count" entity="faculty" username={user?.username} />
                  <StatsCard title="Total Students" entity="students" username={user?.username}/>
                  <StatsCard title="Total Clubs" entity="clubs" username={user?.username}/>
                  <StatsCard title="Total Events" entity="events" username={user?.username}/>
                </>
              )}
              {user?.type_id === 2 && (
                <>
                  {/* Coordinator-specific cards */}
                  <StatsCard title="Total Events" entity="events" username={user?.username}/>
                  <StatsCard title="Departments" entity="departments" username={user?.username}  />
                </>
              )}
              {user?.type_id === 3 && (
                <>
                  <StatsCard title="Achievements" entity="departments" username={user?.username} />
                  <StatsCard title="Research Papers" entity="clubs" username={user?.username} />
                  <div className="col-span-full">
                    {/* <PieInteractive institute_id={user.institute_id}/> */}
                  </div>
                </>
              )}
              {user?.type_id === 4 && (
                <>
                  {/* Student-specific cards */}
                  <StatsCard title="Subjects Enrolled" entity="departments" username={user?.username} />
                  <StatsCard title="Assignments Due" entity="departments" username={user?.username}/>
                  <div className="col-span-full">
                    <PieInteractive institute_id={user.institute_id}/>
                  </div>
                </>
              )}
            </div>
            {user?.type_id === 1 && (
                <>
            <ActivityLog institute_id={user?.institute_id}/>
            </>
            )}
            {/* <div className="flex-1 bg-white rounded-lg shadow-xl mt-4 p-8 dark:bg-black">
                    <h4 className="text-xl text-gray-900 font-bold dark:text-gray-500">Activity log</h4>
                    <div className="relative px-4">
                        <div className="absolute h-full border border-dashed border-opacity-20 border-secondary"></div>


                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">Profile informations changed.</p>
                                <p className="text-xs text-gray-500">3 min ago</p>
                            </div>
                        </div>


                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">
                                    Connected with <a href="#" className="text-blue-600 font-bold">Colby Covington</a>.</p>
                                <p className="text-xs text-gray-500">15 min ago</p>
                            </div>
                        </div>


                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">Invoice <a href="#" className="text-blue-600 font-bold">#4563</a> was created.</p>
                                <p className="text-xs text-gray-500">57 min ago</p>
                            </div>
                        </div>


                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">
                                    Message received from <a href="#" className="text-blue-600 font-bold">Cecilia Hendric</a>.</p>
                                <p className="text-xs text-gray-500">1 hour ago</p>
                            </div>
                        </div>


                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">New order received <a href="#" className="text-blue-600 font-bold">#OR9653</a>.</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                     
                        <div className="flex items-center w-full my-6 -ml-1.5">
                            <div className="w-1/12 z-10">
                                <div className="w-3.5 h-3.5 bg-blue-600 rounded-full"></div>
                            </div>
                            <div className="w-11/12">
                                <p className="text-sm">
                                    Message received from <a href="#" className="text-blue-600 font-bold">Jane Stillman</a>.</p>
                                <p className="text-xs text-gray-500">2 hours ago</p>
                            </div>
                        </div>
                    </div>
                </div> */}
            </div>
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
              {user?.institute_id && user.type_id === 1 && (
                <>
                  <Bar2/>
                  <Line/>
                  {selectedGraphs.includes('placement') && <PlacementChart institute_id={user?.institute_id} />}
                  {selectedGraphs.includes('pie') && <PieInteractive institute_id={user?.institute_id} />}
                  {selectedGraphs.includes('polar') && <PolarAreaChart institute_id={user?.institute_id} />}
                </>
              )}
              {user?.institute_id && user.type_id === 2 && (
                <>
                  <Events/>
                  <ResearchPaper/>
                  <Financial/>
                </>
              )}
              {user?.institute_id && user.type_id === 3 && (
                <>
                  <LineV1/>
                  <ResearchPaper/>
                  {selectedGraphs.includes('polar') && <PolarAreaChart institute_id={user?.institute_id} />}
                </>
              )}
              {user?.institute_id && user.type_id === 4 && (
                <>
                  <Bar2/>
                  <Line/>
                </>
              )}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};




