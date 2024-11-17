import React, { useState } from "react";

const ChatWindow = ({ doctor, onClose }) => {
  const [messages, setMessages] = useState([
    { sender: doctor, text: "Hello, how can I assist you today?" },
    {
      sender: "You",
      text: "I have a question regarding my upcoming appointment.",
    },
  ]);
  const [newMessage, setNewMessage] = useState("");

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setMessages([...messages, { sender: "You", text: newMessage }]);
      setNewMessage("");
    }
  };

  return (
    <div className="w-80 bg-gray-800 text-white shadow-lg rounded-lg mr-4 mb-4">
      {/* Chat Header */}
      <div className="bg-gray-700 p-4 flex justify-between items-center rounded-t-lg">
        <h3 className="text-lg font-bold">Chat with {doctor}</h3>
        <button
          onClick={() => onClose(doctor)}
          className="text-red-400 hover:text-red-600"
        >
          &times;
        </button>
      </div>

      {/* Chat Messages */}
      <div className="p-4 h-64 overflow-y-auto space-y-3 bg-gray-900">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === "You" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`p-3 rounded-lg text-sm max-w-xs ${
                message.sender === "You"
                  ? "bg-blue-500 text-white"
                  : "bg-gray-700 text-gray-200"
              }`}
            >
              <p className="font-bold">{message.sender}</p>
              <p>{message.text}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input */}
      <div className="bg-gray-800 p-3 rounded-b-lg flex">
        <input
          type="text"
          className="w-full bg-gray-700 text-white p-2 rounded-lg outline-none"
          placeholder="Type your message..."
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          onKeyPress={e => e.key === "Enter" && handleSendMessage()}
        />
        <button
          className="ml-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg"
          onClick={handleSendMessage}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default ChatWindow;
