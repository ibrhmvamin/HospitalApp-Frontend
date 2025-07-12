import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";
import useAuthStore from "../zustand/authStore";

const Profile = () => {
  const [user, setUser] = useState({
    name: "",
    surname: "",
    email: "",
    profile: "",
    description: "",
    birthDate: "",
    role: "",
  });

  const { token } = useAuthStore();
  const navigate = useNavigate();
  const formatDateForInput = (dateString) => {
    const [day, month, year] = dateString.split(" ")[0].split("-");
    return `${year}-${month}-${day}`;
  };

  useEffect(() => {
    if (!token) {
      toast.error("You are not authenticated. Redirecting to login.");
      navigate("/login");
    }
  }, [token, navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5274/api/User/profile",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser({
          name: data.name || "",
          surname: data.surname || "",
          email: data.email || "",
          profile: data.profile || "",
          description: data.description || "",
          birthDate: data.birthDate ? formatDateForInput(data.birthDate) : "",
          role: data.role || "",
        });
      } catch (error) {
        toast.error("Failed to fetch profile details. Please try again.");
        console.error("Error fetching profile:", error);
      }
    };

    if (token) fetchProfile();
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUser((prev) => ({
      ...prev,
      [name]: value ?? "",
    }));
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("name", user.name);
      formData.append("surname", user.surname);
      formData.append("birthDate", user.birthDate);
      formData.append("email", user.email);

      if (user.profile && user.profile instanceof File) {
        formData.append("profile", user.profile);
      }

      if (user.role === "doctor") {
        formData.append("description", user.description);
      }

      await axios.put(
        "http://localhost:5274/api/User/update-profile",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      console.error("Error updating profile:", error);
    }
  };

  const handleProfileImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setUser((prev) => ({ ...prev, profile: file }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex items-center justify-center bg-gray-900">
      <div className="bg-white w-2/3 max-w-4xl rounded-lg shadow-lg overflow-hidden">
        {/* Profile Header */}
        <div className="flex flex-col items-center py-8 bg-gradient-to-r from-blue-400 to-purple-400 text-white">
          {user.profile && typeof user.profile === "string" ? (
            <img
              src={`http://localhost:5274/${user.profile}`}
              alt="Profile"
              className="w-24 h-24 rounded-full mb-4 border-4 border-white shadow-lg object-cover"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-300 mb-4 flex items-center justify-center">
              <span className="text-gray-600">No Image</span>
            </div>
          )}

          <h2 className="text-2xl font-bold">
            {user.name || "User"} {user.surname}
          </h2>
          <p className="text-sm">{user.email}</p>
        </div>

        {/* Profile Form */}
        <div className="p-8">
          <h3 className="text-xl font-semibold text-gray-700 mb-4 text-center">
            Edit Profile
          </h3>
          <div className="grid grid-cols-2 gap-6">
            {/* Name */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={user.name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Surname */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Surname
              </label>
              <input
                type="text"
                name="surname"
                value={user.surname}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={user.email}
                onChange={handleInputChange}
                // readOnly
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Profile Picture */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Profile Picture
              </label>
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>

            {/* Description (Doctor Only) */}
            {user.role === "doctor" && (
              <div>
                <label className="block text-gray-600 font-medium mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={user.description}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded focus:ring focus:ring-blue-300"
                />
              </div>
            )}

            {/* Birth Date */}
            <div>
              <label className="block text-gray-600 font-medium mb-1">
                Birth Date
              </label>
              <input
                type="date"
                name="birthDate"
                value={user.birthDate}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded focus:ring focus:ring-blue-300"
              />
            </div>

            {/* Role */}
            {/* <div>
              <label className="block text-gray-600 font-medium mb-1">
                Role
              </label>
              <input
                type="text"
                name="role"
                value={user.role}
                readOnly
                className="w-full p-3 border border-gray-300 rounded bg-gray-100 cursor-not-allowed"
              />
            </div> */}
          </div>

          {/* Save Button */}
          <div className="text-center mt-8">
            <button
              onClick={handleSave}
              className="px-6 py-2 bg-gradient-to-r from-green-400 to-green-500 text-white rounded shadow-lg hover:opacity-90"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
