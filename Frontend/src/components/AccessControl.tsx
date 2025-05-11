import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox"


// Define roles and permissions
const roles = ["Institute Admin", "Coordinator", "Faculty", "Student"];
const permissions = [
  "Modify Institute",
  "Modify Departments",
  "Modify Clubs",
  "Modify Users",
  "Modify Events",
  "Modify Finance",
  "Modify Courses",
  "Modify Infrastructure",
  "Modify Opportunity",
  "Modify Programs",
  "Modify Research Work",
  "Modify Finance"
];


const AccessControl: React.FC = () => {
  // Initialize state for permissions
  const [accessMatrix, setAccessMatrix] = useState(
    () =>
      permissions.map(() =>
        roles.reduce((acc, role) => ({ ...acc, [role]: false }), {})
      )
  );


  // Toggle permission
  const handleCheckboxChange = (permissionIndex: number, role: string) => {
    setAccessMatrix((prevMatrix) => {
      const newMatrix = [...prevMatrix];
      newMatrix[permissionIndex][role] = !newMatrix[permissionIndex][role];
      return newMatrix;
    });
  };


  // Set permissions action
  const handleSetPermissions = () => {
    console.log("Updated Permissions: ", accessMatrix);
    alert("Permissions have been updated successfully!");
  };


  const [isChecked, setIsChecked] = useState(false);


//   useEffect(() => {
//     // Replace with your backend API URL
//     fetch("/api/get-checkbox-status")
//       .then((response) => response.json())
//       .then((data) => {
//         // Assuming the backend returns an object with a field like { checked: true/false }
//         setIsChecked(data.checked)
//       })
//       .catch((error) => {
//         console.error("Error fetching checkbox status:", error)
//       })
//   }, [])


  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setIsChecked(event.target.checked)


  }




  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Access Control</h1>
      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 px-4 py-2 text-left">Permissions</th>
              {roles.map((role) => (
                <th key={role} className="border border-gray-300 px-4 py-2 text-center">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {permissions.map((permission, permissionIndex) => (
              <tr key={permission}>
                <td className="border border-gray-300 px-4 py-2">{permission}</td>
                {roles.map((role) => (
                  <td key={role} className="border border-gray-300 px-4 py-2 text-center">
                    <Checkbox
                        id="terms"
                        // checked={isChecked}
                        // onChange={handleChange}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Button
        onClick={handleSetPermissions}
        className="mt-4 px-4 py-2 bg-blue-500 text-white font-semibold rounded hover:bg-blue-600"
      >
        Set Permissions
      </Button>
    </div>
  );
};


export default AccessControl;




