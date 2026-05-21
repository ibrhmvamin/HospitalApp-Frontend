import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useAuthStore from "../zustand/authStore";

const EditDoctor = () => {
  const { state } = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const { token } = useAuthStore();

  const [doctorData, setDoctorData] = useState({
    name: state?.name || "",
    surname: state?.surname || "",
    email: state?.email || "",
    birthDate: state?.birthDate
      ? state.birthDate.split(" ")[0].split("-").reverse().join("-")
      : "",
    profile: null,
    newPassword: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDoctorData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setDoctorData((prev) => ({ ...prev, profile: e.target.files[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      doctorData.newPassword &&
      doctorData.newPassword !== doctorData.confirmPassword
    ) {
      toast.error("Passwords do not match");
      return;
    }

    const formData = new FormData();
    formData.append("Name", doctorData.name);
    formData.append("Surname", doctorData.surname);
    formData.append("Email", doctorData.email);
    formData.append("BirthDate", doctorData.birthDate);

    if (doctorData.profile) formData.append("Profile", doctorData.profile);
    if (doctorData.newPassword)
      formData.append("NewPassword", doctorData.newPassword);
    if (doctorData.confirmPassword)
      formData.append("ConfirmPassword", doctorData.confirmPassword);

    try {
      await axios.put(
        `http://localhost:5274/api/user/doctors/${id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      toast.success("Doctor updated successfully");
      navigate("/admin");
    } catch (err) {
      console.error(err);
      toast.error("Failed to update doctor");
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <h1 className="text-3xl text-white font-bold mb-6">Edit Doctor</h1>

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
            value={doctorData.name}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        {/* Surname */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Surname</label>
          <input
            type="text"
            name="surname"
            value={doctorData.surname}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Email</label>
          <input
            type="email"
            name="email"
            value={doctorData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
            required
          />
        </div>

        {/* Birth Date */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Birth Date</label>
          <input
            type="date"
            name="birthDate"
            value={doctorData.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* New Password */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={doctorData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label className="block text-gray-400 mb-2">Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={doctorData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        {/* Profile Picture */}
        <div className="mb-4">
          <label className="block text-gray-400 mb-2 font-medium">
            Profile Picture
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
        >
          Update Doctor
        </button>
      </form>
    </div>
  );
};

export default EditDoctor;
