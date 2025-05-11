import { FC, useState, useEffect } from "react";

import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import loginImage from "@/assets/Login_Page/loginpage.png"; 
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  Select,
  SelectContent,
    SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// Define the Institute type
interface Institute {
  institute_name: string;
  Enrollment_key: string | null; // Enrollment_key can be a string or null
}

export const SignUpFormStudent: FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    gender: "",
    password: "",
    confirm_password: "",
    institute: "",
    student_reg_id: "", // Add this line
    department: "",
    program: "",
    current_semester: "",
  });

  const [FirstNameError, setFirstNameError] = useState("");
  const [LastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [enrollmentKeyError, setEnrollmentKeyError] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [studentRegIdError, setStudentRegIdError] = useState("");
  const [departments, setDepartments] = useState<string[]>([]); // State for departments
  const [programs, setPrograms] = useState<string[]>([]); // State for programs
  const [currentSemesterError, setCurrentSemesterError] = useState("");
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    const fetchInstitutes = async () => {
      try {
        const response = await fetch("http://localhost:3000/institutes");
        if (!response.ok) {
          throw new Error("Failed to fetch institutes");
        }
        const data = await response.json();
        // Remove duplicates based on institute_name
        const uniqueInstitutes = Array.from(
          new Map(
            data.map((item: Institute) => [item.institute_name, item])
          ).values()
        );
        setInstitutes(uniqueInstitutes); // Assuming your API returns an array of institutes
      } catch (error) {
        console.error("Error fetching institutes:", error);
      }
    };

    fetchInstitutes();
  }, []);

  const fetchDepartments = async (instituteName: string) => {
    try {
      const response = await fetch(
        `http://localhost:3000/departments?institute=${instituteName}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch departments");
      }
      const data = await response.json();
      setDepartments(data.map((dept: { dept_name: string }) => dept.dept_name)); // Assuming your API returns an array of department objects
    } catch (error) {
      console.error("Error fetching departments:", error);
    }
  };

  const fetchPrograms = async (departmentName: string) => {
    try {
      console.log("ftechiung the datA");
      const response = await fetch(
        `http://localhost:3000/programs?department=${departmentName}`
      );
      // console.log("response program is is ", response.json);
      if (!response.ok) {
        throw new Error("Failed to fetch programs");
      }
      const data = await response.json();
      setPrograms(
        data.map((program: { prog_name: string }) => program.prog_name)
      );
      console.log("programs are ", programs); // Assuming your API returns an array of program objects
    } catch (error) {
      console.error("Error fetching programs:", error);
    }
  };
  const validateEnrollmentKey = () => {
    const selectedInstitute = institutes.find(
      (institute) => institute.institute_name === formData.institute
    );

    if (selectedInstitute) {
      if (selectedInstitute.Enrollment_key !== enrollmentKey) {
        setIsEnrollmentKeyValid(false);
        alert("Enrollment key does not match the selected institute.");
        return false;
      } else {
        setIsEnrollmentKeyValid(true);
      }
    }

    return true; // return true if valid or if no institute is selected
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleProgramChange = (value: string) => {
    setFormData((prevData) => ({
      ...prevData,
      program: value, // Update the program in formData
    }));
  };
  const validateForm = () => {
    let isValid = true;

    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPhoneError("");
    setEnrollmentKeyError("");
    setCurrentSemesterError("");

    // First Name and Last Name Validation
    const nameRegex = /^[A-Za-z]+$/;
    if (!formData.first_name || !nameRegex.test(formData.first_name)) {
      setFirstNameError("First name must be alphabetic and cannot be empty.");
      isValid = false;
    }
    if (!formData.last_name || !nameRegex.test(formData.last_name)) {
      setLastNameError("Last name must be alphabetic and cannot be empty.");
      isValid = false;
    }

    // Email Validation
    if (!formData.email || !emailRegex.test(formData.email)) {
      setEmailError("Please enter a valid email address.");
      isValid = false;
    }
    if (!enrollmentKey) {
      setEnrollmentKeyError("Please enter a valid enrollment key.");
      isValid = false;
    }
    // Phone Number Validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.mobile_number || !phoneRegex.test(formData.mobile_number)) {
      setPhoneError("Mobile number must be a 10-digit number.");
      isValid = false;
    }
    // Enrollment Key Validation
    const selectedInstitute = institutes.find(
      (institute) => institute.institute_name === formData.institute
    );

    if (selectedInstitute) {
      if (selectedInstitute.Enrollment_key === null) {
        setEnrollmentKeyError(
          "This institute does not require an enrollment key."
        );
      } else if (selectedInstitute.Enrollment_key !== enrollmentKey) {
        setEnrollmentKeyError(
          "Enrollment key does not match the selected institute."
        );
        isValid = false;
      }
    }

    // Faculty Reg ID Validation
    if (!formData.student_reg_id) {
      setStudentRegIdError("Faculty Registration ID is required.");
      isValid = false;
    }

    // Current Semester Validation
    if (!formData.current_semester || formData.current_semester <= 0) {
      setCurrentSemesterError("Current semester must be a positive integer.");
      isValid = false;
    }

    return isValid; // Return the validation result
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    if (!validateForm()) return; // Validate the form
    setEmailError("");
    setPasswordError("");

    // Check if passwords match
    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match!");
      return;
    }

    // Validate password
    if (!passwordRegex.test(formData.password)) {
      setPasswordError(
        "Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character."
      );
      return;
    }

    const selectedInstitute = institutes.find(
      (institute) => institute.institute_name === formData.institute
    );

    if (
      selectedInstitute &&
      selectedInstitute.Enrollment_key !== null &&
      selectedInstitute.Enrollment_key !== enrollmentKey
    ) {
      alert("Enrollment key does not match the selected institute.");
      return;
    }

    try {
      // Send user data to your API
      console.log("formData:", formData);
      const response = await fetch(
        "http://localhost:3000/register/institute-student",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username: formData.username,
            first_name: formData.first_name,
            last_name: formData.last_name,
            email: formData.email,
            mobile_number: formData.mobile_number,
            gender: formData.gender,
            password: formData.password,
            usertype: 4, //student
            enrollment_key: enrollmentKey,
            institute: formData.institute,
            student_reg_id: formData.student_reg_id,
            department: formData.department,
            program: formData.program,
            current_semester: formData.current_semester,
          }),
        }
      );
      const email=formData.email;
      console.log("email is",email);
      if (response.ok) {
        toast.success('Registration successful! Please login.', {
          className: 'custom-toast',
          autoClose: 2000,
          onClose: () => navigate('/login')
        });
      } else {
        const error = await response.text();
        alert("Registration failed! " + error);
      }
    } catch (error: any) {
      console.error("Error during sign-up: ", error.message);
      setEmailError("Error during sign-up. Please try again.");
    }
  };


    return (
      <div className="min-h-screen flex">
        {/* Left Section: Image and Logo */}
        <div className="w-1/2 bg-gradient-to-r from-pink-500 to-purple-600 flex flex-col justify-center items-center p-8">
          <img src="/path-to-logo.png" alt="" className="mb-8 w-20" />
          <img src={loginImage} alt="Sign Up Illustration" className="w-[80%] max-w-[500px]" />
        </div>
  
        {/* Right Section: Sign-Up Form */}
        <div className="w-1/2 p-16 flex flex-col justify-center bg-white">
          <h2 className="text-4xl font-bold mb-4 text-purple-600 text-center">Sign Up as Student</h2>
          <p className="text-center text-gray-600 mb-6">
            Submit your details and join our platform today.
          </p>
  
          {/* Form Box with Shadow */}
          <div className="p-8 shadow-lg rounded-lg bg-white">
            <form onSubmit={handleSignUp} className="space-y-4">
              {/* Row 1: First Name and Last Name */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="first_name">First Name</Label>
                  <Input
                      type="text"
                      name="first_name"
                      placeholder="First Name"
                      id="first-name"
                      value={formData.first_name}
                      onChange={handleChange}
                    />
                    {FirstNameError && (
                      <p className="text-red-500 text-sm">{FirstNameError}</p>
                    )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="last_name">Last Name</Label>
                  <Input
                      type="text"
                      name="last_name"
                      placeholder="Last Name"
                      id="last-name"
                      value={formData.last_name}
                      onChange={handleChange}
                    />
                    {LastNameError && (
                      <p className="text-red-500 text-sm">{LastNameError}</p>
                    )}
                </div>
              </div>
  
              {/* Row 2: Email and Mobile Number */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="email">Email</Label>
                  <Input
                      type="text"
                      name="email"
                      placeholder="Email"
                      id="email"
                      value={formData.email}
                      onChange={handleChange}
                    />
                    {emailError && (
                      <p className="text-red-500 text-sm">{emailError}</p>
                    )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="mobile_number">Mobile Number</Label>
                  <Input
                      type="number"
                      name="mobile_number"
                      placeholder="Phone Number"
                      id="phonenumber"
                      value={formData.mobile_number}
                      onChange={handleChange}
                    />
                    {phoneError && (
                      <p className="text-red-500 text-sm">{phoneError}</p>
                    )}
                </div>
              </div>
  
              {/* Row 3: Gender and Institute */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="gender">Gender</Label>
                  <Select
                      name="gender"
                      value={formData.gender}
                      onValueChange={(value) =>
                        handleChange({ target: { name: "gender", value } })
                      }
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <Label htmlFor="institute">Institute</Label>
                  <Select
                      name="institute"
                      value={formData.institute}
                      onValueChange={(value) => {
                        handleChange({ target: { name: "institute", value } });
                        setEnrollmentKey(""); // Clear enrollment key when changing institute
                        fetchDepartments(value); // Fetch departments for the selected institute
                      }}
                    >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Institute" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                      {institutes.map((institute) => (
                            <SelectItem
                              key={institute.institute_name}
                              value={institute.institute_name}
                            >
                              {institute.institute_name}
                            </SelectItem>
                          ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
  
              {/* Row 4: Student Registration ID and Department */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="student_reg_id">Student Registration ID</Label>
                  <Input
                      type="text"
                      name="student_reg_id"
                      placeholder="Student Registration ID"
                      id="student_reg_id"
                      value={formData.student_reg_id}
                      onChange={handleChange}
                    />
                    {studentRegIdError && (
                      <p className="text-red-500 text-sm">{studentRegIdError}</p>
                    )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="department">Department</Label>
                  <Select
                      name="department"
                      value={formData.department}
                      onValueChange={(value) => {
                        handleChange({ target: { name: "department", value } });
                        fetchPrograms(value); // Fetch programs for the selected department
                      }}
                    >
                      <SelectTrigger className="w-[315px]">
                        <SelectValue placeholder="Select Department" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Departments</SelectLabel>
                          {departments.map((department) => (
                            <SelectItem key={department} value={department}>
                              {department}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                </div>
              </div>
  
              {/* Row 5: Program and Current Semester */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="program">Program</Label>
                  <Select
                      name="program"
                      value={formData.program} // Add this to formData state
                      onValueChange={(value) =>
                        handleChange({ target: { name: "program", value } })
                      }
                    >
                      <SelectTrigger className="w-[315px]">
                        <SelectValue placeholder="Select Program" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Programs</SelectLabel>
                          {programs.map((program) => (
                            <SelectItem key={program} value={program}>
                              {program}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                </div>
                {/* <div className="flex-1">
                  <Label htmlFor="current_semester">Current Semester</Label>
                  <Input
                    type="text"
                    name="current_semester"
                    placeholder="Current Semester"
                    value={formData.current_semester}
                    onChange={handleChange}
                  />
                </div> */}
              </div>
  
              {/* enrollment key  */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="program">Enrollment Key of Institue</Label>
                  <Input
                      type="text"
                      name="enrollment_key"
                      placeholder="Enrollment Key"
                      id="enrollment_key"
                      value={enrollmentKey}
                      onChange={(e) => setEnrollmentKey(e.target.value)}
                    />
                     {enrollmentKeyError && (
                      <p className="text-red-500 text-sm">{enrollmentKeyError}</p>
                    )}
                </div>
  
                <div className="flex-1">
                  <Label htmlFor="current_semester">Current Semester</Label>
                  <Input
                      type="number"
                      name="current_semester"
                      placeholder="Current Semester"
                      id="current_semester"
                      value={formData.current_semester}
                      onChange={handleChange}
                    />
                    {currentSemesterError && (
                      <p className="text-red-500 text-sm">
                        {currentSemesterError}
                      </p>
                    )}
                </div>
  
                <div className="flex-1">
                  <Label htmlFor="current_semester">Username</Label>
                  <Input
                      type="text"
                      name="username"
                      placeholder="Username"
                      id="username"
                      value={formData.username}
                      onChange={handleChange}
                    />
                </div>
              </div>
  
              {/* Row 6: Password and Confirm Password */}
              <div className="flex space-x-4">
                <div className="flex-1">
                  <Label htmlFor="password">Password</Label>
                  <Input
                  id="password"
                  type="password"
                  name="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                />
                {passwordError && (
                  <p className="text-red-500 text-sm">{passwordError}</p>
                )}
                </div>
                <div className="flex-1">
                  <Label htmlFor="confirm_password">Confirm Password</Label>
                  <Input
                  id="confirm_password"
                  type="password"
                  name="confirm_password"
                  required
                  value={formData.confirm_password}
                  onChange={handleChange}
                />
                </div>
              </div>
  
              <Button type="submit" className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white py-3 rounded-lg">
                Sign Up
              </Button>
            </form>
          </div>
  
          {/* Additional Information Section */}
          <div className="text-center mt-6">
            {/* <p>OR CONTINUE WITH</p>
            <button className="bg-red-500 text-white px-4 py-2 mt-4 rounded-md">Google</button>
            <p className="text-gray-500 text-sm mt-4">
              By clicking continue, you agree to our <span className="text-blue-500">Terms of Service</span> and{" "}
              <span className="text-blue-500">Privacy Policy</span>.
            </p> */}
            <p className="text-gray-500 text-sm mt-4">
              Already have an account? <span className="text-blue-500 cursor-pointer">Log in</span>
            </p>
          </div>
  
          <footer className="mt-8 text-center text-gray-500 text-sm">
            © 2025 Sashwat All Rights Reserved.
          </footer>
        </div>
      </div>
    );
};
