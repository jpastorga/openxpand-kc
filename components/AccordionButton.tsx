import { useState, memo, useCallback, useMemo, useEffect } from "react";
import { apiList, environments } from "@/app/constants";
import { ApiErrorResponse } from "@/types/api";

interface AccordionButtonProps {
  onClick: () => void;
  isActive: boolean;
  name: string;
  path: string;
  label: string;
  description: string;
  accessToken: string;
  environment: string;
  loading: { [key: string]: boolean };
  responses: { [key: string]: ApiErrorResponse | null };
  inputs: { [key: string]: string };
  setInputs: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  handleSubmit: (apiName: string, path: string, method?: string) => Promise<void>;
  assignmentId: string | null;
}

function AccordionButton({
  onClick,
  isActive,
  name,
  path,
  label,
  description,
  accessToken,
  environment,
  loading,
  responses,
  inputs,
  setInputs,
  handleSubmit,
  assignmentId
}: AccordionButtonProps) {

  const [curlCommand, setCurlCommand] = useState<string | null>(null);
  const [copyLabel, setCopyLabel] = useState("Copy as CURL");

  const currentApi = useMemo(() => apiList.find((api) => api.name === name), [name]);
  const method = currentApi?.method || "POST";

  const actualPath = useMemo(() => {

    let updatedPath = path;

    if (assignmentId) {
      updatedPath = updatedPath.replace(/{assignmentId}/g, assignmentId);
    }

    return updatedPath;
  }, [path, assignmentId, name]);

  useEffect(() => {
    try {
      const currentInput = inputs[name] || "";
      if (currentInput && currentInput.trim()) {
        const parsed = JSON.parse(currentInput);
        const beautified = JSON.stringify(parsed, null, 2);
        if (currentInput !== beautified) {
          setInputs((prev) => ({ ...prev, [name]: beautified }));
        }
      }
    } catch {
      console.error("Error beautifying JSON:", error);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputs((prev) => ({ ...prev, [name]: event.target.value }));
  }, [setInputs, name]);

  const generateCurlCommand = useCallback(() => {
    if (!accessToken || !actualPath) return;
    setCopyLabel("Copied!");
    const requestData = inputs[name] && method !== "GET" && method !== "DELETE" ? `--data '${inputs[name]}'` : "";
    const fullCurl = `curl -X ${method} "${environments[environment as keyof typeof environments].api}/${actualPath}" -H "Authorization: Bearer ${accessToken}" -H "Content-Type: application/json" ${requestData}`;


    navigator.clipboard.writeText(fullCurl).then(() => {
      console.log("Copied to clipboard!");
    });

    const truncatedAccessToken =
      accessToken.substring(0, 6) + "..." + accessToken.slice(-4);
    const truncatedCurl = `curl -X ${method} "${environments[environment as keyof typeof environments].api}/${actualPath}" -H "Authorization: Bearer ${truncatedAccessToken}" -H "Content-Type: application/json" ${requestData}`;

    setCurlCommand(truncatedCurl);

    setTimeout(() => {
      setCurlCommand(null);
      setCopyLabel("Copy as CURL");
    }, 5000);
  }, [accessToken, actualPath, inputs, name, environment, method]);

  return (
    <>
      <button
        onClick={onClick}
        className="w-full px-2 py-2 text-left bg-white border border-gray-300 rounded focus:outline-none flex justify-between items-center"
      >
        <span className="font-roboto text-openxpand">{label}</span>
        <svg
          className={`w-5 h-5 transform transition-transform duration-300 ${
            isActive ? "rotate-180" : "rotate-0"
          }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isActive && (
        <div className="mt-2">
          <p className="text-openxpand text-sm mb-2">{description}</p>

          <textarea
            value={inputs[name] || ""}
            onChange={handleInputChange}
            className="font-mono text-openxpand text-sm w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows={6}
          ></textarea>

          <div className="flex items-center justify-center gap-2 mt-2">
            <button
              onClick={() => {
                handleSubmit(name, actualPath, method);
                setCurlCommand(null);
              }}
              className="text-white px-6 py-2 rounded-md hover:opacity-80 transition flex items-center justify-center"
              disabled={loading[name]}
            >
              {loading[name] ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                "Send Request"
              )}
            </button>

            <button
              onClick={generateCurlCommand}
              className="text-white px-6 py-2 rounded-md bg-gray-700 hover:opacity-80 transition"
            >
              {copyLabel}
            </button>
          </div>

          {curlCommand ? (
            <pre className="whitespace-pre-wrap break-words font-mono bg-gray-900 text-white p-2 rounded-md mt-2 text-sm">
              {curlCommand}
            </pre>
          ) : (
            responses[name] && (
              <pre className="whitespace-pre-wrap break-words font-mono text-openxpand bg-white p-2 rounded-md mt-2 text-sm border">
                {JSON.stringify(responses[name], null, 2)}
              </pre>
            )
          )}
        </div>
      )}
    </>
  );
}

export default memo(AccordionButton);