import { ApiErrorResponse, MakeRequestOptions } from "@/types/api";
import { CustomError } from "@/utils/CustomError";


export const makeRequest = async (options: MakeRequestOptions): Promise<ApiErrorResponse> => {

    const { method = "POST", url, data = {}, headers = {} } = options;

    try {
      const config = {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ method, url, data, headers }),
      };

      const response = await fetch("/api/request", config);
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
