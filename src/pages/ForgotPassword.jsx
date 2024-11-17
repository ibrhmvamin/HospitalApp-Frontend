import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import axios from "axios";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Handle input changes
  const handleChange = e => {
    setEmail(e.target.value);
  };

  // Validate email format
  const validateEmail = () => {
    if (!email) return "Email is required";
    if (!/\S+@\S+\.\S+/.test(email)) return "Invalid email format";
    return "";
  };

  // Handle form submission
  const handleSubmit = async e => {
    e.preventDefault();
    const emailError = validateEmail();

    if (emailError) {
      setError(emailError);
      return;
    } else {
      setError("");
    }

    try {
      setIsLoading(true);
      const response = await axios.post(
        `http://localhost:5274/api/Authentication/forgot-password?email=${email}`
      );

      if (response.status == 200) {
        toast.success("Password reset email sent successfully!");
        setEmail("");
        navigate("/login");
      } else {
        toast.error("Failed to send password reset email");
      }
    } catch (error) {
      console.log(error);
      const message = error.response?.data?.message || "An error occurred";
      toast.error(`Error: ${message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-6 bg-gray-800 shadow-md rounded-lg">
        <h1 className="text-3xl font-bold text-white text-center">
          Forgot Password
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
              value={email}
              onChange={handleChange}
              className={`w-full p-3 mt-1 bg-gray-700 text-white rounded-md border ${
                error ? "border-red-500" : "border-gray-600"
              }`}
              placeholder="Enter your email"
            />
            {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-green-500 text-white font-bold rounded-md hover:bg-green-600 transition duration-200"
          >
            Send Reset Link
          </button>
        </form>

        <p className="text-white text-center">
          Remembered your password? Log in{" "}
          <Link
            className="text-green-500 rounded-lg font-bold hover:text-green-600 transition"
            to="/login"
          >
            here.
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
