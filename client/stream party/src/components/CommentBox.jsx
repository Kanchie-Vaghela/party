import React, { useState, useEffect } from "react";
import socket from "../utils/socket.js";

const CommentBox = ({ roomId }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  useEffect(() => {
    const onMessage = (msg) => {
      console.log("📥 Message received:", msg);
      setMessages((prev) => [...prev, msg]);
    };

    socket.on("receive-message", onMessage);

    return () => {
      socket.off("receive-message", onMessage);
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (input.trim() === "") return;

    const msg = input.trim();
    console.log("📤 Sending message:", msg, "to room:", roomId);
    socket.emit("message", msg, roomId);
    setMessages((prev) => [...prev, msg]);
    setInput("");
  };

  return (
    <div className="w-[400px] mx-auto mt-10">
      <div className="h-[250px] border border-gray-300 rounded-lg p-4 overflow-y-auto bg-white shadow-sm">
        {messages.length === 0 ? (
          <p className="text-gray-400 text-sm">No messages yet.</p>
        ) : (
          messages.map((msg, index) => (
            <p key={index} className="text-sm text-gray-800 mb-1">
              {msg}
            </p>
          ))
        )}
      </div>

      <form onSubmit={handleSubmit} className="mt-4 flex">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Write a message..."
          className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-teal-500 text-white text-sm font-medium rounded-r-md hover:bg-teal-600"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default CommentBox;
