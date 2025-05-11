// import { BrowserRouter as Router,  Routes } from 'react-router-dom';


import React, { useEffect,useState } from 'react';
import { Route, Routes,useNavigate,useParams } from 'react-router-dom';
import { Accordion_styles } from './components/Accordion_styles';
import { Page } from './components/AuthenticationPage';
import { Dashboard } from './components/Dashboard';
import { ThemeProvider } from "@/components/theme-provider";
import { CreateInstitute } from './components/CreateInstitute';
import { CreateProgram } from './components/CreateProgram';
import { CreateDepartment } from './components/CreateDepartment';
import { CreateCourse } from './components/CreateCourse';
import { ManageInstitute } from './components/ManageInstitute';
import { SignUpFormFaculty } from './components/SignUpFormFaculty';
import { CreateEvent } from './components/CreateEvent';
import { SignUpFormAdmin } from "./components/SignUpFormAdmin";
import { FileUpload } from "./components/addStudentData";
import { FacultyRegistration } from './components/FacultyRegistrationForm';
import { AddDataDialog } from './components/SideBar/AddDataDialog';
import { Feedback } from './components/Feedback';
import { ToastContainer } from 'react-toastify';
import { SignUpFormStudent } from './components/SignUpFormStudent';
import { CreateResearch } from "./components/CreateResearch";
import { CreateOpportunity } from './components/CreateOpportunity';
import { CreateInfrastructure } from './components/CreateInfrastructure';
import { CreateFinance } from './components/CreateFinance';
import { FeedbackByStudent } from './components/FeedbackByStudent';
import { InputOTPWithSeparator } from './components/input-otp-seprator';
import Profile from "./components/profile";
import Support from "./components/support";
import { UploadMedia } from './components/UploadMedia';
import { GenerateFinancialReport } from './components/GenerateDepartmentReport/GenerateFinanceReport';
import { GeneratePlacementReport } from './components/GenerateDepartmentReport/GeneratePlacementReport';
import { CreateClub } from './components/CreateClub';
import { CreateAchievement } from './components/CreateAchievement';
import {GenerateInfrastructureReport} from './components/GenerateDepartmentReport/GenerateInfrastructureReport'
import './index.css'
// Landing page imports
import WOW from "wow.js";
import { useLocation } from "react-router-dom";
import Home from './components/pages/Home/Home';// Your landing page Home component
import { GenerateEventReport } from './components/GenerateDepartmentReport/GenerateEventReport';
import { GenerateClubReport } from './components/GenerateDepartmentReport/GenerateClubReport';
import { GenerateStudentAndFacultyAdministrationReport } from './components/GenerateDepartmentReport/GenerateStudentAndFacultyAdministrationReport';
import { GenerateAcademicReport } from './components/GenerateDepartmentReport/GenerateAcademicReport';
import ReportVersionSelector from './components/ReportVersionSelector';
import { UserManagement } from './components/UserManagement';
import {AccessPage} from './components/AccessPage';
import { UserManagePage } from './components/UserManagePage';
import { GenerateAnnualReport } from "./components/GenerateDepartmentReport/GenerateAnnualReport";




const App: React.FC = () => {

  const [userPhoto, setUserPhoto] = useState<string | null>(null);
  const navigate = useNavigate();
  const { username } = useParams<{ username: string }>(); 
  const handleUpdateUserPhoto = (photoURL: string) => {
    setUserPhoto(photoURL); // Update the state with the new photo URL
    console.log("User photo updated:", photoURL);
  };


  console.log('the handle close profile ')
  // const handleCloseProfile = () => {
  //   <Route path="/dashboard/:username" element={<Dashboard />} />
  //   // navigate("/dashboard"); // Redirect to the dashboard or another page when profile is closed
  // };

  // const handleCloseProfile = () => {
  //   navigate("/dashboard"); // Use navigate to redirect to the dashboard
  // };

  const handleCloseProfile = (username: string) => {
    navigate(`/dashboard/${username}`); // Redirect to the dashboard with the username
  };



  useEffect(() => {
    const wow = new WOW({
      boxClass: "wow",
      animateClass: "animated",
      offset: 0,
      mobile: false,
      live: true,
    });
    wow.init();
  }, []);

  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <Routes>

        {/* Other routes */}
        <Route path="/dashboard/:username" element={<Dashboard/>}/>
          <Route path="/admin/create-institute" element={<CreateInstitute/>} />
          <Route path="/admin/manage-institute" element={<ManageInstitute/>} />
          <Route path="/admin/create-program" element={<CreateProgram/>} />
          <Route path="/admin/create-department" element={<CreateDepartment/>} />
          <Route path="/instructor/create-course" element={<CreateCourse/>} />
          <Route path="/feedback" element={  <Feedback/> } />
          <Route path="/login" element={<Page/>} />
          <Route path="/create-event" element={<CreateEvent/>} />
          <Route path="/admin/create-institute" element={<CreateInstitute />} />
          <Route path="/login" element={<Page />} />
          <Route path="/signup/faculty" element={< FacultyRegistration/>} />
          <Route path="/signup/instituteAdmin" element={<SignUpFormAdmin />} />
          <Route path="/signup/student" element={<SignUpFormStudent />} />
          <Route path="/faculty/addData" element={<FileUpload />}/>
          <Route path="/admin/add-research" element={<CreateResearch/>} />
          <Route path="/faculty/add-research" element={<CreateResearch/>} />
          <Route path="/student/add-research" element={<CreateResearch/>} />
          <Route path="/add-opportunity" element={<CreateOpportunity/>} />
          <Route path="/admin/create-infrastructure" element={<CreateInfrastructure/>} />
          <Route path="/admin/create-achievement" element={<CreateAchievement/>} />
          <Route path="/co-ordinator/create-achievement" element={<CreateAchievement/>} />
          <Route path="/student/create-achievement" element={<CreateAchievement/>} />
          <Route path="/faculty/create-achievement" element={<CreateAchievement/>} />
          <Route path="/admin/create-club" element={<CreateClub/>} />
          <Route path="/co-ordinator/create-club" element={<CreateClub/>} />
          <Route path="/add-finance" element={<CreateFinance/>} />
          <Route path="/byStudent/feedback" element={<FeedbackByStudent/>} />
          <Route path="/input-otp/:email" element={<InputOTPWithSeparator />} />
          <Route path="/media" element={<UploadMedia/>} />
          <Route path="/generate-finance-report" element={<GenerateFinancialReport/>} />
          <Route path="/generate-placement-report" element={<GeneratePlacementReport/>} />
          <Route path="/generate-infrastructure-report" element={<GenerateInfrastructureReport/>} />
          <Route path="/generate-event-report" element={<GenerateEventReport/>} />
          <Route path="/generate-club-report" element={<GenerateClubReport/>} />
          <Route path="/generate-studentandfacultyadministration-report" element={<GenerateStudentAndFacultyAdministrationReport/>} />
          <Route path="/generate-academic-report" element={<GenerateAcademicReport/>} />
          <Route path="/view-reports/:institute_id" element={<ReportVersionSelector />} /> <Route path="/support" element={<Support />} />
          {/* <Route path="/user-management" element={<UserManagement />} /> */}
          <Route path="/user-management" element={<UserManagePage />} />
          <Route path="/access-control" element={<AccessPage/>} />
          <Route
            path="/profile/:userid"
            element={
              <Profile
                user={{
                  userId: null,
                  mobile: null,
                  username: username || null,
                  type_id: null,
                  first_name: null,
                  institute_id: null,
                  last_name: null,
                  email: null,
                  photoURL: userPhoto,
                }}
                // onClose={function (): void {
                //   throw new Error("Function not implemented.");
                // }}
                // updateUserPhoto={function (photoURL: string): void {
                //   throw new Error("Function not implemented.");
                // }}
                onClose={handleCloseProfile} // Implement closing logic
                updateUserPhoto={handleUpdateUserPhoto}
              />
            }
          />
          <Route path="/admin/generate-annual-report" element={<GenerateAnnualReport/>} />



      </Routes>
      <ToastContainer />
    </ThemeProvider>
  );
};

export default App;
