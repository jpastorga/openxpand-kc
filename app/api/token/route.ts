import { NextRequest, NextResponse } from "next/server";

interface TokenRequestBody {
  code: string;
  redirect_uri: string;
  client_id: string;
  client_secret: string;
  auth_url: string;
  tenant: string;
}

export async function POST(req: NextRequest) {
  try {
    const requestBody: TokenRequestBody = await req.json();
    const { code, redirect_uri, client_id, client_secret, auth_url, tenant } = requestBody;
    const tokenUrl = `${auth_url}/auth/realms/${tenant}/protocol/openid-connect/token`;

    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri,
        client_id,
        client_secret,
      }).toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 200 });

  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
