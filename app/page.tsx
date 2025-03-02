"use client";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import Image from "next/image";
import { scopeOptions, environments } from "./constants";
import { useLocalStorage } from "../hook/useLocalStorage";
import { FormData, FormDataWithCode } from "@/types/api";
import { ApiCaller }  from "@/components/ApiCaller";
import { StepWizard } from "@/components/StepWizard";
import { SearchParamsHandler } from "@/components/SearchParamsHandler";


export default function Home() {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] =  useState<string | null>(null);
  const [code, setCode] =  useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
  const hasHandledCode = useRef(false);

  const safeDecode = (value: string) => {
    try {
      return value && value !== "" ? atob(decodeURIComponent(value)) : "";
    }  catch (error: unknown) {
  
      if (error instanceof Error) {
        console.error("Error detailed:", error.message);
      } else {
        console.error("Unkown error:", error);
      }
  
      return "";
    }
  };

  
  const formattedScopeOptions = useMemo(
    () =>
      scopeOptions.map((option: string) => {
        const [key, value] = option.split("#");
        return { key: value, fullValue: `${key}#${value}` };
      }),
    []
  );

  const initialFormData = {
    clientId: "",
    clientSecret: "",
    tenant: "",
    scope: [],
    environment: "sandbox",
  };
  
  const [storedData, setStoredData] = useLocalStorage("openxpandFormData", initialFormData);
  const [formData, setFormData] = useState<FormData>(storedData);
  const formDataWithCode: FormDataWithCode = {
    ...formData, 
    code,
    host: environments[formData.environment as keyof typeof environments].auth
  };

  const handleSearchParamsChange = (searchParams: URLSearchParams) => {
    const clientIdDecrypted = safeDecode(searchParams.get("clientId") || "");
    const clientSecretDecrypted = safeDecode(searchParams.get("clientSecret") || "");
    const tenantDecrypted = safeDecode(searchParams.get("tenant") || "");
    const scopeFromParams = searchParams.get("scope")?.split(" ") || [];

    const matchedScopes = scopeOptions.filter(option => {
      const [, optionValue] = option.split("#");
      return scopeFromParams.includes(optionValue);
    });

    const newFormData = {
      ...formData,
      clientId: clientIdDecrypted || formData.clientId,
      clientSecret: clientSecretDecrypted || formData.clientSecret,
      tenant: tenantDecrypted || formData.tenant,
      scope: matchedScopes.length > 0 ? matchedScopes : formData.scope,
    };

    if (JSON.stringify(newFormData) !== JSON.stringify(formData)) {
      setFormData(newFormData);
    }

    const newCode = searchParams.get("code");
    if (newCode && !hasHandledCode.current) {
      hasHandledCode.current = true;
      setCode(newCode);
      handleCodeExchange(newCode);
      window.history.replaceState({}, document.title, "/");
    }
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  const handleScopeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedScopes = checked
        ? [...new Set([...prevData.scope, value])]
        : prevData.scope.filter((scope) => scope !== value);

      return { ...prevData, scope: updatedScopes };
    });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const { clientId, clientSecret, scope, tenant, environment } = formData;
    if (!clientId || !clientSecret || scope.length === 0 || !tenant || !environment) {
      setError("Please fill in all the required fields");
      return;
    }
    setError(null);
    handleLogin();
  };

  const handleLogin = () => {
    const { clientId, scope, tenant, environment } = formData;
    const { auth } = environments[environment as keyof typeof environments];
    setStoredData(formData);

    const url = `${auth}/auth/realms/${tenant}/protocol/openid-connect/auth?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      window.location.origin
    )}&scope=${encodeURIComponent(scope.join(" "))}`;

    window.location.href = url;
  };

  const handleCodeExchange = useCallback(
    async (code: string) => {
      setIsLoading(true);
      try {
        const { environment, scope } = formData;
        const { auth } = environments[environment as keyof typeof environments];
        setSelectedScope(scope);
  
        const response = await fetch("/api/token", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            code,
            redirect_uri:window.location.origin,
            client_id: formData.clientId,
            client_secret: formData.clientSecret,
            auth_url: auth,
            tenant: formData.tenant,
          }),
        });
  
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
  
        const data = await response.json();
        setCode(code);
        setAccessToken(data.access_token);
      } catch (err) {
        console.error("handleCodeExchange error:", err);
        setError("Error getting access token");
      } finally {
        setIsLoading(false);
      }
    },
    [formData]
  );
  
  useEffect(() => {
    setFormData((prev) => ({ ...prev }));
  }, []);

  return (
    <>
      <Suspense fallback={<div></div>}>
        <SearchParamsHandler onParamsChange={handleSearchParamsChange} />
      </Suspense>

      <header className="pl-6 pt-[0.8rem]">
        <Image
          className="dark:invert"
          src="/logo.svg"
          alt="Next.js logo"
          width={192}
          height={33}
          priority
        />
      </header>
      <main className="flex-grow flex justify-center items-center">
      {
          !accessToken ? (
        <div className="bg-white text-openxpand p-10 rounded-2xl w-full sm:max-w-sm md:max-w-md">
          <h2 className="text-2xl font-roboto font-semibold mb-8">Quick Tester</h2>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col">
              <label htmlFor="clientId" className="block text-md font-medium">Client ID</label>
              <input
                type="text"
                id="clientId"
                name="clientId"
                value={formData.clientId}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="clientSecret" className="block text-md font-medium">Client Secret</label>
              <input
                type="password"
                id="clientSecret"
                name="clientSecret"
                value={formData.clientSecret}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="tenant" className="block text-md font-medium">Tenant</label>
              <input
                type="text"
                id="tenant"
                name="tenant"
                value={formData.tenant}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border rounded-md"
                disabled={isLoading}
              />
            </div>

            <div className="flex flex-col">
              <label htmlFor="environment" className="block text-md font-medium">Environment</label>
              <select
                id="environment"
                name="environment"
                value={formData.environment}
                onChange={handleChange}
                required
                className="w-full mt-1 p-2 border rounded-md"
                disabled={isLoading}
              >
                <option value="">-- Select an Environment --</option>
                {Object.keys(environments).map((env) => (
                  <option key={env} value={env}>
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col mt-3">
              <div className="grid grid-cols-2 gap-4">
                {formattedScopeOptions.map(({ key, fullValue }) => (
                      <label key={fullValue} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        name="scope"
                        value={fullValue}
                        checked={formData.scope.includes(fullValue)}
                        onChange={handleScopeChange}
                        disabled={isLoading}
                        className="h-4 w-4 rounded accent-openxpand appearance-auto"
                      />
                      <span className="text-md font-medium">{key}</span>
                    </label>
                ))}
              </div>
            </div>
            <button className="text-white px-6 py-2 rounded-md mt-4 mx-auto block hover:opacity-80 transition" disabled={isLoading}>
              {isLoading ? "Loading..." : "Log In"}
            </button>

          </form>
          
          {error && (
            <div className="mt-2 flex justify-center items-center text-center h-full">
              <p className="bg-red-100 text-red-700 border border-red-400 rounded-lg px-4 py-2 shadow-md">
                ⚠️ {error}
              </p>
            </div>
          )}
          

          </div>
          ) : (
          <>
            <div className="w-full sm:max-w-2xl md:max-w-4xl lg:max-w-5xl xl:max-w-6xl 2xl:max-w-7xl">
              <h2 className="text-2xl font-roboto font-semibold mb-[5vh] text-center">Quick Tester</h2>
              <ApiCaller accessToken={accessToken} environment={formData.environment} scope={selectedScope} />
              <StepWizard title={"How to implement this authorization code flow in your application"} env={formDataWithCode} />
            </div>
          </>
          )}

      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center my-4">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 text-openxpand"
          href="https://developer.openxpand.com/developer/es/telecom"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          Go to developer portal →
        </a>
      </footer>
    </>
  );
}
