import { prismaClient } from "@/app/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import jwt from "jsonwebtoken";

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
      authorization: {
        params: { prompt: "consent", access_type: "offline", response_type: "code", redirect_uri: process.env.NEXTAUTH_URL + "/api/auth/callback/google", },
      },
    })
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  session: {
    strategy: "jwt", // Ensures we use JWTs instead of database sessions
  },
  cookies: {
    sessionToken: {
      name: `__Secure-next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      }
    }
  },
  callbacks: {
    async signIn(params: any) {
      if (!params.user.email) {
        return false;
      }
      try {
        await prismaClient.user.upsert({
          where: { email: params.user.email },
          update: {},
          create: {
            email: params.user.email,
            provider: "Google",
          },
        });
      } catch (e) {
        console.log("Error while signing in:", e);
      }
      return true;
    },

    async jwt({ token, account, user }) {
      if (account) {
        token.accessToken = jwt.sign(
          { userId: user.id },
          process.env.NEXTAUTH_SECRET ?? "secret", // Sign a JWT for WebSocket auth
          { expiresIn: "1h" }
        );
        token.userId = user.id;
      }
      return token;
    },

    async session({ session, token }: { session: any, token: any }) {
      console.log("🔹 Session Callback - Token:", token);
      console.log("🔹 Session Callback - Session before modification:", session);

      session.accessToken = token.accessToken; // Attach our JWT to the session
      session.user.id = token.sub;
      console.log("✅ Final Session:", session);
      return session;
    },
  }
};
