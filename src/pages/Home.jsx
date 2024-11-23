import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../zustand/authStore";
import axios from "axios";
import formatDate from "./../utils/formatDate";
import getDate from "./../utils/getDate";
import capitalizeFirstLetter from "./../utils/capitalizeFirstLetter";
import { jwtDecode } from "jwt-decode";
import toast from "react-hot-toast";
import { HubConnectionBuilder } from "@microsoft/signalr";

const Home = () => {
  const [appointments, setAppointments] = useState([]);
  const [role, setRole] = useState("");
  const [connection, setConnection] = useState(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Dropdown state

  const { token, logout } = useAuthStore();
  const navigate = useNavigate();

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (role === "admin") navigate("/admin");
  }, [role]);

  useEffect(() => {
    if (!token) {
      navigate("/login");
      return;
    }

    const decodedToken = jwtDecode(token);
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    setRole(userRole);

    const newConnection = new HubConnectionBuilder()
      .withUrl("http://localhost:5274/appointmentHub", {
        accessTokenFactory: () => token,
        withCredentials: true,
      })
      .withAutomaticReconnect()
      .build();

    setConnection(newConnection);
  }, [token]);

  useEffect(() => {
    if (connection) {
      connection
        .start()
        .then(() => {
          console.log("Connected to SignalR!");

          connection.on("ReceiveStatusUpdate", (appointmentId, status) => {
            toast.success(`Appointment status updated to: ${status}`);
            const newAppointments = [...appointments];
            newAppointments.forEach((a) => {
              if (a.id === appointmentId) a.status = status;
            });
            setAppointments(newAppointments);
          });
        })
        .catch((err) => console.log("Error while connecting to SignalR", err));
    }
  }, [connection]);

  useEffect(() => {
    const getAppointments = async () => {
      const { data } = await axios.get(
        "http://localhost:5274/api/Appointment",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments(data);
    };
    getAppointments();
  }, [token]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleStatusChange = async (appointmentId, newStatus) => {
    try {
      await axios.put(
        `http://localhost:5274/api/Appointment/${appointmentId}?status=${newStatus}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment.id === appointmentId
            ? { ...appointment, status: newStatus }
            : appointment
        )
      );
      toast.success("Status updated successfully");
    } catch (error) {
      toast.error("Error updating appointment status", error);
      console.log(error);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900">
      {/* Sidebar */}
      <div className="w-full md:w-1/4 bg-gray-800 text-white p-6">
        <h1 className="text-3xl font-bold mb-8">Hospital App</h1>

        {role === "member" && (
          <Link
            to="/new-appointment"
            className="inline-block text-center transition-all bg-green-500 w-full py-2 mb-4 text-lg rounded hover:bg-green-700"
          >
            + New Appointment
          </Link>
        )}

        <div className="space-y-4 mt-8">
          {appointments.map((appointment) => (
            <div key={appointment.id} className="bg-gray-700 p-4 rounded-lg">
              <p>
                <strong>Date:</strong> {formatDate(appointment.startTime).date}
              </p>
              <p>
                <strong>Time:</strong> {formatDate(appointment.startTime).time}{" "}
                - {formatDate(appointment.endTime).time}
              </p>
              {console.log(appointment.startTime)}
              <p>
                <strong>Status:</strong>{" "}
                {capitalizeFirstLetter(appointment.status)}
              </p>
              <p>
                {role === "doctor" ? (
                  <>
                    <strong>Patient:</strong> {appointment.patientName}{" "}
                    {appointment.patientSurname}
                  </>
                ) : (
                  <>
                    <strong>Doctor:</strong> {appointment.doctorName}{" "}
                    {appointment.doctorSurname}
                  </>
                )}
              </p>

              {role === "doctor" &&
                getDate(appointment.startTime) > new Date() && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Change Status
                    </label>
                    <select
                      value={appointment.status}
                      onChange={(e) =>
                        handleStatusChange(appointment.id, e.target.value)
                      }
                      className="bg-gray-600 text-white rounded-lg p-2 w-full"
                    >
                      <option value="PENDING">Pending</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="REJECTED">Rejected</option>
                    </select>
                  </div>
                )}

              {role === "member" &&
                getDate(appointment.startTime) > new Date() && (
                  <button
                    className="mt-2 bg-blue-500 text-white py-1 px-4 rounded hover:bg-blue-700"
                    onClick={() =>
                      handleOpenChat(
                        `${appointment.doctorName} ${appointment.doctorSurname}`
                      )
                    }
                  >
                    Chat with {appointment.doctorName}{" "}
                    {appointment.doctorSurname}
                  </button>
                )}
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full md:w-3/4 p-6 bg-gray-900 text-white">
        <h2 className="text-2xl font-bold mb-6">Your Appointments</h2>
        <div className="space-y-4">
          {appointments.map((appointment) => (
            <div
              key={appointment.id}
              className="p-4 bg-gray-800 rounded-lg shadow"
            >
              <h3 className="text-xl font-bold">{appointment.doctor}</h3>
              <p>
                {formatDate(appointment.startTime).date} at{" "}
                {formatDate(appointment.startTime).time}
              </p>
              <p>
                Status:{" "}
                <span
                  className={`font-bold ${
                    appointment.status === "ACCEPTED"
                      ? "text-green-500"
                      : appointment.status === "PENDING"
                      ? "text-yellow-500"
                      : "text-red-500"
                  }`}
                >
                  {capitalizeFirstLetter(appointment.status)}
                </span>
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="fixed top-4 right-4">
        <button
          onClick={toggleSettings}
          className="bg-blue-500 p-3 rounded-full hover:bg-blue-700 transition"
        >
          ⚙️
        </button>

        {/* Dropdown Menu */}
        {isSettingsOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white-800 rounded shadow-lg">
            <Link
              to="/profile"
              className="block w-full text-left px-4 py-2 bg-white transition"
            >
              My Profile
            </Link>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 bg-white transition"
            >
              Log Out
            </button>
          </div>
        )}
      </div>
      <div></div>
      <div className="fixed my-6 bottom-6 right-6">
        <Link
          to="/doctors-chat"
          className="bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition"
        >
          💬 Chat
        </Link>
      </div>
    </div>
  );
};

export default Home;
