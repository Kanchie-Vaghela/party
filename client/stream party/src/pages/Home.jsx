// src/pages/Home.jsx
import React, { useState , useCallback, useContext, useEffect} from "react";
import { useNavigate } from "react-router-dom";
import { nanoid } from "nanoid";
import { useSocket } from "../context/socketProvider.jsx";

const Home = () => {
  const [joinInput, setJoinInput] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();
  
  
  const socket = useSocket();


  const handleCreateRoom = () => {
    const roomId = nanoid(6); // e.g., "x7a9b2"
    navigate(`/room/${roomId}`);
  };


  const handleSubmitForm = useCallback((e) => {
    e.preventDefault();

    socket.emit("join-room", { email, room: joinInput });

  },[joinInput, email, socket]);

  const handleJoinRoom = useCallback((data) => {
    const { email , room } = data;
    navigate(`/room/${room}`);
  },[]);

  useEffect(() => {
    socket.on("join-room", handleJoinRoom);
    return () => {
      socket.off("join-room", handleJoinRoom);
    };
  },[socket])


  return (


    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] text-gray-800 gap-8 px-4">
  <h1 className="text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 drop-shadow-md">
    Stream Party 🎬
  </h1>

  <div className="flex flex-col items-center gap-4 w-full max-w-sm">
    <form onSubmit={handleSubmitForm} className="flex flex-col gap-4 w-full">
      <input
        type="text"
        placeholder="Name"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-3 rounded-xl text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 placeholder-gray-400 transition w-full"
      />

      <input
        type="text"
        placeholder="Enter Room Code"
        value={joinInput}
        onChange={(e) => setJoinInput(e.target.value)}
        className="px-4 py-3 rounded-xl text-gray-800 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400 placeholder-gray-400 transition w-full"
      />

      <button
        onClick={handleJoinRoom}
        className="px-6 py-3 bg-gradient-to-r from-pink-500 to-yellow-400 text-white font-semibold rounded-2xl shadow-md hover:from-pink-600 hover:to-yellow-500 transition-all duration-200 w-full"
      >
        Join Room
      </button>
    </form>
  </div>
</div>

  );
};

export default Home;