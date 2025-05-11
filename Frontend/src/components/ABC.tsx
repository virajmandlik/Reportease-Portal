import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";


// Define roles
const roles = ["Institute Admin", "Coordinator", "Faculty", "Student"];


const AccessControl: React.FC = () => {
  // Initialize state for permissions
  const [permissions, setPermissions] = useState([]);
  const [accessMatrix, setAccessMatrix] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  // Fetch permissions from the API
  const fetchPermissions = async () => {
    const allPermissions = [];
    for (let typeId = 1; typeId <= 4; typeId++) {
      try {
        const response = await fetch(`http://localhost:3000/api/accper/${typeId}`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        console.log('Data:',data);
        allPermissions.push(...data);
      } catch (error) {
        setError(error.message);
      }
    }
    setPermissions(allPermissions);
    setLoading(false);
  };


  useEffect(() => {
    fetchPermissions();
  }, []);


  useEffect(() => {
    if (permissions.length > 0) {
      // Initialize access matrix based on fetched permissions
      const initialMatrix = permissions.map((permission) =>
        roles.reduce((acc, role) => ({ ...acc, [role]: false }), {})
      );
      setAccessMatrix(initialMatrix);
    }
  }, [permissions]);


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


  if (loading) {
    return <div>Loading...</div>;
  }


  if (error) {
    return <div>Error: {error}</div>;
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
              <tr key={permission.permission}>
                <td className="border border-gray-300 px-4 py-2">{permission.permission}</td>
                {roles.map((role) => (
                  <td key={role} className="border border-gray-300 px-4 py-2 text-center">
                    <Checkbox
                      checked={accessMatrix[permissionIndex]?.[role] || false}
                      onChange={() => handleCheckboxChange(permissionIndex, role)}
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




