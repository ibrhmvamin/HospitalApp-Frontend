import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import ChatWindow from "../components/ChatWindow";
import useAuthStore from "../zustand/authStore";

const DoctorList = () => {
  const [users, setUsers] = useState([]); // Generic 'users' array for doctors or patients
  const [role, setRole] = useState("");
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const endpoint =
          role === "doctor"
            ? "http://localhost:5274/api/User/patients" // Fetch patients if the user is a doctor
            : "http://localhost:5274/api/User/doctors"; // Fetch doctors if the user is a patient

        const response = await axios.get(endpoint, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUsers(response.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchDoctors();
  }, [token]);

  const decodedToken = jwtDecode(token);
  const userRole =
    decodedToken[
      "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
    ];
  setRole(userRole);

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* User List */}
      <div className="w-1/3 p-6 bg-gray-800 overflow-y-auto">
        <h2 className="text-3xl font-semibold text-white mb-6">
          {role === "doctor" ? "My Patients" : "Available Doctors"}
        </h2>
        <div className="space-y-6">
          {users.map((user) => (
            <div
              key={user.id}
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                selectedUser?.id === user.id ? "bg-blue-700" : "bg-gray-700"
              } hover:bg-blue-600 transition`}
              onClick={() => setSelectedUser(user)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.name.charAt(0)}
                </div>
                <span className="text-lg font-medium text-white">
                  {user.name} {user.surname}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="w-2/3 p-6 bg-gray-900">
        {selectedUser ? (
          <ChatWindow
            selectedDoctor={role === "doctor" ? null : selectedUser}
            selectedPatient={role === "doctor" ? selectedUser : null}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>
              Select a {role === "doctor" ? "patient" : "doctor"} to start
              chatting.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
