import { NextResponse } from "next/server";

export async function GET(req : any) {
  req.session.destroy();
  return NextResponse.redirect(new URL("/", req.url));
}
