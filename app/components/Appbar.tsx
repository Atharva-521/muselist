"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const { verify } = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || "secret"; // ensure this is the same secret used to sign the token

/**
 * Decodes and verifies a JWT token.
 * @param {string} token - The JWT token to decode.
 * @returns {object|null} - The decoded payload if verification succeeds, or null if it fails.
 */
function decodeAndVerifyToken(token : any) {
  try {
    const decoded = verify(token, secret);
    console.log("Decoded token:", decoded);
    return decoded;
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}

export default function Appbar() {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  // On mount, check for the JWT in localStorage.
  useEffect(() => {
    const token = localStorage.getItem("museToken");
    if (token) {
      // For simplicity, we just save the token as user info.
      // In a real app you might decode the token to get user details.
      const payload = decodeAndVerifyToken(token);
      setUser({ payload  });
    } else {
      setUser(null);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("museToken");
    setUser(null);
    router.push("/"); // redirect to home after logout
  };

  return (
    <div className="flex justify-between items-center px-5 py-3 bg-white mb-10 shadow-md">
      <h1 className="text-3xl font-bold text-center text-purple-800">MuseList</h1>
      <div>
        {user ? (
          <button
            className="m-2 p-2 bg-red-400 text-white rounded-md"
            onClick={handleLogout}
          >
            Logout
          </button>
        ) : (
          <>
            <Link href="/login" className="m-2 p-2 bg-blue-400 text-white rounded-md">
              Login
            </Link>
            <Link href="/register"  className="m-2 p-2 bg-green-400 text-white rounded-md">
              Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
