import { useState, useEffect } from "react";
import axios from "axios";
import useAuthStore from "../zustand/authStore";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const NewAppointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctorId, setSelectedDoctorId] = useState("");
  const [appointmentTime, setAppointmentTime] = useState("");
  const { token } = useAuthStore();
  const navigate = useNavigate();

  // Fetch list of doctors (example endpoint)
  useEffect(() => {
    if (!token) navigate("/login");
    const fetchDoctors = async () => {
      const { data } = await axios.get(
        "http://localhost:5274/api/User/doctors",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setDoctors(data);
    };
    fetchDoctors();
  }, [token]);

  // Function to format the date to dd-MM-yyyy HH:mm
  const formatDateTime = datetime => {
    const date = new Date(datetime);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${day}-${month}-${year} ${hours}:${minutes}`;
  };

  const handleAppointmentSubmit = async e => {
    e.preventDefault();

    // Format the appointment time
    const formattedTime = formatDateTime(appointmentTime);

    // Prepare payload
    const appointmentData = {
      startTime: formattedTime,
      doctorId: selectedDoctorId,
    };

    console.log(appointmentData);

    try {
      // Send the POST request to backend
      await axios.post(
        "http://localhost:5274/api/Appointment",
        appointmentData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      navigate("/");
      toast.success("Appointment successfully created!");
    } catch (error) {
      console.error("Error creating appointment", error);

      const { message } = error.response.data;
      if (message) toast.error(`Error: ${message}`);
      else toast.error(error.response.data.title);
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
      <div className="bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-2xl font-bold mb-6">Schedule New Appointment</h2>

        <form onSubmit={handleAppointmentSubmit}>
          {/* Doctor Selection */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Doctor
            </label>
            <select
              value={selectedDoctorId}
              onChange={e => setSelectedDoctorId(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            >
              <option value="">Select a doctor</option>
              {doctors.map(doctor => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.name}
                </option>
              ))}
            </select>
          </div>

          {/* Appointment Time */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Appointment Time
            </label>
            <input
              type="datetime-local"
              value={appointmentTime}
              onChange={e => setAppointmentTime(e.target.value)}
              className="w-full bg-gray-700 text-white p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition duration-300"
          >
            Submit and continue
          </button>
        </form>
      </div>
    </div>
  );
};

export default NewAppointment;
