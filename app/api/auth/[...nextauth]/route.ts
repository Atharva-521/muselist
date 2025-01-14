import GoogleProvider from "next-auth/providers/google";
import NextAuth from "next-auth"
import { prismaClient } from "@/app/lib/db";

const handler = NextAuth({
  // i want to use google
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
    })
  ],
  secret: process.env.NEXTAUTH_SECRET ?? "secret",
  callbacks:{
    async signIn(params){
      //console.log("params":params);
      if(!params.user.email){
        return false;
      }
      try{
        const resp = await prismaClient.user.create({
          data: {
          email: params.user.email,
          provider: "Google"
          }
        })
        console.log(resp)
      }catch(e){
        console.log("error while signing in")
      }
      return true
    }
  }
})

export { handler as GET, handler as POST }