import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SignUp from "./pages/SignUp";
import VerifyEmail from "./pages/VerifyEmail";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import { useEffect, useState } from "react";
import useAuthStore from "./zustand/authStore";
import ClipLoader from "react-spinners/ClipLoader";
import NewAppointment from "./pages/NewAppointment";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Admin from "./pages/Admin";
import AddDoctor from "./pages/AddDoctor";
import EditDoctor from "./pages/EditDoctor";
import EditUser from "./pages/EditUser";
import DoctorList from "./pages/DoctorList";

function App() {
  const { checkToken } = useAuthStore();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkToken();
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div
        className="spinner-container"
        style={{ backgroundColor: "#121212", height: "100vh" }}
      >
        <ClipLoader color="#24ae7c" loading={loading} size={50} />{" "}
      </div>
    );
  }

  return (
    <>
      <Routes>
        <Route path="/" Component={Home} />
        <Route path="/signup" Component={SignUp} />
        <Route path="/new-appointment" Component={NewAppointment} />
        <Route path="/login" Component={Login} />
        <Route path="/verify-email" Component={VerifyEmail} />
        <Route path="/forgot-password" Component={ForgotPassword} />
        <Route path="/reset-password" Component={ResetPassword} />
        <Route path="/profile" Component={Profile} />
        <Route path="/admin" Component={Admin} />
        <Route path="/add-doctor" Component={AddDoctor} />
        <Route path="/chat" Component={DoctorList} />
        <Route path="/edit-doctor/:id" element={<EditDoctor />} />
        <Route path="/edit-user/:id" element={<EditUser />} />
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
