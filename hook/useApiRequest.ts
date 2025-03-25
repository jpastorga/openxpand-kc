import { useState } from "react";
import { makeRequest } from "@/lib/api"; 
import { environments } from "@/app/constants";
import { ApiErrorResponse } from "@/types/api";
import { CustomError } from "@/utils/CustomError";
  
export function useApiRequest(accessToken: string, environment: string, initialInputs: { [key: string]: string }) {
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
      const { api } = environments[environment as keyof typeof environments];
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
    } catch (error: unknown) {
      if (error instanceof Error) {
        const customError = error as CustomError;
        setResponses((prev) => ({
          ...prev,
          [apiName]: {
            status: customError.status || "unknown",
            message: customError.message || "unknown",
            code: customError.code || "unknown",
          } as ApiErrorResponse,
        }));
      } else {
        setResponses((prev) => ({
          ...prev,
          [apiName]: {
            status: "unknown",
            message: "unknown",
            code: "unknown",
          } as ApiErrorResponse,
        }));
      }
    } finally {
      setLoading((prev) => ({ ...prev, [apiName]: false }));
    }
  };

  return { loading, responses, inputs, setInputs, handleSubmit };
}
