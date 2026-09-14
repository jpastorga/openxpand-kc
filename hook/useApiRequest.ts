import { useState } from "react";
import { makeRequest } from "@/lib/api"; 
import { environments } from "@/app/constants";
import { ApiErrorResponse } from "@/types/api";
import { CustomError } from "@/utils/CustomError";
  
export function useApiRequest(accessToken: string, environment: string, initialInputs: { [key: string]: string }) {
  const [loading, setLoading] = useState<{ [key: string]: boolean }>({});
  const [responses, setResponses] = useState<{ [key: string]: ApiErrorResponse | null }>({});
  const [inputs, setInputs] = useState(initialInputs);
  const [pathIds, setPathIds] = useState<Record<string, string>>({
    profileName: "prorizacion_api_qod",
  });


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
      if (apiName === "qosProvisioningCreate" && response?.assignmentId) {
        setPathIds((prev) => ({ ...prev, assignmentId: String(response.assignmentId) }));
      }
      if (apiName === "smsDeliveryCreate" && response?.subscriptionId) {
        setPathIds((prev) => ({ ...prev, subscriptionId: String(response.subscriptionId) }));
      }
      if (apiName === "otpSendCode" && response?.authenticationId) {
        setPathIds((prev) => ({ ...prev, authenticationId: String(response.authenticationId) }));
        setInputs((prev) => {
          try {
            const current = prev.otpValidateCode ? JSON.parse(prev.otpValidateCode) : {};
            return {
              ...prev,
              otpValidateCode: JSON.stringify(
                { ...current, authenticationId: String(response.authenticationId) },
                null,
                2
              ),
            };
          } catch {
            return prev;
          }
        });
      }
    } catch (error: unknown) {
      if (error instanceof CustomError) {
        setResponses((prev) => ({
          ...prev,
          [apiName]: error.response,
        }));
      } else if (error instanceof Error) {
        setResponses((prev) => ({
          ...prev,
          [apiName]: {
            status: "unknown",
            message: error.message || "unknown",
            code: "unknown",
          },
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

  return { loading, responses, inputs, setInputs, handleSubmit, pathIds };
}
