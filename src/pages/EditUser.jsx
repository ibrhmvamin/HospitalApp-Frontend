import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useAuthStore from "../zustand/authStore";

const EditUser = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [userData, setUserData] = useState(
    state || {
      name: "",
      surname: "",
      email: "",
      birthDate: "",
      profile: null,
      newPassword: "",
      confirmPassword: "",
    }
  );
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (!state) {
      (async () => {
        try {
          const res = await axios.get(
            `http://localhost:5274/api/user/patients/${id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          setUserData((prev) => ({ ...prev, ...res.data }));
        } catch (err) {
          toast.error("Failed to fetch user data");
        }
      })();
    }
  }, [id, state, token]);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile") {
      setUserData((prev) => ({ ...prev, profile: files[0] }));
    } else {
      setUserData((prev) => ({ ...prev, [name]: value }));
    }
    setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    if (
      userData.newPassword &&
      userData.newPassword !== userData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    const fmtBirth = userData.birthDate
      ? new Date(userData.birthDate).toISOString().split("T")[0]
      : "";

    const formData = new FormData();
    formData.append("Name", userData.name);
    formData.append("Surname", userData.surname);
    formData.append("Email", userData.email);
    formData.append("BirthDate", fmtBirth);
    if (userData.profile) formData.append("Profile", userData.profile);
    if (userData.newPassword)
      formData.append("NewPassword", userData.newPassword);
    if (userData.confirmPassword)
      formData.append("ConfirmPassword", userData.confirmPassword);

    try {
      await axios.put(
        `http://localhost:5274/api/user/patients/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("User updated successfully");
      navigate("/admin");
    } catch (err) {
      if (err.response?.data?.errors) {
        setErrors(err.response.data.errors);
      } else {
        toast.error("Failed to update user");
      }
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl text-white font-bold mb-6">Edit User</h1>

      <form
        onSubmit={handleSubmit}
        className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md"
      >
        {/* Name */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={userData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
          {errors.Name && <p className="text-red-500 mt-1">{errors.Name[0]}</p>}
        </div>

        {/* Surname */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Surname</label>
          <input
            type="text"
            name="surname"
            value={userData.surname}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
          {errors.Surname && (
            <p className="text-red-500 mt-1">{errors.Surname[0]}</p>
          )}
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={userData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
          {errors.Email && (
            <p className="text-red-500 mt-1">{errors.Email[0]}</p>
          )}
        </div>

        {/* Birth Date */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={userData.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
          {errors.BirthDate && (
            <p className="text-red-500 mt-1">{errors.BirthDate[0]}</p>
          )}
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">
            New Password (optional)
          </label>
          <input
            type="password"
            name="newPassword"
            value={userData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={userData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* Profile Picture */}
        <div className="mb-6">
          <label className="block text-gray-400 mb-2 font-medium">
            Profile Picture
          </label>
          <input
            type="file"
            name="profile"
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white border border-gray-600 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Update User
        </button>
      </form>
    </div>
  );
};

export default EditUser;
