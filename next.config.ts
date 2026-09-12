import path from "path";
import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

const connectSrc = [
  "'self'",
  "https://api.dev.openxpand.com",
  "https://api.test.openxpand.com",
  "https://api.openxpand.com",
];

if (isDev) {
  connectSrc.push("http://localhost:9091");
}

const scriptSrc = isDev
  ? "'self' 'unsafe-inline' 'unsafe-eval'"
  : "'self' 'unsafe-inline'";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src ${scriptSrc};
  style-src 'self' 'unsafe-inline';
  img-src 'self' data:;
  font-src 'self';
  connect-src ${connectSrc.join(" ")};
  object-src 'none';
  frame-ancestors 'none';
`;

const securityHeaders = [
  /*{
    key: "Strict-Transport-Security",
    value: "max-age=31536000; includeSubDomains; preload"
  },*/
  {
    key: "Content-Security-Policy",
    value: ContentSecurityPolicy.replace(/\n/g, "").trim()
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff"
  },
  {
    key: "X-Frame-Options",
    value: "DENY"
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin"
  },
  {
    key: "Cache-Control",
    value: "no-cache, no-store, must-revalidate, private"
  },
  {
    key: "Pragma",
    value: "no-cache"
  },
  {
    key: "Expires",
    value: "0"
  }
];

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(process.cwd()),
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders
      }
    ];
  }
};

export default nextConfig;
