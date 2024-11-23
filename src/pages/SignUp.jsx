import axios from "axios";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import useAuthStore from "../zustand/authStore"; // Import the zustand auth store

const SignUp = () => {
  // State for loading
  const [isLoading, setIsLoading] = useState(false);
  const { token } = useAuthStore();

  const navigate = useNavigate();
  // State for form fields and error handling
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: null,
  });

  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;

    if (name === "profileImage") {
      const file = files[0];
      setFormData({ ...formData, profileImage: file });

      // Show image preview
      if (file) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setImagePreview(null);
      }
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  // Form validation function
  const validateForm = () => {
    let tempErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Full Name Validation
    if (!formData.fullName) {
      tempErrors.fullName = "Full name is required.";
    } else if (!formData.fullName.trim().includes(" ")) {
      tempErrors.fullName = "Full name must contain at least two names.";
    }

    // Email Validation
    if (!formData.email) {
      tempErrors.email = "Email is required.";
    } else if (!emailRegex.test(formData.email)) {
      tempErrors.email = "Please enter a valid email address.";
    }

    // Password Validation
    if (!formData.password) {
      tempErrors.password = "Password is required.";
    }

    // Confirm Password Validation
    if (formData.password !== formData.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
    }

    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      setIsLoading(true);
      const formDataToSend = new FormData();

      // Append form fields
      formDataToSend.append("name", formData.fullName.split(" ")[0]); // Assuming fullName is split into first and last name
      formDataToSend.append("surname", formData.fullName.split(" ")[1]);
      formDataToSend.append("email", formData.email);
      formDataToSend.append("password", formData.password);
      formDataToSend.append("passwordConfirm", formData.confirmPassword);

      // Append profile image if selected
      if (formData.profileImage) {
        formDataToSend.append("profile", formData.profileImage);
      }

      axios
        .post(
          "http://localhost:5274/api/Authentication/register",
          formDataToSend
        )
        .catch((err) => {
          const { message } = err.response.data;
          toast.error(message);
        })
        .then((res) => res.data)
        .then((data) =>
          toast.success("Registration is successful. Please Confirm email")
        )
        .finally(() => setIsLoading(false));
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Form */}
      <div className="w-full md:w-1/2 bg-gray-900 text-white flex flex-col justify-center px-8 md:px-16">
        <div className="mb-10">
          <img src="/logo.webp" alt="DocLink Logo" className="h-10 mb-8" />
          <h1 className="text-4xl font-bold">Hi there</h1>
          <p className="text-gray-400 mt-2">Get Started with Appointments.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Full Name */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Full name
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2.5 text-gray-400">
                <i className="fas fa-user"></i>
              </span>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full bg-gray-800 text-white py-2 pl-8 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Email address
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2.5 text-gray-400">
                <i className="fas fa-envelope"></i>
              </span>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="johndoe@google.com"
                className="w-full bg-gray-800 text-white py-2 pl-8 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">
              Password
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2.5 text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className="w-full bg-gray-800 text-white py-2 pl-8 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">
              Confirm Password
            </label>
            <div className="relative">
              <span className="absolute left-2 top-2.5 text-gray-400">
                <i className="fas fa-lock"></i>
              </span>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className="w-full bg-gray-800 text-white py-2 pl-8 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
            </div>
            {errors.confirmPassword && (
              <p className="text-red-500 text-sm mt-1">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Profile Image */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300">
              Profile Image
            </label>
            <input
              type="file"
              name="profileImage"
              accept="image/*"
              onChange={handleChange}
              className="w-full bg-gray-800 text-white py-2 pl-8 pr-4 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-green-400"
            />
          </div>

          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-4">
              <img
                src={imagePreview}
                alt="Profile Preview"
                className="w-32 h-32 object-cover rounded-full"
              />
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-lg transition duration-300"
          >
            Get Started
          </button>
        </form>

        <p className="mt-8 text-sm text-gray-500">@DocLink copyright</p>
        <p>
          Already have an account? Click{" "}
          <Link
            to="/login"
            className="text-green-500 rounded-lg font-bold hover:text-green-600 transition"
          >
            here.
          </Link>
        </p>
      </div>

      {/* Right side - Image */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center"
        style={{ backgroundImage: `url('/onboarding-img.png')` }}
      >
        {/* Right side content goes here */}
      </div>
    </div>
  );
};

export default SignUp;
