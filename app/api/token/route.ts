import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const requestBody = await req.json();
    const { code, redirect_uri, client_id, client_secret, auth_url, tenant } = requestBody;
    const tokenUrl = `${auth_url}/auth/realms/${tenant}/protocol/openid-connect/token`;
    console.log("tokenUrl", tokenUrl);
    try {
      const response = await fetch(tokenUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri,
          client_id,
          client_secret,
        }).toString(),
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error al intercambiar el código por token:', errorData);
        return NextResponse.json(errorData, { status: response.status });
      }
  
      const data = await response.json();
      return NextResponse.json(data, { status: 200 });
    } catch (error: any) {
      console.error('Error al obtener access_token:', error.message);
      return NextResponse.json({ error: 'Error al obtener access_token' }, { status: 500 });
    }
  }
  