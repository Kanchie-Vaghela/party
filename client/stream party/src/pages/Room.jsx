import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";
import axios from "axios";
import CommentBox from "../components/CommentBox";
import VideoJS from "../components/MoviePlayer";

let socket;

const Room = () => {
  const { roomId } = useParams();
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [playerInstance, setPlayerInstance] = useState(null);

  useEffect(() => {
    socket = io("http://localhost:5000");

    // Must match backend shape!
    socket.emit("join-room", {
      email: "anonymous", // or pass actual email if available
      roomId,
    });

    socket.on("sync-video", (url) => {
      console.log("📽️ Syncing video:", url);
      setVideoUrl(url);
    });

    socket.on("sync-play", () => {
      playerInstance?.play();
    });

    socket.on("sync-pause", () => {
      playerInstance?.pause();
    });

    socket.on("sync-seek", (time) => {
      playerInstance?.currentTime(time);
    });

    return () => socket.disconnect();
  }, [roomId, playerInstance]);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      setUploading(true);
      const res = await axios.post("http://localhost:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setVideoUrl(res.data.videoUrl);
      socket.emit("video-url", {
        roomId,
        videoUrl: res.data.videoUrl,
      });
    } catch (err) {
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePlayerReady = (player) => {
    setPlayerInstance(player);

    player.on("play", () => socket.emit("play-video", { roomId }));
    player.on("pause", () => socket.emit("pause-video", { roomId }));
    player.on("seeked", () =>
      socket.emit("seek", {
        time: player.currentTime(),
        room: roomId,
      })
    );
  };

  const videoPlayer = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [
      {
        src: videoUrl,
        type: "application/x-mpegURL",
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#fdfbfb] to-[#ebedee] text-gray-800 px-6 py-10">
  <h2 className="text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 drop-shadow-md">
    Room ID: {roomId}
  </h2>

  <p className="text-gray-500 italic mb-4">Connected. Waiting for others to join...</p>

  <input
    type="file"
    accept="video/*"
    onChange={handleUpload}
    className="text-sm text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm focus:outline-none file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-gradient-to-r file:from-purple-500 file:to-pink-500 file:text-white hover:file:from-purple-600 hover:file:to-pink-600 transition-all mb-6"
  />

  {uploading && (
    <p className="text-sm text-pink-500 font-medium animate-pulse mb-4">Uploading...</p>
  )}

  <div className="flex flex-row w-full max-w-6xl gap-6">
    {videoUrl && (
      <div className="w-3/5 bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <VideoJS
          options={videoPlayer}
          onReady={handlePlayerReady}
          setPlayerRef={setPlayerInstance}
        />
      </div>
    )}

    <div className="w-2/5 bg-white rounded-2xl shadow-lg border border-gray-200 flex flex-col">
      <div className="px-4 py-3 border-b text-lg font-semibold text-purple-500">
        💬 Live Comments
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-2 scrollbar-thin scrollbar-thumb-purple-400 scrollbar-track-transparent">
        <CommentBox roomId={roomId} />
      </div>
    </div>
  </div>
</div>

  );
};

export default Room;
