import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import useAuthStore from "./../zustand/authStore";
import { jwtDecode } from "jwt-decode";
import { useNavigate } from "react-router-dom";

const AddDoctor = () => {
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
    email: "",
    name: "",
    surname: "",
    profile: null,
    description: "",
    birthDate: "",
  });

  const { token } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) return navigate("/login");
    const decodedToken = jwtDecode(token);
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    if (userRole !== "admin") return navigate("/");
  }, [token]);

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    const today = new Date();
    const minBirthDate = new Date(
      today.getFullYear() - 20,
      today.getMonth(),
      today.getDate()
    );

    if (!formData.name) {
      newErrors.name = "Name is required";
    } else if (formData.name.length > 20) {
      newErrors.name = "Name cannot exceed 20 characters";
    }

    if (!formData.surname) {
      newErrors.surname = "Surname is required";
    } else if (formData.surname.length > 20) {
      newErrors.surname = "Surname cannot exceed 20 characters";
    }

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6 || formData.password.length > 25) {
      newErrors.password = "Password must be between 6 and 25 characters";
    }

    if (formData.passwordConfirm !== formData.password) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    if (formData.description.length > 200) {
      newErrors.description = "Description cannot exceed 200 characters";
    }

    if (!formData.birthDate) {
      newErrors.birthDate = "Birth date is required";
    } else if (new Date(formData.birthDate) >= minBirthDate) {
      newErrors.birthDate = "Doctor must be at least 20 years old";
    }

    if (!formData.profile) {
      newErrors.profile = "Profile photo is required";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      const formDataToSend = new FormData();
      for (const key in formData) {
        formDataToSend.append(key, formData[key]);
      }

      try {
        setIsLoading(true);
        await axios.post(
          "http://localhost:5274/api/user/doctor",
          formDataToSend,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
          }
        );

        toast.success("Doctor added successfully!");
        navigate("/admin");
      } catch (error) {
        toast.error("Failed to add doctor");
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="p-8 bg-gray-900 min-h-screen">
      <div className="max-w-lg mx-auto bg-gray-800 p-6 rounded-lg shadow-md">
        <h1 className="text-2xl text-white font-bold mb-6 text-center">
          Add Doctor
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Name */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.name ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Surname */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Surname</label>
            <input
              type="text"
              name="surname"
              value={formData.surname}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.surname ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.surname && (
              <p className="text-red-500 text-sm mt-1">{errors.surname}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.email ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.password ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Password Confirm */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Confirm Password</label>
            <input
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.passwordConfirm ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.passwordConfirm && (
              <p className="text-red-500 text-sm mt-1">
                {errors.passwordConfirm}
              </p>
            )}
          </div>

          {/* Birth Date */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Birth Date</label>
            <input
              type="date"
              name="birthDate"
              value={formData.birthDate}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.birthDate ? "border-red-500" : "border-gray-600"
              }`}
            />
            {errors.birthDate && (
              <p className="text-red-500 text-sm mt-1">{errors.birthDate}</p>
            )}
          </div>

          {/* Description */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              className={`w-full p-3 bg-gray-700 text-white rounded-md border ${
                errors.description ? "border-red-500" : "border-gray-600"
              }`}
              rows="3"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>

          {/* Profile */}
          <div className="mb-4">
            <label className="block text-gray-400 mb-1">Profile Photo</label>
            <input
              type="file"
              name="profile"
              onChange={handleChange}
              className="w-full text-gray-400"
            />
            {errors.profile && (
              <p className="text-red-500 text-sm mt-1">{errors.profile}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 text-white py-3 rounded-md hover:bg-green-600 transition"
          >
            {isLoading ? "Adding Doctor..." : "Add Doctor"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDoctor;
