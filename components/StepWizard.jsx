import { useState, useRef } from "react";
import { Clipboard } from "lucide-react";

export default function StepWizard({title, steps}) {
  const [activeStep, setActiveStep] = useState(null);
  const codeRefs = useRef([]);

  if (!steps || steps.length === 0) {
    return null;
  }
  const toggleStep = (index) => {
    setActiveStep(activeStep === index ? null : index);
  };

  const handleCopy = (index) => {
    const codeElement = codeRefs.current[index];
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.innerText)
        .catch(err => console.error("Failed to copy:", err));
    }
  };

  const generateCurlCommand = (step) => {
    const bodyParams = step.split("&")
        .map(param => {
            const [key, value] = param.split("=");
            return `--data-urlencode '${key}=${decodeURIComponent(value || "")}'`;
        })
        .join(" ");

    return `${bodyParams}`;
  }

  return (
    <div className="mt-6 flex rounded-lg shadow-lg flex-col items-center border p-6 bg-gray-50">
      <h2 className="font-sans text-gray-900 font-bold text-2xl mb-4">{title}</h2>
      <div className="space-y-4">
        <div className="border rounded-md bg-white shadow-sm p-6">
          <span className="font-semibold font-sans text-gray-900">
          Before starting the authentication code flow process, it is essential to understand the required parameters.
          </span>
          <div className="grid grid-cols-2 border border-gray-300">
            <div className="border border-gray-300 p-4">redirect_uri</div>
            <div className="border border-gray-300 p-4">the redirect URI is the destination to which the OIDC provider sends the authorization code after the user successfully authenticates by network based authentication.</div>
            <div className="border border-gray-300 p-4">scope</div>
            <div className="border border-gray-300 p-4">The scope parameter is a list of scopes that the client wants to request access to.</div>
          </div>

        </div>
        {steps.map((step, index) => (
          <div key={index} className="border rounded-md bg-white shadow-sm p-6">
            <button
              onClick={() => toggleStep(index)}
              className="w-full px-2 text-left bg-gray-200 hover:bg-gray-300 flex justify-between items-center text-lg font-medium text-gray-800"
            >
              <span className="font-bold font-sans text-gray-900">{step.title}</span><label className="p-2 font-sans text-gray-900">{step.description}</label>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${
                        activeStep === index ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
            </button>
            {activeStep === index && (
              <div key={index}  className="mt-4 p-4 bg-gray-200 rounded-md">
                <div className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2">
                    <code ref={(el) => (codeRefs.current[index] = el)} className="break-all">
                      curl -X {step.method} {`'${step.url}'`} {step.headers ? `-H '${step.headers}'` : ''} {step.body ? generateCurlCommand(step.body) : ''}
                    </code>
                    <Clipboard  style={{ width: "60px", height: "60px" }} className="cursor-pointer p-2 m-1 bg-gray-700 rounded hover:bg-gray-600" onClick={() => handleCopy(index)} />
                  </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
