"use client";
import { useState, useEffect, useMemo, useRef, useCallback, Suspense } from "react";
import { scopeOptions, environments } from "./constants";
import { FormDataWithCode } from "@/types/api";
import { Header, Footer, ApiCaller, StepWizard, LoginForm, SearchParamsHandler }  from "@/components";
import { safeDecode } from "@/utils/safeDecode";
import { generateAuthUrl } from "@/utils/url";
import { usePersistentFormData } from "@/hook/usePersistentFormData";


export default function Home() {

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] =  useState<string | null>(null);
  const [code, setCode] =  useState<string | null>(null);
  const [selectedScope, setSelectedScope] = useState<string[]>([]);
  const hasHandledCode = useRef(false);

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
  
  const [formData, setFormData] = usePersistentFormData("openxpandFormData", initialFormData);
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

    if (searchParams.get("error") !== null) {
      setError(`${searchParams.get("error")} selected`);
      return;
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
    setFormData({...formData,[e.target.name]: e.target.value,});
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
    setFormData(formData);
    window.location.href = generateAuthUrl(formData);
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
  }, [setFormData]);

  return (
    <>
      <Suspense fallback={
          <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
            <span className="text-xl font-roboto text-openxpand">Loading...</span>
          </div>
      }>
        <SearchParamsHandler onParamsChange={handleSearchParamsChange} />
      </Suspense>
      <Header />
      <main className="flex-grow flex justify-center items-center">
      {
          !accessToken ? (
            <LoginForm formData={formData}
              handleSubmit={handleSubmit}
              handleChange={handleChange}
              handleScopeChange={handleScopeChange}
              isLoading={isLoading}
              error={error}
              formattedScopeOptions={formattedScopeOptions}
            />
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
      <Footer />
    </>
  );
}
