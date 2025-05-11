import { FC, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import loginImage from "@/assets/Login_Page/login-img-two.svg";

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


export const FacultyRegistration: FC = () => {
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
    faculty_reg_id: "", // Add this line
    department: "",
  });


  const [FirstNameError, setFirstNameError] = useState("");
  const [LastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [enrollmentKey, setEnrollmentKey] = useState("");
  const [enrollmentKeyError, setEnrollmentKeyError] = useState("");
  const [institutes, setInstitutes] = useState<Institute[]>([]);
  const [facultyRegIdError, setFacultyRegIdError] = useState("");
  const [departments, setDepartments] = useState<string[]>([]); // State for departments
  const navigate = useNavigate();
const[isEnrollmentKeyValid,setIsEnrollmentKeyValid] = useState();

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


  const validateForm = () => {
    let isValid = true;


    setFirstNameError("");
    setLastNameError("");
    setEmailError("");
    setPhoneError("");
    setEnrollmentKeyError("");


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
    if (!formData.faculty_reg_id) {
      setFacultyRegIdError("Faculty Registration ID is required.");
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
      console.log("formData while sending is :", formData);
      const response = await fetch(
        "http://localhost:3000/api/register/institute-faculty",
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
            usertype: "3", //faculty
            enrollment_key: enrollmentKey,
            institute: formData.institute,
            faculty_reg_id: formData.faculty_reg_id,
            department: formData.department, // Add this line
          }),
        }
      );
      console.log("response:-", response);
      const email = formData.email;
      if (response.ok) {
        // Navigate to login page instead of OTP verification
        toast.success('Registration successful! Please login.', {
          className: 'custom-toast',
          autoClose: 2000,
          onClose: () => navigate('/login')
        });
      } else {
        const error = await response.text();
        setError(error || "Registration failed!");
      }
    } catch (error: any) {
      console.error("Error during sign-up: ", error.message);
      setEmailError("Error during sign-up. Please try again.");
    }
  };


  return (
    <div className="flex min-h-screen bg-gradient-to-r from-purple-500 to-pink-500">
      {/* Left side with image */}
      <div className="flex-1 flex justify-center items-center">
        <img
          src={loginImage}
          alt="Institute Illustration"
          className="w-[80%] h-[80%] max-w-[400px] max-h-[400px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right side with form */}
      <div className="flex-1 bg-white flex justify-center items-center">
        <Card className="w-full max-w-2xl p-8 shadow-xl rounded-xl  bg-white">
          <CardHeader>
            <CardTitle className="text-3xl font-semibold text-center text-gray-800">
              Sign up as Institute Faculty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="grid gap-4">
                {/* Full Name */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="first_name">First Name</Label>
                    <Input
                      type="text"
                      name="first_name"
                      id="first_name"
                      placeholder="First Name"
                      value={formData.first_name}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_name">Last Name</Label>
                    <Input
                      type="text"
                      name="last_name"
                      id="last_name"
                      placeholder="Last Name"
                      value={formData.last_name}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                </div>

                {/* Email and Phone */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      type="email"
                      name="email"
                      id="email"
                      placeholder="Email"
                      value={formData.email}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="mobile_number">Phone Number</Label>
                    <Input
                      type="text"
                      name="mobile_number"
                      id="mobile_number"
                      placeholder="Phone Number"
                      value={formData.mobile_number}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                </div>

                {/* Institute and Department */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="institute">Institute</Label>
                    <Select
                      name="institute"
                      onValueChange={(value) => {
                      handleChange({ target: { name: "institute", value } });
                      setEnrollmentKey(""); // Clear enrollment key when changing institute
                      fetchDepartments(value); // Fetch departments for the selected institute
                    }}
                      className="mt-2 "
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Institute" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectLabel>Institutes</SelectLabel>
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
                  <div>
                    <Label htmlFor="department">Department</Label>
                    <Select
                    name="department"
                    value={formData.department} // Add this to formData state
                    onValueChange={(value) =>
                      handleChange({ target: { name: "department", value } })
                    }
                  >
                      <SelectTrigger>
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

                {/* Enrollment Key and Registration ID */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="enrollment_key">Enrollment Key of Institute</Label>
                    <Input
                      type="text"
                      name="enrollment_key"
                      id="enrollment_key"
                      placeholder="Enrollment Key of Institute"
                      value={enrollmentKey}
                      onChange={(e) => setEnrollmentKey(e.target.value)}
                      className="mt-2  text-gray-800"
                    />
                     {enrollmentKeyError && (
                    <p className="text-red-500 text-sm">{enrollmentKeyError}</p>
                  )}
                  </div>
                  <div>
                    <Label htmlFor="faculty_reg_id">Faculty Registration ID</Label>
                    <Input
                      type="text"
                      name="faculty_reg_id"
                      id="faculty_reg_id"
                      placeholder="Registration ID"
                      value={formData.faculty_reg_id}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                    {facultyRegIdError && (
                    <p className="text-red-500 text-sm">{facultyRegIdError}</p>
                  )}
                  </div>
                </div>

                {/* Gender and Username */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="gender">Gender</Label>
                    <Select
                      name="gender"
                      value={formData.gender}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "gender", value } })
                    }
                      className="mt-2"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      type="text"
                      name="username"
                      id="username"
                      placeholder="Username"
                      value={formData.username}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                </div>

                {/* Password and Confirm Password */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      type="password"
                      name="password"
                      id="password"
                      placeholder="Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Confirm Password</Label>
                    <Input
                      type="password"
                      name="confirm_password"
                      id="confirm_password"
                      placeholder="Confirm Password"
                      value={formData.confirm_password}
                      onChange={handleChange}
                      className="mt-2  text-gray-800"
                    />
                  </div>
                </div>

                {/* Sign Up Button */}
                <Button
                  type="submit"
                  className="w-full bg-purple-500 text-white hover:bg-purple-600 mt-4"
                >
                  Sign Up
                </Button>

                {/* Google Sign-In */}
                {/* <div className="text-center mt-4">
                  <p className="text-sm font-medium text-gray-500">OR CONTINUE WITH</p>
                  <Button className="mt-2 bg-red-500 hover:bg-red-600 text-white w-full">
                    Google
                  </Button>
                </div> */}
              </div>
            </form>
          </CardContent>

          {/* Footer with Terms and Sign Up link */}
          <div className="text-center mt-6 text-sm text-gray-600">
            {/* <p>
              By clicking continue, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="text-blue-600 hover:underline">
                Privacy Policy
              </a>
            </p> */}
            <p className="mt-2">
              Don't have an account?{" "}
              <a href="/signup" className="text-blue-600 hover:underline">
                Sign up
              </a>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};




