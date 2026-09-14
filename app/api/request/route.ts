import { NextRequest, NextResponse } from "next/server";
import { http2Fetch } from "@/lib/http2-client";

const allowedApiOrigins = new Set([
  "https://api.dev.openxpand.com",
  "https://api.test.openxpand.com",
  "https://api.openxpand.com",
]);

interface ProxyRequestBody {
  method?: string;
  url: string;
  data?: object;
  headers?: Record<string, string>;
}

export async function POST(request: NextRequest) {
  try {
    const { method = "POST", url, data = {}, headers = {} }: ProxyRequestBody = await request.json();
    const target = new URL(url);

    if (!allowedApiOrigins.has(target.origin) || !target.pathname.startsWith("/api/camara/")) {
      return NextResponse.json({ message: "Unsupported API URL" }, { status: 400 });
    }

    if (method === "GET" && data && typeof data === "object" && !Array.isArray(data)) {
      target.search = new URLSearchParams(data as Record<string, string>).toString();
    }

    const response = await http2Fetch(target.toString(), {
      method,
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      ...(method !== "GET" && method !== "DELETE" ? { body: JSON.stringify(data) } : {}),
    });
    const body = await response.text();

    return new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: {
        "Content-Type": response.headers.get("content-type") || "text/plain; charset=utf-8",
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to proxy API request";
    return NextResponse.json({ message }, { status: 500 });
  }
}
