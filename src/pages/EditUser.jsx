import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import useAuthStore from "./../zustand/authStore";

const EditUser = () => {
  const { state } = useLocation(); // Access passed user data if available
  const { id } = useParams(); // Get user ID from the URL
  const navigate = useNavigate();
  const { token } = useAuthStore();

  // State to store user data
  const [userData, setUserData] = useState(
    state || {
      name: "",
      surname: "",
      email: "",
      birthDate: "",
      profile: null,
    }
  );

  // State to store validation errors
  const [errors, setErrors] = useState({});

  // Fetch user data if not passed via state
  useEffect(() => {
    if (!state) {
      const fetchUserData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:5274/api/user/patients/${id}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          setUserData(response.data);
        } catch (error) {
          toast.error("Failed to fetch user data");
        }
      };
      fetchUserData();
    }
  }, [id, state, token]);

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profile") {
      setUserData({ ...userData, profile: files[0] }); // Handle file input
    } else {
      setUserData({ ...userData, [name]: value });
    }
    setErrors({ ...errors, [name]: "" }); // Clear errors on input change
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    const formatDate = (dateString) => {
      // Convert "DD-MM-YYYY HH:MM" to "YYYY-MM-DD"
      const [day, month, year] = dateString.split("-"); // Split by '-'
      return `${month}-${day}-${year}`;
    };

    // Update payload
    const formattedBirthDate = formatDate(userData.birthDate);

    const formData = new FormData();
    formData.append("Name", userData.name);
    formData.append("Surname", userData.surname);
    formData.append("Email", userData.email);
    formData.append("BirthDate", formattedBirthDate);
    if (userData.profile) {
      formData.append("Profile", userData.profile);
    }

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
    } catch (error) {
      if (error.response && error.response.data && error.response.data.errors) {
        setErrors(error.response.data.errors);
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
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Birth Date</label>
          <input
            type="datetime"
            name="birthDate"
            value={userData.birthDate}
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
          />
          {errors.BirthDate && (
            <p className="text-red-500 mt-1">{errors.BirthDate[0]}</p>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-gray-400 mb-2">Profile Picture</label>
          <input
            type="file"
            name="profile"
            onChange={handleChange}
            className="w-full px-4 py-2 rounded-md bg-gray-700 text-white"
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
