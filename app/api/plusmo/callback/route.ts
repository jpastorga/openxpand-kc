import { NextRequest, NextResponse } from "next/server";

const responseHeaders = {
  "Cache-Control": "no-store",
  "Referrer-Policy": "no-referrer",
  "X-Robots-Tag": "noindex",
};

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const codes = params.getAll("code");
  const states = params.getAll("state");
  if (codes.length !== 1 || states.length !== 1 || !codes[0].trim() || !states[0].trim()) {
    return NextResponse.json(
      { error: "Expected one non-empty 'code' and 'state' parameter" },
      { status: 400, headers: responseHeaders },
    );
  }

  // Fixed server-side destination; incoming redirect parameters never select the host.
  const configured = process.env.PLUSMO_KEYCLOAK_CALLBACK_URL;
  let destination: URL;
  try {
    if (!configured) throw new Error("Missing configuration");
    destination = new URL(configured);
    if (destination.protocol !== "https:" || destination.username || destination.password
      || destination.search || destination.hash
      || destination.pathname !== "/auth/realms/aggregator/plusmo/callback") {
      throw new Error("Invalid configuration");
    }
  } catch {
    return NextResponse.json(
      { error: "Plusmo callback destination is not configured" },
      { status: 503, headers: responseHeaders },
    );
  }
  destination.searchParams.set("code", codes[0]);
  destination.searchParams.set("state", states[0]);
  return NextResponse.redirect(destination, { status: 302, headers: responseHeaders });
}
