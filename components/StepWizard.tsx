import { useState, useRef } from "react";
import { steps } from "@/app/constants";
import { StepWizardProps, FormDataWithCode } from "@/types/api";
import { replacePlaceholders } from "@/utils/stringUtils";
  
export function StepWizard({title, env}: StepWizardProps) {
  const [activeStep, setActiveStep] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const codeRefs = useRef<HTMLElement[]>([]);

  const toggleStep = (index: number) => {
    setActiveStep(activeStep === index ? null : index);
  };

  const handleCopy = (index: number) => {
    const codeElement = codeRefs.current[index];
    if (codeElement) {
      navigator.clipboard.writeText(codeElement.innerText)
        .catch(err => console.error("Error al copiar:", err));
    }
  };

  const generateCurlCommand = (body: string, env: FormDataWithCode) => {
    const replacedBody = replacePlaceholders(body, env)
    const bodyParams = replacedBody.split("&")
        .map(param => {
            const [key, value] = param.split("=");
            return `--data-urlencode '${key}=${decodeURIComponent(value || "")}'`;
        })
        .join(" ");

    return `${bodyParams}`;
  }

  return (
    <div className="flex justify-center items-center">
      <div className="mt-6 flex rounded-xl flex-col border p-6 bg-white w-full max-w-3xl">

        <div className="flex items-center gap-1 cursor-pointer" onClick={() => setIsOpen(!isOpen)}>
          <h2 className="text-openxpand font-bold text-xl">{title}</h2>
          <svg
            className={`w-5 h-5 transform transition-transform duration-300 ${
              isOpen ? "rotate-180" : "rotate-0"
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>

        {isOpen && (
          <div className="space-y-4">
            <div className="border rounded-md p-6 text-sm text-openxpand font-roboto">
              <span>
                Before starting the authentication code flow process, it is essential to understand the required parameters:
              </span>
              <div className="grid grid-cols-2">
                <div className="border border-gray-100 p-4">redirect_uri</div>
                <div className="border border-gray-100 p-4">
                  The redirect URI is the destination to which the OIDC provider sends the authorization code after the user successfully authenticates by network-based authentication.
                </div>
                <div className="border border-gray-100 p-4">scope</div>
                <div className="border border-gray-100 p-4">
                  The scope parameter is a list of scopes that the client wants to request access to.
                </div>
              </div>
            </div>

            {steps.map((step, index) => (
              <div key={index} className="bg-light border rounded-md p-4">
                <button
                  onClick={() => toggleStep(index)}
                  className="w-full px-2 text-left rounded border border-gray-300 bg-white flex justify-between items-center text-sm font-medium text-openxpand"
                >
                  <span className="font-bold text-openxpand">{step.title}</span>
                  <label className="p-2 text-openxpand">{step.description}</label>
                  <svg
                    className={`w-5 h-5 transform transition-transform duration-300 ${activeStep === index ? "rotate-180" : "rotate-0"}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {activeStep === index && (
                    <div key={index}  className="p-2 rounded">
                        <div className="bg-gray-800 text-white p-2 rounded-lg flex items-center gap-2">
                            <code ref={(el: HTMLElement | null) => {
                                if (el) {
                                    codeRefs.current[index] = el;
                                }
                                }} className="break-all">
                                curl --location {`'${replacePlaceholders(step.url, env, ["scope"])}'`} {step.headers ? `-H '${step.headers}'` : ''} {step.body ? generateCurlCommand(step.body, env) : ''}
                            </code>
                            <button onClick={() => handleCopy(index)} className="p-2 text-white bg-gray-700 rounded-md hover:bg-gray-600 transition">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                                </svg>
                                </button>
                        </div>
                    </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
