import { io } from "socket.io-client";
import { getSession } from "next-auth/react";

async function connectSocket() {
    const session : any = await getSession();
    console.log("Session token is : ", session);
    if (!session?.accessToken) {
      console.error("No JWT found in session!");
      return;
    }
  
    const socket = io("http://localhost:8080", {
      auth: { token: session.accessToken },
      withCredentials: true // Send the correct JWT
    });
  
    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });
  
    socket.on("disconnect", () => {
      console.log("Disconnected");
    });

    async function sendRequest() {
        // Fetch cookies from the browser
        const response = await fetch("/api/getCookies");
        const { cookies } = await response.json();
    
        console.log("Cookies before sending to WebSocket:", cookies);

        return cookies;
    
    }

    const cookies = await sendRequest();
  
    return {socket, cookies};
  }



  
  export default connectSocket;