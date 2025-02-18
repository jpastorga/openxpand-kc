import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";

import useLocalStorage from "../hooks/useLocalStorage";
import axios from "axios";
import styles from "../styles/Form.module.css";
import ApiCaller from "./ApiCaller";
import environments from "../constants/environments";
import scopeOptions from "../constants/scopes";
import StepWizard from "./StepWizard";

export default function App() {
  const router = useRouter();
  const { clientId, clientSecret, tenant, scope } = router.query;

  const safeDecode = (value) => {
    try {
      return value && value !== "" ? atob(decodeURIComponent(value)) : "";
    } catch (error) {
      console.error("Error al decodificar:", value, error.message);
      return "";
    }
  };

  const clientIdDecrypted = safeDecode(clientId);
  const clientSecretDecrypted = safeDecode(clientSecret);
  const tenantDecrypted = safeDecode(tenant);
  const parsedScope = scope ? decodeURIComponent(scope).split(" ") : [];
  
  const formattedScopeOptions = scopeOptions.map(option => {
    const [key, value] = option.split("#");
    return { key: value, value: key };
  });

  const initialFormData = {
    clientId: clientIdDecrypted || "",
    clientSecret: clientSecretDecrypted || "",
    scope: parsedScope,
    environment: Object.keys(environments)[0] || "",
    tenant: tenantDecrypted || "",
  };

  const [formData, setFormData] = useLocalStorage("openxpandFormData", initialFormData);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasHandledCode = useRef(false);

  const steps = [
    {
      title: "Step 1:",
      description: "Authorization code request (GET: user-side)",
      url: `https://opengw.dev.openxpand.com/auth/realms/telecom/protocol/openid-connect/auth?response_type=code&client_id=${formData.clientId}&redirect_uri=&scope=${encodeURIComponent(selectedScope?.join(" "))}`,
      method: "GET"
    },
    {
      title: "Step 2:",
      description: "Token request with authorization code (POST: client-side)",
      url: "https://opengw.dev.openxpand.com/auth/realms/telecom/protocol/openid-connect/token",
      method: "POST",
      headers: 'Content-Type: application/x-www-form-urlencoded',
      body: `"grant_type=authorization_code&code=&redirect_uri=&client_id=${formData.clientId}&client_secret=${formData.clientSecret}"`
    },
  ];


  useEffect(() => {
    if (router.isReady) {
      setFormData((prevData) => ({
        ...prevData,
        clientId: clientIdDecrypted || prevData.clientId,
        clientSecret: clientSecretDecrypted || prevData.clientSecret,
        tenant: tenantDecrypted || prevData.tenant,
        scope: parsedScope.map(s => formattedScopeOptions.find(opt => opt.key === s)?.value + "#" + s).filter(Boolean),
      }));
    }
  }, [router.isReady, clientIdDecrypted, clientSecretDecrypted, tenantDecrypted, scope, setFormData]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleScopeChange = (e) => {
    const { value, checked } = e.target;
    setFormData((prevData) => {
      const updatedScopes = checked
        ? [...prevData.scope, value]
        : prevData.scope.filter((scope) => scope !== value);
      return {
        ...prevData,
        scope: updatedScopes,
      };
    });
  };

  const handleSubmit = (e) => {
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
    const { auth } = environments[environment];
    
    const url = `${auth}/auth/realms/${tenant}/protocol/openid-connect/auth?response_type=code&client_id=${encodeURIComponent(
      clientId
    )}&redirect_uri=${encodeURIComponent(
      window.location.origin
    )}&scope=${encodeURIComponent(scope.join(" "))}`;

    window.location.href = url;
  };

  const handleCodeExchange = useCallback(
    async (code) => {
      setIsLoading(true);
      try {
        const { environment, scope } = formData;
        const { auth } = environments[environment];
        setSelectedScope(scope);
        const response = await axios.post("/api/auth/token", {
          code,
          redirect_uri: window.location.origin,
          client_id: formData.clientId,
          client_secret: formData.clientSecret,
          auth_url: auth,
          tenant: formData.tenant,
        });

        setAccessToken(response.data.access_token);
      } catch (err) {
        console.error("handleCodeExchange error:", err.response?.data || err.message);
        setError("Error getting access token");
      } finally {
        setIsLoading(false);
      }
    },
    [formData]
  );

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get("code");

    if (code && !hasHandledCode.current) {
      hasHandledCode.current = true;
      handleCodeExchange(code);
      window.history.replaceState({}, document.title, "/");
    }
  }, [handleCodeExchange]);

  return (
    <div className={styles.container}>
      <h1 className="text-3xl font-bold mb-6 font-sans">Openxpand Quick Tester</h1>
      {!accessToken ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="clientId" className="font-sans text-gray-900 font-bold">Client Id:</label>
            <input
              type="text"
              id="clientId"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="clientSecret" className="font-sans text-gray-900 font-bold">Client Secret:</label>
            <input
              type="password"
              id="clientSecret"
              name="clientSecret"
              value={formData.clientSecret}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tenant" className="font-sans text-gray-900 font-bold">Tenant:</label>
            <input
              type="text"
              id="tenant"
              name="tenant"
              value={formData.tenant}
              onChange={handleChange}
              required
              className={styles.input}
              disabled={isLoading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="environment" className="font-sans text-gray-900 font-bold">Environment:</label>
            <select
              id="environment"
              name="environment"
              value={formData.environment}
              onChange={handleChange}
              required
              className={styles.input}
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

          <div className={styles.formGroup}>
            <label className="font-sans text-gray-900 font-bold">Scopes:</label>
            <div className={styles.scopeContainer}>
              {formattedScopeOptions.map(({ key, value }) => (
                <label key={key} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="scope"
                    value={`${value}#${key}`}
                    checked={formData.scope.includes(`${value}#${key}`)}
                    onChange={handleScopeChange}
                    className={styles.checkbox}
                    disabled={isLoading}
                  />
                  {key}
                </label>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center font-bold">
            <button type="submit" className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`} disabled={isLoading}>
              {isLoading ? "Loading..." : "Log in"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <ApiCaller accessToken={accessToken} apiUrl={formData.environment} scope={selectedScope} />
          <div className="w-full max-w-[1200px] mt-8 flex flex-col items-center">
            {isLoading ? (
              <p className="text-lg font-semibold text-blue-500">Loading...</p>
            ) : (
              <>
                <StepWizard title={"How to implement this authorization code flow in your application"} steps={steps} />
                <button
                  className={`${styles.clearButton} mt-4`}
                  onClick={() => { window.location.href = window.location.origin; }}
                >
                  Bye
                </button>
              </>
            )}
          </div>
        </>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
