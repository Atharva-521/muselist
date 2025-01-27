import { prismaClient } from "@/app/lib/db";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";

export const authOptions: NextAuthOptions = {
    // i want to use google
    providers: [
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID ?? "",
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? ""
      })
    ],
    secret: process.env.NEXTAUTH_SECRET ?? "secret",
    callbacks:{
      async signIn(params : any){
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
  }