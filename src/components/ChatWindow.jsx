import React, { useState, useEffect } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import useAuthStore from "../zustand/authStore";
import { useNavigate } from "react-router-dom";

const ChatWindow = ({ selectedDoctor }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [error, setError] = useState("");
  const { token } = useAuthStore();
  const [hubConnection, setHubConnection] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) navigate("/");
  }, [token]);

  useEffect(() => {
    const connection = new HubConnectionBuilder()
      .withUrl("http://localhost:5274/appointmentHub", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .build();

    connection
      .start()
      .then(() => console.log("SignalR Connected"))
      .catch((err) =>
        console.error("Error while establishing connection: ", err)
      );

    connection.on("ReceiveMessage", (message, senderId) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { content: message, senderId },
      ]);
    });

    setHubConnection(connection);

    return () => {
      if (hubConnection) {
        hubConnection.stop();
      }
    };
  }, [token]);

  // Send message via SignalR
  const sendMessage = async () => {
    console.log(selectedDoctor.id);
    if (!newMessage.trim() || !selectedDoctor?.id) return;

    try {
      // Send the message to the server via SignalR
      if (hubConnection) {
        await hubConnection.invoke(
          "SendMessage",
          newMessage,
          token,
          selectedDoctor.id
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
          Chat with Dr. {selectedDoctor?.name || "Unknown"}
        </h3>
      </div>

      {/* Messages List */}
      <div className="flex-1 overflow-y-auto bg-gray-700 rounded-lg p-4 mb-4">
        {messages.length > 0 ? (
          messages.map((msg, index) => (
            <div
              key={index}
              className={`mb-2 ${
                msg.senderId === token ? "text-right" : "text-left"
              }`}
            >
              <span
                className={`inline-block p-2 rounded ${
                  msg.senderId === token ? "bg-blue-500" : "bg-gray-600"
                }`}
              >
                {msg.content}
              </span>
            </div>
          ))
        ) : (
          <p className="text-gray-400">No messages yet</p>
        )}
      </div>

      {/* Input Field */}
      <div className="flex items-center">
        <input
          type="text"
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 rounded bg-gray-600 text-white mr-2 outline-none"
        />
        <button
          onClick={sendMessage}
          className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Send
        </button>
      </div>

      {error && <p className="text-red-500 mt-2">{error}</p>}
    </div>
  );
};

export default ChatWindow;
