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
        ...(method !== "GET" ? { body: JSON.stringify(data) } : {}),
      };
      let queryString = "";
      if (method === "GET" && data) {
        if (typeof data === 'object' && !Array.isArray(data)) {
            queryString = "?" + new URLSearchParams(data as Record<string, string>).toString();
        }
      }

      const response = await http2Fetch(url + queryString, config);
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(errorData.status, errorData.message.substring(0, 50), errorData.code);
      }

      return await response.json();
    } catch (error) {
      //console.error("Error making request:", error);
      throw error;
    }
};