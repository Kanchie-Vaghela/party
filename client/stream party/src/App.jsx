window.global = window;
import './App.css';
import { useRef, useState } from 'react';
import axios from 'axios';
import videojs from 'video.js';
import Home from './pages/Home';
import Room from './pages/Room';
import { Routes, Route } from "react-router-dom";






function App() {

  //TEST THAT THIS VIDEO PLAYER WORKS
  const videoRef = useRef(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [uploading, setUploading] = useState(false);
  const videoPlayer = {
    controls: true,
    responsive: true,
    fluid: true,
    sources: [{
      src: videoUrl,
      type: 'application/x-mpegURL',
    }], 
  }

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

      setVideoUrl(res.data.videoUrl); // 🌐 your m3u8 link
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const handlePlayerReady = (player) => {
   

    player.on('error', () => {
      console.error('VideoJS error:', player.error());
      alert('An error occurred while playing the video.');
    });

    player.on('waiting', () => {
      videojs.log('Video is waiting...');
    });
    player.on('playing', () => {
      videojs.log('Video is playing...');
    });
    player.on('ended', () => {
      videojs.log('Video has ended.');
    });
  };

  return (
    
     <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/room/:roomId" element={<Room />} />
    </Routes>
  );
}

export default App;
