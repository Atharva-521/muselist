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
  
      return passport.authenticate("google", {
        failureRedirect: "/login",
        successRedirect: "/",
      })(req);
    } catch (error) {
      console.error("Google Callback Error:", error);
      return NextResponse.json({ message: "Callback failed" }, { status: 500 });
    }
  }