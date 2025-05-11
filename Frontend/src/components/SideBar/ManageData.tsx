import { Button } from "@/components/ui/button";
import { FC, useState, useEffect } from "react";
import { AddPlacementDataDialog } from "./CoOrdinatorComponent/AddPlacementDataDialog";
import { Link } from "react-router-dom";
import { FileSpreadsheet, FileInput } from "lucide-react";

interface ManageDataProps {
  activePage: string;
  user: {
    userid: number | null; // Unique ID of the user
    first_name: string | null; // First name of the user
    last_name: string | null; // Last name of the user
    email: string | null; // Email of the user
    username: string | null; // Username of the user
    type_id: number | null; // Type ID of the user (e.g., role)
    institute_id: number | null; // ID of the associated institute
    is_active: boolean; // Active status of the user
  };
}
export const ManageData: FC<ManageDataProps> = ({ user, activePage }) => {
  const [departmentName, setDepartmentName] = useState<string | null>(null);
  const [deptType, setDeptType] = useState<string | null>(null);
 

  useEffect(() => {
    // Log to confirm that the useEffect is running
    // console.log("Inside useEffect - user is:", user);
    // console.log("Inside useEffect - user id is:", user?.userid);
    // console.log("Inside useEffect - user email is:", user?.email);

    if (!user?.userid) return; // If there's no valid user ID, exit early

    const fetchDepartments = async () => {
      try {
        console.log(
          "Sending request to fetch department for user ID:",
          user.userid
        );
        const response = await fetch(
          `http://localhost:3000/get-department/${user.userid}`
        );
        if (!response.ok) {
          console.log("Response not OK:", response);
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("the data is ", data);
        const temp_name = data.dept_name;
        setDepartmentName(temp_name); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching departments:", error);
        setDepartmentName(""); // Set empty string on error
      }
    };
    const fetchDeptType = async () => {
      try {
        console.log(
          "Sending request to fetch department type for user ID:",
          user.userid
        );
        const response = await fetch(
          `http://localhost:3000/api/get-department-type/${user.userid}`
        );
        if (!response.ok) {
          console.log("Response not OK:", response);
          throw new Error("Failed to fetch department type");
        }
        const data = await response.json();
        console.log("the department type data is ", data);
        setDeptType(data.dept_type || null); // Update state with fetched data
      } catch (error) {
        console.error("Error fetching department type:", error);
        setDeptType(null); // Set null on error
      }
    };
  
    fetchDeptType();

    fetchDepartments();
  }, [user?.userid]);
  {console.log('the departmentName and type is sending...',departmentName," ",deptType)}
  {console.log('the user while sending it from manage data is ...',user)}
  return (
    <div className="flex flex-col space-y-4">
      {/* Finance Coordinator Links */}
      {departmentName === "Financials" && (
        <>
          <Link
            to="/add-finance"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "add-finance" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Finance
          </Link>
          <Link
            to="/generate-finance-report"
            state={{ user }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "generate-finance" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Financial Report
          </Link>
        </>
      )}

      {/* Placement Coordinator Links */}
      {departmentName === "Placement" && (
        <>
          <AddPlacementDataDialog user={user} />
          <Link
            to="/add-opportunity"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "create-opportunity" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Add Opportunities
          </Link>
          <Link
            to="/generate-placement-report"
            state={{ user }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "generate-placement" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Placement Report
          </Link>
        </>
      )}

      {/* Infrastructure Coordinator Links */}
      {departmentName === "Infrastructure" && (
        <Link
          to="/generate-infrastructure-report"
          state={{ user }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            activePage === "generate-infrastructure" ? "bg-muted text-primary" : "text-muted-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Generate Infrastructure Report
        </Link>
      )}

      {/* Event Coordinator Links */}
      {departmentName === "Event" && (
        <Link
          to="/generate-event-report"
          state={{ user }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            activePage === "generate-event" ? "bg-muted text-primary" : "text-muted-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Generate Event Report
        </Link>
      )}

      {/* Club Coordinator Links */}
      {departmentName === "Club" && (
        <>
          <Link
            to="/generate-club-report"
            state={{ user }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "generate-club-report" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Club Report
          </Link>
          <Link
            to="/co-ordinator/create-club"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "create-club" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Create Club
          </Link>
        </>
      )}

      {/* Student and Faculty Administration Links */}
      {departmentName === "Student And Faculty Administration" && (
        <Link
          to="/generate-studentandfacultyadministration-report"
          state={{ user }}
          className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
            activePage === "generate-student-and-faculty-administration"
              ? "bg-muted text-primary"
              : "text-muted-foreground"
          }`}
        >
          <FileSpreadsheet className="h-4 w-4" />
          Generate Student And Faculty Administration Report
        </Link>
      )}

      {/* Academic Coordinator Links */}
      {deptType === "Academic" && (
        <>
          <Link
            to="/add-course"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "add-course" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Add Course
          </Link>
          <Link
            to="/generate-academic-report"
            state={{ user }}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
              activePage === "generate-academic-report" ? "bg-muted text-primary" : "text-muted-foreground"
            }`}
          >
            <FileSpreadsheet className="h-4 w-4" />
            Generate Academic Report
          </Link>
        </>
      )}

      {/* Shared Links for All Coordinators */}
      <Link
    to={`/view-reports/${user.institute_id}?departmentName=${encodeURIComponent(departmentName)}&deptType=${encodeURIComponent(deptType)}`} // Correctly formatted URL
    className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
      activePage === "view-departmental-report" ? "bg-muted text-primary" : "text-muted-foreground"
    }`}
>
    <FileSpreadsheet className="h-4 w-4" />
    View Departmental Reports
</Link>
      <Link
        to="/feedback"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
          activePage === "feedback" ? "bg-muted text-primary" : "text-muted-foreground"
        }`}
      >
        <FileInput className="h-4 w-4" />
        Give Feedback
      </Link>
      <Link
        to="/media"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
          activePage === "media" ? "bg-muted text-primary" : "text-muted-foreground"
        }`}
      >
        <FileInput className="h-4 w-4" />
        Add Media & Description
      </Link>
      <Link
        to="/co-ordinator/create-achievement"
        className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary ${
          activePage === "create-achievement" ? "bg-muted text-primary" : "text-muted-foreground"
        }`}
      >
        <FileSpreadsheet className="h-4 w-4" />
        Achievements
      </Link>
    </div>
  );
};

export default ManageData;
