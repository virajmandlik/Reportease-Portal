import { Link, useNavigate } from 'react-router-dom';
import { FC, useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Cookies from 'js-cookie';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import loginImage from "@/assets/Login_Page/login-img-two.svg";


export const LoginForm: FC = () => {
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [formErrors, setFormErrors] = useState({
    username: "",
    password: "",
  });

  // State to toggle registration options
  const [showRegisterOptions, setShowRegisterOptions] = useState(false);

  const validateForm = () => {
    let isValid = true;
    const errors: Record<string, string> = {};

    if (!formData.username.trim()) {
      errors.username = "Username is required.";
      isValid = false;
    }

    if (!formData.password.trim()) {
      errors.password = "Password is required.";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      console.log('Attempting login for:', username);
      const response = await fetch('http://localhost:3000/loginMe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      // First check if response exists before trying to parse JSON
      if (!response) {
        console.error('No response received from server');
        setError('Connection error. Please try again later.');
        toast.error('Connection error!', {
          className: 'custom-toast',
          autoClose: 3000,
        });
        return;
      }

      // Try to parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Error parsing JSON response:', jsonError);
        setError('Server error. Please try again later.');
        toast.error('Server error!', {
          className: 'custom-toast',
          autoClose: 3000,
        });
        return;
      }
      
      if (response.ok) {
        // Success case - save token and navigate
        Cookies.set("token", data.token, { expires: 0.5 });
        console.log("Login successful for:", data.username || username);
        
        toast.success('Login successful!', {
          className: 'custom-toast',
          autoClose: 1000,
          onClose: () => navigate(`/Dashboard/${data.username}`),
        });
      } else {
        // Server returned an error response
        console.error('Login failed:', data.message || 'Unknown error');
        setError(data.message || 'Login failed');
        toast.error(data.message || 'Invalid Credentials!', {
          className: 'custom-toast',
          autoClose: 3000,
        });
      }
    } catch (err) {
      // Network or other errors
      console.error('Login request error:', err);
      setError('An error occurred. Please try again later.');
      toast.error('Network error. Please check your connection.', {
        className: 'custom-toast',
        autoClose: 3000,
      });
    }
  };

  // Handler for toggling registration options
  const handleRegisterClick = () => {
    setShowRegisterOptions((prev) => !prev);
  };

  return (
    <div className="flex flex-row h-screen w-[180rem] ">
      {/* Left Side - Image */}
      <div className="hidden md:flex flex-col items-center justify-center w-1/2 bg-gradient-to-r from-blue-700 to-teal-500 animate_animated animatefadeIn animate_delay-1s h-full ">
        {/* Logo */}
       
        
        {/* Login Illustration */}
        <img
          src={loginImage}
          alt="Login Illustration"
          className="w-[80%] h-[80%] max-w-[400px] max-h-[400px] rounded-lg shadow-lg transform hover:scale-105 transition-transform duration-500"
        />
      </div>

      {/* Right Side - Login Form */}
      <div className="flex items-center justify-center w-full md:w-1/2 bg-white p-10 h-full">
        <div className="w-full max-w-xl shadow-lg rounded-lg p-8 bg-white">
          <h2 className="text-3xl font-bold text-center text-gray-700 mb-6">Login</h2>
          <p className="text-center text-gray-500 mb-6">
            Enter your username and password to log in
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username */}
            <div>
              <Label htmlFor="username">Username</Label>
              <Input
                type="text"
                name="username"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500"
              />
              {formErrors.username && (
                <p className="text-red-500 text-sm">{formErrors.username}</p>
              )}
            </div>

            {/* Password */}
            <div>
  <Label htmlFor="password">Password</Label>
  <div className="relative">
    <Input
      type={passwordVisible ? "text" : "password"}
      name="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="mt-2 transition-all duration-300 ease-in-out focus:ring-2 focus:ring-blue-500 w-full"
    />
    <button
      type="button"
      className="absolute right-2 top-1/2 transform -translate-y-1/2"
      onClick={() => setPasswordVisible(!passwordVisible)}
    >
      {passwordVisible ? (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
  <path strokeLinecap="round" strokeLinejoin="round" d="M10 11l3-3m0 0l-3-3m3 3h6M4 19v1a2 2 0 002 2h12a2 2 0 002-2v-1" />
</svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )}
    </button>
  </div>
  {formErrors.password && (
    <p className="text-red-500 text-sm">{formErrors.password}</p>
  )}
</div>

            {/* Forgot Password Link */}
            <div className="text-right">
              <a href="/forgot-password" className="text-blue-500 hover:underline text-sm">
                Forgot your password?
              </a>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-teal-500 text-white font-bold py-2 px-4 rounded-md shadow-lg hover:bg-gradient-to-l transition-all duration-500"
            >
              Login
            </Button>
          </form>

          {/* Register Link */}
          <div className="text-center my-4">
            <p className="text-gray-500 text-sm">
              Don't have an account?{" "}
              <button
                onClick={handleRegisterClick}
                className="text-blue-500 hover:underline cursor-pointer"
              >
                Register here
              </button>
            </p>
          </div>

          {/* Show Register Options */}
          {showRegisterOptions && (
            <div className="text-center mt-4 space-y-4">
              <button
                className="w-full  text-black py-2 px-4 rounded-md hover:bg-blue-300"
                onClick={() => navigate("/signup/instituteAdmin")}
              >
                Register as Institute
              </button>
              <button
                className="w-full  text-black py-2 px-4 rounded-md hover:bg-blue-300"
                onClick={() => navigate("/signup/faculty")}
              >
                Register as Faculty
              </button>
              <button
                className="w-full  text-black py-2 px-4 rounded-md hover:bg-blue-300"
                onClick={() => navigate("/signup/student")}
              >
                Register as Student
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};