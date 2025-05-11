import React, { useState, useEffect, ReactNode } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Navigate, useNavigate} from "react-router-dom";
import { User } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircleIcon, PencilIcon } from "@heroicons/react/24/solid"; // For icons
import { motion } from "framer-motion"; // For animations
// // @ts-ignore
// import { XIcon } from '@heroicons/react/solid';
interface User {
  [x: string]: ReactNode;
  userId: string | null;
  photoURL: string | null;
  first_name: string | null;
  last_name: string | null;
  email: string | null;
  username: string | null;
  institute_id: string | null;
  mobile: string | null;
  type_id: number | null; // Added type_id for user role
}

interface ProfileProps {
  user: User;
  onClose: () => void;
  updateUserPhoto: (photoURL: string) => void;
}

const Profile: React.FC<ProfileProps> = ({
  user,
  onClose,
  updateUserPhoto,
}) => {
  const { username } = useParams<{ username: string }>();
  const location = useLocation();
  const userid = location.state?.userid;
  // const { userid } = useParams<{ userid: string }>();
  const [activeSection, setActiveSection] = useState("photo");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [securitySubSection, setSecuritySubSection] = useState<string | null>(
    null
  );
  const [uploadStatus, setUploadStatus] = useState<string | null>(null); // Upload status message
  const [personalInfo, setPersonalInfo] = useState<User | null>(null); // State for personal information
  const [isEditing, setIsEditing] = useState(false); // State for edit mode
  const [updatedInfo, setUpdatedInfo] = useState({
    first_name: "",
    last_name: "",
    username: "",
  }); // State for updated information

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const Navigate = useNavigate();
  const handleClose = () => {
    Navigate("/dashboard/" + user.username); // Redirect to dashboard
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    console.log(userid);
    setUploading(true);
    const formData = new FormData();
    formData.append("photo", selectedFile);
    formData.append("userid", String(userid)); // Correct key
    // console.log("User ID being sent:", user.userid);
    // formData.append("userId", String(user.userid));
    console.log("User ID being sent:", userid);

    try {
      const response = await axios.post(
        "http://localhost:3000/api/upload-profile-photo",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );

      // const { photoURL }= response.data.url; // Access the photoURL from the response
      console.log(response.data.url);
      // updateUserPhoto(photoURL);
      updateUserPhoto(response.data.url);
      setUploadStatus("Profile photo updated successfully!");
    } catch (error) {
      console.error("Failed to upload photo:", error);
      setUploadStatus("Failed to upload photo. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const fetchPersonalInfo = async () => {
    try {
      const response = await axios.get(
        `http://localhost:3000/api/user/${userid}`
      );
      setPersonalInfo(response.data);
      setUpdatedInfo({
        first_name: response.data.first_name || "",
        last_name: response.data.last_name || "",
        username: response.data.username || "",
      });
    } catch (error) {
      console.error("Failed to fetch personal information:", error);
    }
  };

  const [isSaving, setIsSaving] = useState(false);

  const handleUpdateInfo = async () => {
    setIsSaving(true);
    try {
      const response = await axios.put(
        `http://localhost:3000/api/user/${userid}`,
        {
          first_name: updatedInfo.first_name,
          last_name: updatedInfo.last_name,
          username: updatedInfo.username,
        }
      );
      alert("Personal information updated successfully!");
      setPersonalInfo(response.data);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update personal information:", error);
      alert("Failed to update personal information. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdatePassword = async () => {
    const userId = userid; // Replace this with the logged-in user's ID
    console.log("userId is ", userId);
    const currentPassword = document.querySelector(
      'input[placeholder="Current Password"]'
    ).value;
    const newPassword = document.querySelector(
      'input[placeholder="New Password"]'
    ).value;
    const confirmPassword = document.querySelector(
      'input[placeholder="Confirm New Password"]'
    ).value;

    if (newPassword !== confirmPassword) {
      alert("New password and confirm password do not match.");
      return;
    }
    console.log("newPassword is ", newPassword);
    console.log("currentPassword is ", currentPassword);
    console.log("userId is ", userId);
    try {
      const response = await fetch(
        "http://localhost:3000/api/updatepassword",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, currentPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
      } else {
        alert(data.error || "Failed to update password.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const [otp, setOtp] = useState("");
  const [email, setEmail] = useState("");
  // const [userId, setUserId] = useState("");

  const handleSendResetLink = async () => {
    const userId = userid; // Replace this with the logged-in user's ID
    console.log("userId is ", userId);
    try {
      const response = await fetch("http://localhost:3000/send-reset-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }), // Replace userId dynamically based on logged-in user
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP sent to your email.");
        setEmail(data.email); // Store email for later use
        setSecuritySubSection("verifyOtp"); // Move to OTP verification
      } else {
        alert(data.error || "Failed to send reset link.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleVerifyOtp = async () => {
    const userId = userid;
    try {
      const response = await fetch("http://localhost:3000/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, otp }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("OTP verified.");
        setSecuritySubSection("resetPassword"); // Move to new password step
      } else {
        alert(data.error || "Invalid OTP.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleResetPassword = async () => {
    const newPassword = document.querySelector(
      'input[placeholder="New Password"]'
    ).value;
    const confirmPassword = document.querySelector(
      'input[placeholder="Confirm Password"]'
    ).value;

    const userId = userid;

    if (newPassword !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3000/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message);
        setSecuritySubSection("initial"); // Reset back to initial step
      } else {
        alert(data.error || "Failed to reset password.");
      }
    } catch (error) {
      console.error(error);
      alert("An error occurred. Please try again.");
    }
  };

  const handleDeleteAccount = async () => {
    const userId = userid;
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this account?"
    );

    if (confirmDelete) {
      try {
        const response = await fetch(
          "http://localhost:3000/api/delete-account",
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ userId }),
          }
        );

        if (response.ok) {
          alert("Account deleted successfully.");
          // Redirect or perform further actions here
          Navigate("/login");
        } else {
          const errorData = await response.json();
          alert(`Failed to delete account: ${errorData.message}`);
        }
      } catch (error) {
        alert("An error occurred. Please try again.");
        console.error("Error deleting account:", error);
      }
    }
  };

  useEffect(() => {
    if (activeSection === "info") {
      fetchPersonalInfo();
    }
  }, [activeSection]);
  // onOpenChange={onClose} onClose={handleClose}
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-2x2">
        <DialogHeader>
          <DialogTitle>Profile Settings</DialogTitle>
        </DialogHeader>

        {/* Navigation Buttons */}
        <div className="flex justify-around mb-4">
          <Button
            variant={activeSection === "photo" ? "default" : "outline"}
            onClick={() => setActiveSection("photo")}
          >
            Profile Photo
          </Button>
          <Button
            variant={activeSection === "info" ? "default" : "outline"}
            onClick={() => setActiveSection("info")}
          >
            Personal Information
          </Button>
          <Button
            variant={activeSection === "security" ? "default" : "outline"}
            onClick={() => setActiveSection("security")}
          >
            Security
          </Button>
          <Button
            variant={activeSection === "account" ? "default" : "outline"}
            onClick={() => setActiveSection("account")}
          >
            Account
          </Button>
        </div>

        {/* Content Section */}
        <div className="mt-4">
          {activeSection === "photo" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Update Profile Photo
              </h3>
              <div className="mb-4">
                {preview ? (
                  <img
                    src={preview}
                    alt="Profile Preview"
                    className="h-24 w-24 rounded-full"
                  />
                ) : (
                  <img
                    src={user.photoURL || "/default-avatar.png"}
                    alt="Profile Avatar"
                    className="h-24 w-24 rounded-full"
                  />
                )}
              </div>
              <div>
                <h2>Upload Profile Photo</h2>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                />
                <button onClick={handleUpload} disabled={uploading}>
                  {uploading ? "Uploading..." : "Upload Photo"}
                </button>
                {uploadStatus && <p>{uploadStatus}</p>}
              </div>
            </div>
          )}

          {activeSection === "info" && personalInfo && (
            <Card className="max-w-3xl mx-auto p-8 bg-white shadow-md rounded-lg border border-gray-200">
              <CardHeader className="flex justify-between items-center">
                <CardTitle className="text-3xl text-gray-900 font-bold">
                  <CheckCircleIcon className="inline-block h-8 w-8 text-green-500 mr-2" />
                  Personal Information
                </CardTitle>
                <PencilIcon
                  className="h-6 w-6 text-gray-500 cursor-pointer hover:text-gray-800 transition-all"
                  onClick={() => setIsEditing(true)}
                />
              </CardHeader>

              <Separator className="my-6" />

              <CardContent>
                {isEditing ? (
                  <motion.div
                    className="space-y-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    {/* First Name */}
                    <div>
                      <label
                        htmlFor="first_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        First Name
                      </label>
                      <Input
                        id="first_name"
                        type="text"
                        placeholder="Enter your first name"
                        value={updatedInfo.first_name}
                        onChange={(e) =>
                          setUpdatedInfo({
                            ...updatedInfo,
                            first_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label
                        htmlFor="last_name"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Last Name
                      </label>
                      <Input
                        id="last_name"
                        type="text"
                        placeholder="Enter your last name"
                        value={updatedInfo.last_name}
                        onChange={(e) =>
                          setUpdatedInfo({
                            ...updatedInfo,
                            last_name: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Username */}
                    <div>
                      <label
                        htmlFor="username"
                        className="block text-sm font-medium text-gray-700"
                      >
                        Username
                      </label>
                      <Input
                        id="username"
                        type="text"
                        placeholder="Enter your username"
                        value={updatedInfo.username}
                        onChange={(e) =>
                          setUpdatedInfo({
                            ...updatedInfo,
                            username: e.target.value,
                          })
                        }
                      />
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4">
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="default"
                          onClick={handleUpdateInfo}
                          disabled={isSaving}
                          className="py-3 px-6 bg-green-500 text-white hover:bg-green-600 transition-all"
                        >
                          {isSaving ? "Saving..." : "Save Changes"}
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Button
                          variant="outline"
                          onClick={() => setIsEditing(false)}
                          className="py-3 px-6 border-gray-300 hover:border-gray-500 hover:bg-gray-100 transition-all"
                        >
                          Cancel
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    className="space-y-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <p className="text-gray-700">
                        <strong className="text-gray-900">First Name:</strong>{" "}
                        {personalInfo.first_name}
                      </p>
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Last Name:</strong>{" "}
                        {personalInfo.last_name}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Username:</strong>{" "}
                        {personalInfo.username}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Email:</strong>{" "}
                        {personalInfo.email_id}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong className="text-gray-900">
                          Mobile Number:
                        </strong>{" "}
                        {personalInfo.mobile_number}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-700">
                        <strong className="text-gray-900">Role:</strong>{" "}
                        {getRoleName(personalInfo.type_id)}
                      </p>
                    </div>

                    {/* Edit Button */}
                    <div className="text-center mt-6">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <Button
                          variant="default"
                          onClick={() => setIsEditing(true)}
                          className="py-3 px-6 bg-blue-500 text-white hover:bg-blue-600 transition-all"
                        >
                          Edit Information
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          )}

          {/* {activeSection === "security" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              {!securitySubSection && (
                <div className="mb-4">
                  <Button
                    className="mb-2"
                    onClick={() => setSecuritySubSection("updatePassword")}
                  >
                    Update Password
                  </Button>
                  <Button
                    className="mb-2"
                    variant="outline"
                    onClick={() => setSecuritySubSection("initial")} // Reset to initial state
                  >
                    Reset Password
                  </Button>
                </div>
              )}

              {securitySubSection === "updatePassword" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">
                    Update Password
                  </h4>
                  <Input
                    type="password"
                    placeholder="Current Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    className="mb-4"
                  />
                  <Button onClick={handleUpdatePassword}>
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection(null)}
                  >
                    Back
                  </Button>
                </div>
              )}

              {securitySubSection === "initial" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Reset Password</h4>
                  <p className="mb-4">
                    If you have forgotten your password, you can reset it by
                    clicking the button below. An Otp will be sent to your
                    registered email.
                  </p>
                  <Button onClick={handleSendResetLink}>Send Reset Link</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection(null)}
                  >
                    Back
                  </Button>
                </div>
              )}
              {securitySubSection === "verifyOtp" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Verify OTP</h4>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mb-4"
                  />
                  <Button onClick={handleVerifyOtp}>Verify OTP</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection("initial")}
                  >
                    Back
                  </Button>
                </div>
              )}
              {securitySubSection === "resetPassword" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">
                    Set New Password
                  </h4>
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    className="mb-4"
                  />
                  <Button onClick={handleResetPassword}>Reset Password</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection("initial")}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          )} */}

          {activeSection === "security" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Security Settings</h3>
              {!securitySubSection && (
                <div className="mb-4">
                  <Button
                    className="mb-2"
                    onClick={() => setSecuritySubSection("updatePassword")}
                  >
                    Update Password
                  </Button>
                  <Button
                    className="mb-2"
                    variant="outline"
                    onClick={() => setSecuritySubSection("initial")} // Reset to initial state
                  >
                    Reset Password
                  </Button>
                </div>
              )}

              {securitySubSection === "updatePassword" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">
                    Update Password
                  </h4>
                  <Input
                    type="password"
                    placeholder="Current Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm New Password"
                    className="mb-4"
                  />
                  <Button onClick={handleUpdatePassword}>
                    Update Password
                  </Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection(null)}
                  >
                    Back
                  </Button>
                </div>
              )}

              {securitySubSection === "initial" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Reset Password</h4>
                  <p className="mb-4">
                    If you have forgotten your password, you can reset it by
                    clicking the button below. An Otp will be sent to your
                    registered email.
                  </p>
                  <Button onClick={handleSendResetLink}>Send Reset Link</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection(null)}
                  >
                    Back
                  </Button>
                </div>
              )}
              {securitySubSection === "verifyOtp" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">Verify OTP</h4>
                  <Input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    className="mb-4"
                  />
                  <Button onClick={handleVerifyOtp}>Verify OTP</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection("initial")}
                  >
                    Back
                  </Button>
                </div>
              )}
              {securitySubSection === "resetPassword" && (
                <div>
                  <h4 className="text-md font-semibold mb-2">
                    Set New Password
                  </h4>
                  <Input
                    type="password"
                    placeholder="New Password"
                    className="mb-2"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    className="mb-4"
                  />
                  <Button onClick={handleResetPassword}>Reset Password</Button>
                  <Button
                    variant="outline"
                    className="mt-2"
                    onClick={() => setSecuritySubSection("initial")}
                  >
                    Back
                  </Button>
                </div>
              )}
            </div>
          )}

          {activeSection === "account" && (
            <div>
              <h3 className="text-lg font-semibold mb-2">Account</h3>
              <p>Manage your account settings here.</p>
              <button
                onClick={handleDeleteAccount}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Delete Account
              </button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const getRoleName = (typeId: number | null) => {
  switch (typeId) {
    case 0:
      return "appAdmin";
    case 1:
      return "Admin";
    case 2:
      return "Coordinator";
    case 3:
      return "Faculty";
    case 4:
      return "Student";
    default:
      return "Unknown";
  }
};

const handleUpdatePassword = async () => {
  try {
    const currentPassword = document.querySelector(
      'input[placeholder="Current Password"]'
    )?.value;
    const newPassword = document.querySelector(
      'input[placeholder="New Password"]'
    )?.value;
    const confirmPassword = document.querySelector(
      'input[placeholder="Confirm New Password"]'
    )?.value;

    if (!currentPassword || !newPassword || !confirmPassword) {
      alert("Please fill in all the fields.");
      return;
    }

    if (newPassword !== confirmPassword) {
      alert("New Password and Confirm Password do not match.");
      return;
    }

    const response = await axios.put(
      `http://localhost:3000/api/update-password`,
      {
        userId: userid,
        currentPassword,
        newPassword,
      }
    );

    alert("Password updated successfully!");
  } catch (error) {
    console.error("Failed to update password:", error);
    alert("Failed to update password. Please try again.");
  }
};

const handleResetPassword = async () => {
  try {
    const response = await axios.post(
      `http://localhost:3000/api/reset-password`,
      { email: User.email }
    );
    alert("Password reset link sent to your registered email.");
  } catch (error) {
    console.error("Failed to send reset link:", error);
    alert("Failed to send reset link. Please try again.");
  }
};

export default Profile;
