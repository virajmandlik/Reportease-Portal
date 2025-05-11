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
import loginImage from "@/assets/Login_Page/register.svg";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SignUpFormAdmin: FC = () => {
  const [formData, setFormData] = useState({
    username: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile_number: "",
    gender: "",
    password: "",
    confirm_password: "",
  });

  const [FirstNameError, setFirstNameError] = useState("");
  const [LastNameError, setLastNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex =
    /^(?=.[a-z])(?=.[A-Z])(?=.\d)(?=.[@$!%?&])[A-Za-z\d@$!%?&]{8,}$/;

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

    // Phone Number Validation
    const phoneRegex = /^\d{10}$/;
    if (!formData.mobile_number || !phoneRegex.test(formData.mobile_number)) {
      setPhoneError("Mobile number must be a 10-digit number.");
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
    // if (!passwordRegex.test(formData.password)) {
    //   setPasswordError(
    //     "Password must include at least 8 characters, an uppercase letter, a lowercase letter, a number, and a special character."
    //   );
    //   return;
    // }

    try {
      // Send user data to your API
      console.log("formData:", formData);
      const response = await fetch(
        "http://localhost:3000/api/register/institute-admin",
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
            usertype: 1,
          }),
        }
      );
      
      console.log("response:-", response);
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
    <div className="flex flex-row min-h-screen bg-gradient-to-r from-purple-600 to-pink-400">
      {/* Left Side - Image */}
      <div className="flex items-center justify-center w-1/2 bg-gradient-to-r from-purple-700 to-pink-500 animate__animated animate__fadeIn">
        <img
          src={loginImage}
          alt="Institute Illustration"
          className="w-[80%] h-[80%] max-w-[400px] max-h-[400px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      </div>
      {/* Right Side - Registration Form */}
      <div className="flex items-center justify-center w-1/2 bg-white p-10 animate__animated animate__fadeIn animate__delay-1s">
        <div className="w-full max-w-xl shadow-lg rounded-lg p-8 bg-white"> {/* Increased width */}
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Sign Up as Institute Admin</h2>
          <form onSubmit={handleSignUp} className="space-y-4">
            {/* First Name and Last Name */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="first_name">First Name</Label>
                <Input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  id="first-name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
              {FirstNameError && (
                    <p className="text-red-500 text-sm">{FirstNameError}</p>
                  )}  </div>
              <div>
                <Label htmlFor="last_name">Last Name</Label>
                <Input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  id="last-name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
             {LastNameError && (
                    <p className="text-red-500 text-sm">{LastNameError}</p>
                  )} </div>
            </div>
            {/* Gender and Username */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="gender">Gender</Label>
                <Select
                  name="gender"
                  onValueChange={(value) =>
                    handleChange({ target: { name: "gender", value } })
                  }
                  value={formData.gender}
                  className="mt-2 w-full border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-purple-500"
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="username">Username</Label>
                <Input
                  type="text"
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleChange}
                   id="username"
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
            {/* Email and Phone Number */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  type="email"
                  name="email"
                  placeholder="Email"
                  id="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
                {emailError && (
                    <p className="text-red-500 text-sm">{emailError}</p>
                  )} </div>
              <div>
                <Label htmlFor="mobile_number">Phone Number</Label>
                <Input
                  type="text"
                  name="mobile_number"
                  placeholder="Phone Number"
                  id="phonenumber"
                  value={formData.mobile_number}
                  onChange={handleChange}
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
              {phoneError && (
                    <p className="text-red-500 text-sm">{phoneError}</p>
                  )}
                   </div>
            </div>
            {/* Password and Confirm Password */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  type="password"
                  name="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
           {passwordError && (
                <p className="text-red-500 text-sm">{passwordError}</p>
              )}    </div>
              <div>
                <Label htmlFor="confirm_password">Confirm Password</Label>
                <Input
                 id="confirm_password"
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm Password"
                  value={formData.confirm_password}
                  onChange={handleChange}
                  className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div> <br />
            {/* Sign Up Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-gradient-to-l transition-all duration-500"
            >
              Sign Up
            </Button>
          </form>
          {/* OR Continue with Google */}
          <div className="text-center my-4">
            {/* <p className="text-gray-500">OR CONTINUE WITH</p>
            <Button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-blue-700 mt-2">
              Google
            </Button> */}
          </div>
          {/* Terms and Sign In Link */}
          {/* <p className="text-center text-gray-500 text-sm">
            By signing up, you agree to our{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Terms & Conditions
            </a>{" "}
            and{" "}
            <a href="#" className="text-blue-600 hover:underline">
              Privacy Policy
            </a>.
          </p> */}
          <p className="text-center text-sm mt-2">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline">
              Sign In
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
