
import NextAuth from "next-auth"
import { prismaClient } from "@/app/lib/db";

import { authOptions } from "./authOptions";

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST }