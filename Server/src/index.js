import dotenv from "dotenv";
dotenv.config();

import http from "http";
import { Server as IOServer } from "socket.io";
import { app } from "./app.js";
import { upload } from "./middleware/multer.middleware.js";
import { v4 as uuid } from "uuid";
import fs from "fs";
import { spawn } from "child_process";

const port = process.env.PORT || 5000;
const httpServer = http.createServer(app);
const io = new IOServer(httpServer, {
  cors: { origin: "http://localhost:5173" },
  transports: ["polling", "websocket"],
});

const emailToSocketIdmap = new Map();
const socketIdToEmailMap = new Map();
const videoByRoom = new Map();

io.on("connection", (socket) => {
  console.log("🔌 New user connected:", socket.id);

  socket.on("join-room", ({ email, roomId }) => {
    console.log(`User ${socket.id} joining room ${roomId} (${email})`);

    emailToSocketIdmap.set(email, socket.id);
    socketIdToEmailMap.set(socket.id, email);
    socket.join(roomId);

    // 🔁 Sync existing video to new user
    const currentVideo = videoByRoom.get(roomId);
    if (currentVideo) {
      io.to(socket.id).emit("sync-video", currentVideo);
    }

    socket.to(roomId).emit("user-joined", { email, id: socket.id });
  });

  socket.on("video-url", ({ roomId, videoUrl }) => {
    videoByRoom.set(roomId, videoUrl);
    socket.to(roomId).emit("sync-video", videoUrl);
  });

  socket.on("play-video", ({ roomId }) => {
    socket.to(roomId).emit("sync-play");
  });

  socket.on("pause-video", ({ roomId }) => {
    socket.to(roomId).emit("sync-pause");
  });

  socket.on("seek", ({ time, room }) => {
    io.to(room).emit("sync-seek", time);
  });

  socket.on("message", (msg, room) => {
  console.log(`Message in room ${room}: ${msg}`);
  io.to(room).emit("receive-message", msg); // includes sender
});


  socket.on("disconnect", () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

httpServer.listen(port, () => {
  console.log(`✅ Server running at http://localhost:${port}`);
});

app.get("/", (req, res) => {
  res.send("Hello from Stream Party server!");
});

app.post("/upload", upload.single("file"), (req, res) => {
  const movieId = uuid();
  const videoPath = req.file.path;
  const outputPath = `./uploads/${movieId}`;
  const hlspath = `${outputPath}/index.m3u8`;

  if (!fs.existsSync(outputPath)) {
    fs.mkdirSync(outputPath, { recursive: true });
  }

  const ffmpeg = spawn("ffmpeg", [
    "-i",
    videoPath,
    "-c:v",
    "libx264",
    "-c:a",
    "aac",
    "-f",
    "hls",
    "-hls_time",
    "10",
    "-hls_list_size",
    "0",
    "-hls_segment_filename",
    `${outputPath}/segment_%03d.ts`,
    hlspath,
  ]);

  ffmpeg.stderr.on("data", (data) => {
    console.error(`FFmpeg stderr: ${data}`);
  });

  ffmpeg.on("close", (code) => {
    if (code !== 0) {
      return res.status(500).json({ error: "FFmpeg failed" });
    }

    const videoUrl = `http://localhost:${port}/uploads/${movieId}/index.m3u8`;
    res.json({
      message: "Video uploaded and processed successfully",
      videoUrl,
      movieId,
    });
  });
});
