import { FC, useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import axios from "axios";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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

export const SignUpFormFaculty: FC = () => {
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
      console.log("formData:", formData);
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
      if (response.ok) {
        const data = await response.json();
        alert("Registration successful!");
        navigate("/login");
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
    <Card className="mx-auto h-[90%] max-w-[700px]">
      <CardHeader>
        <CardTitle className="text-2xl">Sign up as Institue Faculty</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSignUp}>
          <div className="grid gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3 mr-3">
                <Label htmlFor="first-name">First Name</Label>
                <div className="mt-2">
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
              </div>
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="last-name">Last Name</Label>
                <div className="mt-2">
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
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3 mr-3">
                <Label htmlFor="email">Email</Label>
                <div className="mt-2">
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
              </div>
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="phonenumber">Phone Number</Label>
                <div className="mt-2">
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
            </div>

            {/* Institute name */}
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="institute">Institute</Label>
                <div className="mt-2">
                  <Select
                    name="institute"
                    value={formData.institute}
                    onValueChange={(value) => {
                      handleChange({ target: { name: "institute", value } });
                      setEnrollmentKey(""); // Clear enrollment key when changing institute
                      fetchDepartments(value); // Fetch departments for the selected institute
                    }}
                  >
                    <SelectTrigger className="w-[315px]">
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
              </div>
            </div>

            {/* Department name */}
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="department">Department</Label>
                <div className="mt-2">
                  <Select
                    name="department"
                    value={formData.department} // Add this to formData state
                    onValueChange={(value) =>
                      handleChange({ target: { name: "department", value } })
                    }
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
            </div>

            {/* Enrollment key input */}
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="enrollment_key">Enrollment Key</Label>
                <div className="mt-2">
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
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="faculty_reg_id">Faculty Registration ID</Label>
                <div className="mt-2">
                  <Input
                    type="text"
                    name="faculty_reg_id"
                    placeholder="Faculty Registration ID"
                    id="faculty_reg_id"
                    value={formData.faculty_reg_id}
                    onChange={handleChange}
                  />
                  {facultyRegIdError && (
                    <p className="text-red-500 text-sm">{facultyRegIdError}</p>
                  )}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex-1 sm:col-span-3 mr-3">
                <Label htmlFor="gender">Gender</Label>
                <div className="mt-2">
                  <Select
                    name="gender"
                    value={formData.gender}
                    onValueChange={(value) =>
                      handleChange({ target: { name: "gender", value } })
                    }
                  >
                    <SelectTrigger className="w-[315px]">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectLabel>Gender</SelectLabel>
                        <SelectItem value="male">Male</SelectItem>
                        <SelectItem value="female">Female</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex-1 sm:col-span-3">
                <Label htmlFor="username">Username</Label>
                <div className="mt-2">
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
            </div>

            <div className="grid gap-2">
              <div className="flex items-center pt-2">
                <Label htmlFor="password">Password</Label>
              </div>
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

            <div className="grid gap-2">
              <div className="flex items-center pt-2">
                <Label htmlFor="confirm_password">Confirm Password</Label>
              </div>
              <Input
                id="confirm_password"
                type="password"
                name="confirm_password"
                required
                value={formData.confirm_password}
                onChange={handleChange}
              />
            </div>
            <Button type="submit">Sign Up</Button>
            <div className="flex items-center">
              <hr className="flex-grow border-t border-gray-300" />
              <h5 className="mx-4 text-gray-500 text-sm">OR CONTINUE WITH</h5>
              <hr className="flex-grow border-t border-gray-300" />
            </div>
            <Button variant="outline">
              <svg role="img" viewBox="0 0 24 24" className="mr-2 h-4 w-4">
                <path
                  fill="currentColor"
                  d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z"
                ></path>
              </svg>
              Google
            </Button>
            {/* <p className="text-xs text-gray-500 text-center">
              By clicking continue, you agree to our{" "}
              <Link to="#" className="text-gray-500 underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              {/* <Link to="#" className="text-gray-500 underline">
                Privacy Policy
              </Link> */}
              .
            </p> */}
          </div>
          <div className="mt-4 text-center text-sm gapy-2">
            Don&apos;t have an account?{" "}
            <Link to="/signup" className="underline">
              Sign up
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  );
};
