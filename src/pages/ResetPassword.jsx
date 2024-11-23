import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const ResetPassword = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState({
    password: "",
    passwordConfirm: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    // Confirm password validation
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = "Passwords do not match";
    }

    return newErrors;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      try {
        setIsLoading(true);
        // Assuming token is passed as a query param in the URL
        const token = new URLSearchParams(location.search).get("token");
        const email = new URLSearchParams(location.search).get("email");

        const response = await axios.post(
          `http://localhost:5274/api/Authentication/reset-password`,
          {
            password: formData.password,
            confirmPassword: formData.passwordConfirm,
            token,
            email,
          }
        );

        if (response.status === 200) {
          toast.success("Password reset successful! You can now log in.");
          navigate("/login");
        } else {
          toast.error("Password reset failed");
        }
      } catch (error) {
        console.log(error);
        const { message } = error.response?.data || "An error occurred";
        toast.error(`Error: ${message}`);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-white text-center">
          Reset Your Password
        </h1>
        <form onSubmit={handleSubmit}>
          {/* Password Input */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-400"
            >
              New Password
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
              placeholder="Enter your new password"
            />
            {errors.password && (
              <p className="mt-2 text-sm text-red-500">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password Input */}
          <div className="mb-4">
            <label
              htmlFor="passwordConfirm"
              className="block text-sm font-medium text-gray-400"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              name="passwordConfirm"
              id="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              className={`w-full p-3 mt-1 bg-gray-700 text-white rounded-md border ${
                errors.passwordConfirm ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Confirm your new password"
            />
            {errors.passwordConfirm && (
              <p className="mt-2 text-sm text-red-500">
                {errors.passwordConfirm}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition duration-200"
          >
            Reset Password
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
