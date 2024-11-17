import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

const VerifyEmail = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Extract token and email from the URL query parameters
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");
    const email = queryParams.get("email");

    // Send verification request to backend
    axios
      .post("http://localhost:5274/api/authentication/verify-email", {
        token,
        email,
      })
      .then((response) => {
        setLoading(false);
        // Redirect to login page with success message
        navigate("/login", {
          state: { message: "Verification successful!", success: true },
        });
      })
      .catch((error) => {
        setLoading(false);
        // Redirect to login page with error message
        navigate("/login", {
          state: { message: "Verification failed!", success: false },
        });
      });
  }, [location, navigate]);

  return (
    <div className="flex justify-center items-center h-screen bg-gray-900 text-white">
      {loading ? <p>Loading...</p> : null}
    </div>
  );
};

export default VerifyEmail;
