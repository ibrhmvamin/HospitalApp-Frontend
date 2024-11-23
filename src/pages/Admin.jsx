import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "./../zustand/authStore";
import { jwtDecode } from "jwt-decode";

const Admin = () => {
  const [doctors, setDoctors] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [currentEdit, setCurrentEdit] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  const { token, logout } = useAuthStore();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false); // Dropdown state
  const navigate = useNavigate();

  const toggleSettings = () => {
    setIsSettingsOpen((prev) => !prev);
  };

  useEffect(() => {
    if (!token) return navigate("/login");
    const decodedToken = jwtDecode(token);
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    if (userRole !== "admin") return navigate("/");
  }, [token]);

  // Fetch doctors from the API
  const fetchDoctors = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        "http://localhost:5274/api/user/doctors"
      );
      console.log(response.data);
      setDoctors(response.data);
    } catch (error) {
      toast.error("Failed to fetch doctors");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const response = await axios.get(
        "http://localhost:5274/api/User/patients",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setUsers(response.data);
    } catch (error) {
      toast.error("Failed to fetch users");
    } finally {
      setIsLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
    fetchUsers();
  }, []);

  // Edit a doctor
  const handleEditDoctor = (doctor) => {
    setCurrentEdit(doctor);
    setShowEditModal(true);
  };

  const handleEditUser = (user) => {
    setCurrentEdit(user);
    setShowEditModal(true);
  };

  // Delete a doctor
  const handleDeleteDoctor = async (doctorId) => {
    if (window.confirm("Are you sure you want to delete this doctor?")) {
      try {
        await axios.delete(
          `http://localhost:5274/api/user/doctors/${doctorId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        toast.success("Doctor deleted successfully");
        setDoctors(doctors.filter((doctor) => doctor.id !== doctorId));
      } catch (error) {
        toast.error("Failed to delete doctor");
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm("Are you sure you want to delete this user?")) {
      try {
        await axios.delete(`http://localhost:5274/api/user/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        toast.success("User deleted successfully");
        setUsers(users.filter((user) => user.id !== userId));
      } catch (error) {
        toast.error("Failed to delete user");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl text-white font-bold">Admin Dashboard</h1>
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
              <Link
                to="/add-doctor"
                className="block w-full text-left px-4 py-2 bg-white transition"
              >
                Add Doctor
              </Link>
              <button
                onClick={() => logout()}
                className="block w-full text-left px-4 py-2 bg-white transition"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>

      <div>
        <h2 className="text-2xl text-white font-bold mb-4 text-center p-3">
          Doctors
        </h2>
        {isLoading ? (
          <p className="text-center text-white">Loading doctors...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className="bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <img
                  src={
                    `http://localhost:5274/${doctor.profile}` || "/profile.webp"
                  }
                  alt={`${doctor.name}'s profile`}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
                />
                <h2 className="text-xl text-white font-bold">
                  {"Dr." + doctor.name + " " + doctor.surname}
                </h2>
                <p className="text-gray-400">Email: {doctor.email}</p>
                {/* <div className="mt-4 text-gray-300">
                <p>
                  Accepted Appointments:{" "}
                  {doctor.statuses.filter((s) => s === "ACCEPTED").length || ""}
                </p>
                <p>
                  Pending Appointments:{" "}
                  {doctor.statuses.filter((s) => s === "PENDING").length || ""}
                </p>
                <p>
                  Rejected Appointments:{" "}
                  {doctor.statuses.filter((s) => s === "REJECTED").length || ""}
                </p>
                <p>Total Appointments: {doctor.statuses.length}</p>
              </div> */}
                <div className="flex justify-around mt-6">
                  <button
                    onClick={() => handleEditDoctor(doctor)}
                    className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDeleteDoctor(doctor.id)}
                    className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600 transition"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Users Section */}
        <h2 className="text-2xl text-white font-bold mb-4 text-center p-10">
          Users
        </h2>
        {isLoadingUsers ? (
          <p className="text-center text-white">Loading users...</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {users.map((user) => (
              <div
                key={user.id}
                className="bg-gray-800 p-6 rounded-lg shadow-md text-center"
              >
                <img
                  src={
                    `http://localhost:5274/${user.profile}` || "/profile.webp"
                  }
                  alt={`${user.name}'s profile`}
                  className="w-24 h-24 mx-auto rounded-full object-cover mb-4"
                />
                <h2 className="text-xl text-white font-bold">
                  {user.name + " " + user.surname}
                </h2>
                <p className="text-gray-400">Email: {user.email}</p>
                <div className="flex justify-around mt-6">
                  <button
                    onClick={() => handleEditUser(user)}
                    className="bg-blue-500 text-white py-1 px-4 rounded-md hover:bg-blue-600 transition"
                  >
                    Edit
                  </button>

                  <button
                    className="bg-red-500 text-white py-1 px-4 rounded-md hover:bg-red-600 transition"
                    onClick={() => handleDeleteUser(user.id)}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Admin;
