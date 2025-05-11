import { FC, useState, useEffect } from 'react';
import { SidebarHeader } from './SidebarHeader';
import { SidebarNavigation } from './SidebarNavigation';
import { AddDataDialog } from './AddDataDialog';
import { ProfileSection } from './ProfileSection';
import { Link } from 'react-router-dom';
import { EnrollCourses } from './EnrollCourses';
import { Home, FileInput, FileSpreadsheet, Layout, User2, FolderKanban } from 'lucide-react';
import { ManageData } from './ManageData';

interface SidebarProps {
  activePage: string;
  user: {
    userid: number | null;
    email: string | null;
    username: string | null;
    institute_id: number | null;
    type_id: number | null;
  } | null;
}

export const Sidebar: FC<SidebarProps> = ({ activePage, user }) => {
  // console.log("i am on side bar ...here the user is ", user);
  // const [
  const [Programs, setHasPrograms] = useState(false);
  useEffect(() => {
    const checkPrograms = async () => {
      if (user?.institute_id) {
        try {
          const response = await fetch(`/get-programs/${user.institute_id}`);
          const data = await response.json();
          setHasPrograms(data.programs && data.programs.length > 0);
        } catch (error) {
          console.error('Error checking programs:', error);
        }
      }
    };

    checkPrograms();
  }, [user?.institute_id]);

  return (
    <div className="hidden border-r bg-muted/40 md:block w-[230px]">
      <div className="flex flex-col gap-2">
        <SidebarHeader user={user} activePage="add-finance" />

        <nav className="flex-1 grid items-start px-2 text-sm font-medium lg:px-4">
          {/* Add Data Dialog for Faculty (type_id = 3) */}
          {/* Dashboard Link  */}
          <Link
            to={`/dashboard/${user?.username}`}
            className={`mt-4 flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === 'dashboard'
                ? 'bg-muted text-primary'
                : 'text-muted-foreground'
            }`}
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Link>
          {/* Conditional Rendering for Admin (type_id = 1) */}
          {user?.type_id === 1 && (
            <>
              {/* Manage/Create Institute Links */}
              {user?.institute_id === null ? (
                <Link
                  to="/admin/create-institute"
                  className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                    activePage === 'create-institute'
                      ? 'bg-muted text-primary'
                      : 'text-muted-foreground'
                  }`}
                >
                  <FileInput className="h-4 w-4" />
                  Create Institute
                </Link>
              ) : (
                <>
                  <Link
                    to="/admin/manage-institute"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'manage-institute'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileInput className="h-4 w-4" />
                    Manage Institute
                  </Link>
                  {/* {hasPrograms && (
                    <Link
                      to="/admin/manage-programs"
                      className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                        activePage === "manage-programs"
                          ? "bg-muted text-primary"
                          : "text-muted-foreground"
                      }`}
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Manage Programs
                    </Link>
                  )} */}
                  <Link
                    to="/admin/create-department"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'create-department'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileInput className="h-4 w-4" />
                    Create Department
                  </Link>
                  <Link
                    to="/admin/create-program"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'create-program'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileInput className="h-4 w-4" />
                    Create Program
                  </Link>
                  <Link
                    to="/admin/create-course"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'create-course'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileInput className="h-4 w-4" />
                    Create Course
                  </Link>
                  <Link
                    to="/admin/faculty-list"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'faculty-list'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FolderKanban className="h-4 w-4" />
                    Faculty
                  </Link>

                  {/* <Link
                    to="/admin/student-enrollment"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'student-enrollment'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FolderKanban className="h-4 w-4" />
                    Student Enrollment
                  </Link>
                  <Link
                    to="/admin/create-events"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'create-events'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Events
                  </Link> */}
                  <Link
                    to="/admin/create-club"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'create-club'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Clubs
                  </Link>
                  <Link
                    to="/access-control"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      activePage === 'access-control'
                        ? 'bg-sidebar text-white border-black hover:text-white'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Access Control
                  </Link>
                  <Link
                    to="/user-management"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
                      activePage === 'user-management'
                        ? 'bg-sidebar text-white border-black hover:text-white'
                        : 'text-muted-foreground hover:text-primary'
                    }`}
                  >
                    <User2 className="h-4 w-4" />
                    User Management
                  </Link>
                  <Link
                    to="/admin/generate-annual-report"
                    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                      activePage === 'generate-annual-report'
                        ? 'bg-muted text-primary'
                        : 'text-muted-foreground'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                    Generate Annual Report
                  </Link>
                </>
              )}
            </>
          )}
          {/* {console.log('the user sent to ManageData is ',user)} */}
          {user?.type_id === 2 && <ManageData user={user} />}
          {/* {user?.type_id === 3 && <AddDataDialog user={user} />} */}
          {user?.type_id === 3 && (
            <>
              {/* Add Data Dialog */}
              <AddDataDialog user={user} />
              <Link
                to="/instructor/create-course"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'add-data'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileInput className="h-4 w-4" />
                Create Courses
              </Link>

              {/* Feedback Link */}
              <Link
                to="/feedback"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'feedback'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileInput className="h-4 w-4" />
                Give Feedback
              </Link>

              <Link
                to="/faculty/create-achievement"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'create-achievement'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Achievements
              </Link>

              <Link
                to="/faculty/add-research"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'create-research'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Research
              </Link>
            </>
          )}
          {/* Additional Links for Other User Types can be added here */}
          {/* {user?.type_id === 4 && <EnrollCourses user={user} />} */}
          {user?.type_id === 4 && (
            <>
              <EnrollCourses user={user} />

              <Link
                to={`/byStudent/feedback`}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'feedback'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileInput className="h-4 w-4" />
                Give Feedback
              </Link>

              <Link
                to="/student/create-achievement"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'create-achievement'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Achievements
              </Link>

              <Link
                to="/student/add-research"
                className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
                  activePage === 'create-research'
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground'
                }`}
              >
                <FileSpreadsheet className="h-4 w-4" />
                Research
              </Link>
            </>
          )}
        </nav>
        <div className="mt-auto pl-0 p-2 ">
          <ProfileSection user={user} />
        </div>
      </div>
    </div>
  );
};
