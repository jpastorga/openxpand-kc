import { useState } from "react";
import { makeRequest } from "@/lib/api"; 
import { environments } from "@/app/constants";

interface ApiErrorResponse {
    status: string;
    message: string;
    code: string;
  }
  
export function useApiRequest(accessToken: string, apiUrl: string, initialInputs: { [key: string]: string }) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [responses, setResponses] = useState<{ [key: string]: ApiErrorResponse | null }>({});
  const [inputs, setInputs] = useState(initialInputs);


  const handleSubmit = async (apiName: string, path: string, method = "POST") => {
    const inputData = inputs[apiName] || "";
    let parsedData = {};

    try {
      parsedData = inputData ? JSON.parse(inputData) : {};
    } catch (error) {
      console.error("Error parsing data:", error);
      return;
    }

    setLoading((prev) => ({ ...prev, [apiName]: true }));
    setResponses((prev) => ({ ...prev, [apiName]: null }));

    try {
      const { api } = environments[apiUrl as keyof typeof environments];
      const response = await makeRequest({
        method,
        url: `${api}/${path}`,
        data: parsedData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });
      setResponses((prev) => ({ ...prev, [apiName]: response }));
    } catch (error) {
      
      setResponses((prev) => ({
        ...prev,
        [apiName]: {
            status: `${(error as any)?.status || "unknown"}`,
            message: `${(error as any)?.message || "unknown"}`,
            code: `${(error as any)?.code || "unknown"}`,
          } as ApiErrorResponse,
      }));
    } finally {
      setLoading((prev) => ({ ...prev, [apiName]: false }));
    }
  };

  return { loading, responses, inputs, setInputs, handleSubmit };
}
