import React, { useEffect, useCallback, useRef, useState } from "react";
import { useSocket } from "../context/socketProvider";
import peer from '../service/peer';

const Videocall = () => {
  const socket = useSocket();
  const [remotesocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);

  const myVideoRef = useRef(null);

  const handleUserJoined = useCallback(({ email, id }) => {
    console.log("User joined:", email, id);
    setRemoteSocketId(id);
  }, []);

  const HandleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });

    const offer = await peer.getOffer();
    socket.emit("call-user", {
      to: remotesocketId,
      offer,
    });

    setMyStream(stream);
  }, [remotesocketId, socket]);

  const HandleCallMade = useCallback(async ({from, offer}) => {
    console.log("Call made from:", from);
    console.log("Offer received:", offer);
    setRemoteSocketId(from);
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true,
    });
    setMyStream(stream);
   const ans = await peer.getAnswer(offer);
    socket.emit("call-accepted", {
      to: from,
      answer: ans,
    });
  }, [socket]);

  const HandleCallAccepted = useCallback(async (from, answer) => {
    console.log("Call accepted from:", from);
    await peer.setLocalDescription(answer);
  }, [socket]);

  // ✅ Proper side effect for attaching video stream
  useEffect(() => {
    if (myStream && myVideoRef.current) {
      myVideoRef.current.srcObject = myStream;
      const playVideo = async () => {
        try {
          await myVideoRef.current.play();
        } catch (e) {
          console.error("Autoplay blocked:", e);
        }
      };
      setTimeout(playVideo, 100); // Let the browser settle
    }
  }, [myStream]);

  useEffect(() => {
    socket.on("user-joined", handleUserJoined);
    socket.on("call-made", HandleCallMade);
    socket.on("call-accepted", HandleCallAccepted);

    return () => {
      socket.off("user-joined", handleUserJoined);
      socket.off("call-made", HandleCallMade);
      socket.off("call-accepted", HandleCallAccepted);
    };
  }, [socket, handleUserJoined, HandleCallMade, HandleCallAccepted]);

  return (
    <>
      <h2>Video Call</h2>
      <h4>{remotesocketId ? "Connected " : "No one in room"}</h4>
      {remotesocketId && <button onClick={HandleCallUser}>Call</button>}

      {myStream && (
        <>
          <h2>My Video</h2>
          <video
            ref={myVideoRef}
            autoPlay
            muted
            playsInline
            height="300"
            width="400"
            style={{ background: "#000" }}
          />
        </>
      )}
    </>
  );
};

export default Videocall;
