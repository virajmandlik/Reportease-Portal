import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSeparator,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";
import { Input } from "./ui/input";
import { ToastContainer, toast } from 'react-toastify';
export function Verify() {
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { email } = useParams();
  // console.log("email",email);
  const handleChange = (index: number, value: string) => {
    // const newOtp = [...otp];
    // newOtp[index] = value;
    // setOtp(newOtp);


    // Move to the next input if the current one is filled
    if (value && index < otp.length - 1) {
      document.getElementById(`otp-input-${index + 1}`)?.focus();
    }
  };


  const handleVerify = async () => {
    const emailId = email;
    console.log("emailId", emailId);
    // const otpString = otp.join(""); // Join the OTP array into a string
    const response = await fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp, emailId }),
    });


    if (response.ok) {
      const usernameResponse = await fetch(
        "http://localhost:3000/api/get-username",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ emailId }),
        }
      );


      if (usernameResponse.ok) {
        const { username } = await usernameResponse.json();
        // alert(`Welcome, ${username}!`);
        // navigate("/Dashboard/:username"); // Redirect to the dashboard with the username
        toast.success('Login successful!', {
              className: 'custom-toast',
              autoClose: 1000,
              onClose: () => navigate(`/Dashboard/${username}`),
        });
      } else {
        const errorMessage = await response.text();
        setError(errorMessage);


      }
    } else {
      const errorMessage = await response.text();
      setError(errorMessage);
    }
  };


  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-6">
      <div className="bg-white shadow-lg rounded-lg p-8 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-blue-700 mb-4 text-center">
          Verify Your OTP
        </h2>
        <p className="text-gray-500 text-center mb-6">
          Enter the OTP sent to your registered email or phone number.
        </p>
        <Input
          id="otp"
          type="text"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter OTP"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <Button
          onClick={handleVerify}
          className="w-full bg-blue-600 text-white py-2 mt-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-400 focus:outline-none"
        >
          Verify
        </Button>
        <p className="text-center text-sm text-gray-500 mt-4">
          Didn't receive the OTP?{" "}
          <span className="text-blue-600 cursor-pointer hover:underline">
            Resend
          </span>
        </p>
      </div>
    </div>
  );
}




