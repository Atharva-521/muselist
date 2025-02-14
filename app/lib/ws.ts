"use client"
import { io } from "socket.io-client";

function connectSocket() {
  // Retrieve the JWT token from localStorage
  const token = localStorage.getItem("museToken");
  if (!token) {
    console.error("No JWT token found in localStorage!");
    return null;
  }

  // Connect to the WebSocket server on port 8080 using the token for authentication
  const socket = io("http://localhost:8080", {
    auth: { token },
    withCredentials: true,
  });

  socket.on("connect", () => {
    console.log("Connected to WebSocket server");
  });

  socket.on("disconnect", () => {
    console.log("Disconnected from WebSocket server");
  });

  return socket;
}

export default connectSocket;
