import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { string } from "zod";

passport.use(
  new GoogleStrategy(
    {
      clientID  : process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      callbackURL: "http://localhost:3000/api/auth/callback",
    } ,
    (accessToken : any , refreshToken : any , profile : any, done : any) => {
      done(null, profile);
    }
  )
);

// Serialize user
passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user : any, done) => {
  done(null, user);
});

export default passport;
