import { NextRequest, NextResponse } from "next/server";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
};

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing 'code' or 'state' parameter" },
      { status: 400, headers: responseHeaders },
    );
  }

  return NextResponse.json(
    { status: "callback_received", code, state },
    { headers: responseHeaders },
  );
}
