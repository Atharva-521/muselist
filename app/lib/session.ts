import session from "express-session";

export const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "supersecret",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }, // Set `secure: true` for production with HTTPS
});
