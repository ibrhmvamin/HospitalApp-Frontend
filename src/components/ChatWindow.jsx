import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import useAuthStore from "../zustand/authStore";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import axios from "axios";

const ChatWindow = ({ selectedDoctor, selectedPatient }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [role, setRole] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuthStore();
  const [hubConnection, setHubConnection] = useState(null);
  const navigate = useNavigate();

  const currentUser = jwtDecode(token); // Decode the JWT token
  const currentUserId =
    currentUser[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ];

  useEffect(() => {
    if (!token) navigate("/");

    const decodedToken = jwtDecode(token);
    const userRole =
      decodedToken[
        "http://schemas.microsoft.com/ws/2008/06/identity/claims/role"
      ];
    setRole(userRole);

    const loadMessages = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5274/api/Room/messages",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        const sortedMessages = response.data.sort(
          (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
        );
        setMessages(sortedMessages);
      } catch (err) {
        console.error("Failed to load messages:", err);
      }
    };

    loadMessages();

    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5274/appointmentHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    connection
      .start()
      .then(() => console.log("Connected to SignalR hub"))
      .catch((err) => console.error("SignalR connection error:", err));

    connection.on("ReceiveMessage", (message, senderId) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message, senderId: senderId },
      ]);
    });

    setHubConnection(connection);

    return () => {
      connection.stop();
    };
  }, [token, navigate]);

  const recipient = role === "doctor" ? selectedPatient : selectedDoctor;

  const sendMessage = async () => {
    if (!newMessage.trim() || !recipient?.id) {
      setError("Please type a message and select a recipient.");
      return;
    }

    try {
      if (hubConnection) {
        // Use currentUserId as senderId
        await hubConnection.invoke(
          "SendMessage",
          currentUserId,
          recipient.id,
          newMessage
        );
        setMessages((prevMessages) => [
          ...prevMessages,
          { content: newMessage, senderId: currentUserId },
        ]);
        setNewMessage("");
        setError("");
      }
    } catch (err) {
      setError("Failed to send message");
      console.error("SendMessage error:", err);
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

      <div className="flex-1 overflow-y-auto p-4 bg-gray-700 rounded-lg mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.senderId === currentUserId ? "text-right" : "text-left"
            }`}
          >
            <div
              className={`inline-block p-2 rounded-lg ${
                msg.senderId === currentUserId ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <span>{msg.content}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message"
          className="w-full p-2 rounded-lg bg-gray-600 text-white focus:outline-none"
        />
        <button
          onClick={sendMessage}
          className="ml-2 p-2 bg-blue-500 rounded-lg text-white"
        >
          Send
        </button>
      </div>

      {error && <div className="text-red-500 mt-4">{error}</div>}
    </div>
  );
};

export default ChatWindow;
