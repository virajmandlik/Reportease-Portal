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

export function InputOTPWithSeparator() { 
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const {email} =useParams();
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
    console.log("emailId",emailId);
    // const otpString = otp.join(""); // Join the OTP array into a string
    const response = await fetch("http://localhost:3000/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ otp,emailId}),
    });

    if (response.ok) {
      alert("OTP verified successfully!");
      navigate("/login"); // Redirect to login page
    } else {
      const errorMessage = await response.text();
      setError(errorMessage);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl mb-4">Enter OTP</h2>
      <Input id="otp" type="string" value={otp} onChange={(e)=>{setOtp(e.target.value)}} placeholder="Enter Otp" />
      {error && <p className="text-red-500">{error}</p>}
      <Button onClick={handleVerify} className="mt-4">
        Verify
      </Button>
    </div>
  );
}