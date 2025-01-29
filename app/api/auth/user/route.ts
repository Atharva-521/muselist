import { NextResponse } from "next/server";

export async function GET(req : any) {
  const user = req.session?.passport?.user || null;

  return NextResponse.json(user);
}
