import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Clipboard } from "lucide-react";

export default function CurlGenerator({ url, method = "POST", accessToken = null, body = null }) {

  const [curlCommand, setCurlCommand] = useState("");
  const [displayCurlCommand, setDisplayCurlCommand] = useState("");

  const generateCurl = () => {
    const headers = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    };

    let curl = `curl -X ${method} '${url}'`;
    
    Object.entries(headers).forEach(([key, value]) => {
      curl += ` -H '${key}: ${value}'`;
    });
    
    if (method !== "GET" && body) {
      curl += ` -d '${body}'`;
    }

    const maskedToken = accessToken ? accessToken.substring(0, 6) + "..." + accessToken.slice(-4) : null;
    let displayCurl = `curl -X ${method} '${url}'`;

    Object.entries(headers).forEach(([key, value]) => {
      const maskedValue = key === "Authorization" ? `Bearer ${maskedToken}` : value;
      displayCurl += ` -H '${key}: ${maskedValue}'`;
    });
    
    if (method !== "GET" && body) {
      displayCurl += ` -d '${body}'`;
    }

    setCurlCommand(curl); 
    setDisplayCurlCommand(displayCurl);
    navigator.clipboard.writeText(curl);
  };

  return (
    <div className="mt-2 flex flex-col">
      <Button variant="outline" onClick={generateCurl}>Show as cURL command</Button>
      {displayCurlCommand && (
        <div className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2">
          <code className="break-all">{displayCurlCommand}</code>
          <Clipboard 
             style={{ width: "60px", height: "60px" }} 
             className="cursor-pointer p-2 m-1 bg-gray-700 rounded hover:bg-gray-600"
            onClick={() => navigator.clipboard.writeText(curlCommand)} />
        </div>
      )}
    </div>
  );
}
