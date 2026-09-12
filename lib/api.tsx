import { MakeRequestOptions } from "@/types/api";
import { CustomError } from "@/utils/CustomError";
import { http2Fetch } from "./http2-client";


export const makeRequest = async (options: MakeRequestOptions) => {

    const { method = "POST", url, data = {}, headers = {} } = options;

    try {
      const config = {
        method,
        headers: {
          "Content-Type": "application/json",
          ...headers,
        },
        ...(method !== "GET" && method !== "DELETE" ? { body: JSON.stringify(data) } : {}),
      };
      let queryString = "";
      if (method === "GET" && data && typeof data === "object" && !Array.isArray(data)) {
        const params = new URLSearchParams(data as Record<string, string>).toString();
        if (params) queryString = "?" + params;
      }

      const response = await http2Fetch(url + queryString, config);
      const raw = await response.text();
      const parsed = raw ? JSON.parse(raw) : null;

      if (!response.ok) {
        throw new CustomError(
          parsed?.status || String(response.status),
          String(parsed?.message || response.statusText || "Request failed").substring(0, 50),
          parsed?.code || String(response.status)
        );
      }

      return parsed ?? { status: response.status };
    } catch (error) {
      //console.error("Error making request:", error);
      throw error;
    }
};