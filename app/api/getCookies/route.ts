import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    const cookies = req.headers.get("cookie"); // ✅ Extract cookies from request headers

    return NextResponse.json({ cookies });
}