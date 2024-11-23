import React, { useState, useEffect } from "react";
import axios from "axios";
import ChatWindow from "../components/ChatWindow";
import useAuthStore from "../zustand/authStore";

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const { token } = useAuthStore();

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5274/api/User/doctors",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        setDoctors(response.data);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, [token]);

  return (
    <div className="min-h-screen flex bg-gray-900">
      {/* Left Side: Doctor List */}
      <div className="w-1/3 p-6 bg-gray-800 overflow-y-auto">
        <h2 className="text-3xl font-semibold text-white mb-6">
          Available Doctors
        </h2>
        <div className="space-y-6">
          {doctors.map((doctor) => (
            <div
              key={doctor.id}
              className={`flex justify-between items-center p-4 rounded-lg cursor-pointer ${
                selectedDoctor?.id === doctor.id ? "bg-blue-700" : "bg-gray-700"
              } hover:bg-blue-600 transition`}
              onClick={() => setSelectedDoctor(doctor)}
            >
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {doctor.name
                    .split(" ")
                    .map((word) => word[0])
                    .join("")}
                </div>
                <span className="text-lg font-medium text-white">
                  {doctor.name} {doctor.surname}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Side: Chat Window */}
      <div className="w-2/3 p-6 bg-gray-900">
        {selectedDoctor ? (
          <ChatWindow selectedDoctor={selectedDoctor} />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <p>Select a doctor to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DoctorList;
