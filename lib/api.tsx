import { ApiErrorResponse, MakeRequestOptions } from "@/types/api";
import { CustomError } from "@/utils/CustomError";
import { http2Fetch } from "./http2-client";


export const makeRequest = async (options: MakeRequestOptions): Promise<ApiErrorResponse> => {

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
      let parsed: unknown = null;

      try {
        parsed = raw ? JSON.parse(raw) : null;
      } catch {
        // APIs sometimes return an HTML or plain-text error response.
      }

      if (!response.ok) {
        const errorBody = parsed && typeof parsed === "object" && !Array.isArray(parsed)
          ? parsed as Record<string, unknown>
          : {};

        throw new CustomError({
          ...errorBody,
          status: String(errorBody.status ?? response.status),
          message: String(errorBody.message ?? (raw || response.statusText || "Request failed")),
          code: String(errorBody.code ?? response.status),
        } as ApiErrorResponse);
      }

      if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
        return parsed as ApiErrorResponse;
      }

      return {
        status: String(response.status),
        message: raw || response.statusText,
        code: String(response.status),
      };
    } catch (error) {
      //console.error("Error making request:", error);
      throw error;
    }
};
