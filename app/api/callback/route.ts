import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");

  if (!code) {
    return NextResponse.json({ error: "Missing 'code' parameter" }, { status: 400 });
  }

  return NextResponse.json({ code }, { status: 200 });
}

export async function POST() {
  return NextResponse.json({ error: "Method Not Allowed" }, { status: 405 });
}
