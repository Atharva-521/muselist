// lib/passport.ts
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID!,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  callbackURL: `${process.env.NEXTAUTH_URL}/api/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  // Create or find user in your database
  const user = {
    id: profile.id,
    email: profile.emails?.[0].value,
    name: profile.displayName
  };
  
  return done(null, user);
}));

export default passport;