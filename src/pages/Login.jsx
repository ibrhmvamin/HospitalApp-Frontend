import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";
import useAuthStore from "../zustand/authStore"; // Import the zustand auth store

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { token, setAuth } = useAuthStore(); // Access zustand setAuth action
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) navigate("/");
  }, [token]);

  useEffect(() => {
    // Check if we have a message from the VerifyEmail page
    if (location.state && location.state.message) {
      if (location.state.success) {
        toast.success(location.state.message);
      } else {
        toast.error(location.state.message);
      }
    }
  }, [location.state]);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  // Handle input changes
  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    return newErrors;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      try {
        setIsLoading(true);
        const response = await axios.post(
          "http://localhost:5274/api/Authentication/login",
          formData
        );

        if (response.data) {
          const { data: token } = response;

          // Save token in Zustand state
          setAuth(token);

          toast.success("Login successful!");

          // Redirect after login
          navigate("/");
        } else {
          toast.error("Login failed");
        }
      } catch (error) {
        const { message } = error.response.data;
        toast.error(`An error occurred: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-white text-center">
          Login to Your Account
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Email Input */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-400"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              className={`w-full p-3 mt-1 bg-gray-700 text-white rounded-md border ${
                errors.email ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="mt-2 text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              id="password"
              value={formData.password}
              onChange={handleChange}
              className={`w-full p-3 mt-1 bg-gray-700 text-white rounded-md border ${
                errors.password ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Enter your password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition duration-200"
          >
            Log In
          </button>
        </form>
        <p className="text-white text-center">
          Don't have an account? Sign up{" "}
          <Link
            className="text-green-500 rounded-lg font-bold hover:text-green-600 transition"
            to="/signup"
          >
            here.
          </Link>
        </p>
        <p className="text-white text-center">
          Forgot your password? Click{" "}
          <Link
            className="text-green-500 rounded-lg font-bold hover:text-green-600 transition"
            to="/forgot-password"
          >
            here.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
