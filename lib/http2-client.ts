// Server-side HTTP/2 client using undici (Node.js only)
export const http2Fetch = async (url: string, options: RequestInit = {}) => {
  // Check if we're running on the server
  if (typeof window === 'undefined') {
    // Dynamic import to avoid bundling undici in the client
    const { fetch: undiciFetch, Agent } = await import('undici');

    const http2Agent = new Agent({
      allowH2: true,
      pipelining: 10,
    });

    // Convert standard RequestInit to undici RequestInit
    const undiciOptions = {
      method: options.method,
      headers: options.headers,
      body: options.body as string | Buffer | undefined,
      dispatcher: http2Agent,
    };

    return undiciFetch(url, undiciOptions);
  }

  // Client-side: use the browser's native fetch (which supports HTTP/2 automatically)
  return fetch(url, options);
};
