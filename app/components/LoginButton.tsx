"use client";

import { useState, useEffect } from "react";

export default function LoginButton() {
  const [user, setUser] = useState<any | null> (null);

  useEffect(() => {
    fetch("/api/auth/user")
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return user ? (
    <div>
      <p>Welcome, {user?.displayName}</p>
      <a href="/api/auth/logout">Logout</a>
    </div>
  ) : (
    <a href="/api/auth/login">Login with Google</a>
  );
}
