import { NextResponse } from "next/server";
import passport from "../../../lib/passport";
import { sessionMiddleware } from "../../../lib/session";

export async function GET(req : any, res : any, next : any) {
  try {
    // Apply session middleware manually
    await sessionMiddleware(req, res, next);

    // Initialize passport
    await passport.initialize()(req, res, next);
    await passport.session()(req);

    return passport.authenticate("google", { scope: ["profile", "email"] })(req);
  } catch (error) {
    console.error("Google Login Error:", error);
    return NextResponse.json({ message: "Login failed" }, { status: 500 });
  }
}
