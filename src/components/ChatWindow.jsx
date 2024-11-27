import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import useAuthStore from "../zustand/authStore";
import { useNavigate } from "react-router-dom";

const ChatWindow = ({ selectedDoctor, selectedPatient }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const { token, role } = useAuthStore();
  const [hubConnection, setHubConnection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
  }, [token]);

  // Other connection logic remains the same...

  // Determine recipient based on role
  const recipient = role === "doctor" ? selectedPatient : selectedDoctor;

  const sendMessage = async () => {
    if (!newMessage.trim() || !recipient?.id) return;

    try {
      if (hubConnection) {
        await hubConnection.invoke(
          "SendMessage",
          newMessage,
          token,
          recipient.id // Use appropriate recipient ID
        );
      }
      setNewMessage("");
    } catch (err) {
      setError("Failed to send message");
    }
  };

  return (
    <div className="w-full h-full bg-gray-800 text-white rounded-lg shadow-lg p-6 flex flex-col">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">
          Chat with{" "}
          {role === "doctor"
            ? `${recipient?.name || "Patient"}`
            : `Dr. ${recipient?.name || "Unknown"}`}
        </h3>
      </div>
      {/* Message display and input field logic remain the same */}
    </div>
  );
};

export default ChatWindow;
