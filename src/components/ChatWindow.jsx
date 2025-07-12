import React, { useEffect, useRef, useState } from "react";
import { HubConnectionBuilder } from "@microsoft/signalr";
import { jwtDecode } from "jwt-decode";
import useAuthStore from "../zustand/authStore";
import axios from "axios";
import { FiSend } from "react-icons/fi";
import { FiTrash2 } from "react-icons/fi";

const isInChat = (m, me, them) =>
  (m.senderId === me && m.receiverId === them) ||
  (m.senderId === them && m.receiverId === me);

export default function ChatWindow({ selectedDoctor, selectedPatient }) {
  const { token } = useAuthStore();
  if (!token) return null;

  const decoded = jwtDecode(token);
  const me =
    decoded[
      "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
    ];
  const role =
    decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"];

  const themObj = role === "doctor" ? selectedPatient : selectedDoctor;
  const themId = themObj?.id;

  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [err, setErr] = useState("");

  const hubRef = useRef(null);
  const bottomRef = useRef(null);

  useEffect(() => {
    const conn = new HubConnectionBuilder()
      .withUrl("http://localhost:5274/appointmentHub", {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .build();

    conn.start().catch(console.error);
    hubRef.current = conn;

    return () => conn.stop();
  }, [token]);

  useEffect(() => {
    if (!themId) return;

    const handle = (senderId, receiverId, content) => {
      if (isInChat({ senderId, receiverId }, me, themId)) {
        setMessages((prev) => [...prev, { senderId, receiverId, content }]);
      }
    };

    hubRef.current.on("ReceiveMessage", handle);

    (async () => {
      const res = await axios.get("http://localhost:5274/api/Room/messages", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(
        res.data
          .filter((m) => isInChat(m, me, themId))
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
      );
    })();

    return () => hubRef.current.off("ReceiveMessage", handle);
  }, [themId, token, me]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || !themId) {
      setErr("Select a user and type a message");
      return;
    }
    try {
      await hubRef.current.invoke("SendMessage", me, themId, text);
      setText("");
      setErr("");
    } catch (e) {
      setErr("Send failed");
      console.error(e);
    }
  };

  const handleDeleteMessage = async (id) => {
    await fetch(`http://localhost:5274/api/room/message/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-white p-6 rounded-lg">
      <h3 className="mb-4 text-lg font-semibold">
        Chat with{" "}
        {role === "doctor"
          ? themObj?.name ?? "Patient"
          : `Dr. ${themObj?.name ?? "Unknown"}`}
      </h3>

      <div className="flex-1 overflow-y-auto bg-gray-700 rounded p-4">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`mb-2 ${m.senderId === me ? "text-right" : "text-left"}`}
          >
            <div
              className={`inline-block max-w-xs px-3 py-2 rounded-lg relative ${
                m.senderId === me ? "bg-blue-600" : "bg-gray-600"
              }`}
            >
              <p className="text-sm">{m.content}</p>
              <div className="flex justify-end mt-1">
                <span className="text-[10px] text-gray-400">
                  {new Date(m.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: false,
                    timeZone: "Asia/Baku",
                  })}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div ref={bottomRef}></div>
      </div>

      <div className="flex mt-4">
        <input
          className="flex-1 bg-gray-600 p-2 rounded outline-none"
          placeholder="Type…"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button
          onClick={send}
          className="ml-2 p-2 bg-blue-500 rounded-full text-white hover:bg-blue-600 transition"
          aria-label="Send"
        >
          <FiSend size={20} />
        </button>
      </div>

      {err && <p className="text-red-500 mt-2">{err}</p>}
    </div>
  );
}
