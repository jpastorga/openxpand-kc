import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/router";

import useLocalStorage from "../hooks/useLocalStorage";
import axios from "axios";
import styles from "../styles/Form.module.css";
import ApiCaller from "./ApiCaller";
import environments from "../constants/environments";
import scopeOptions from "../constants/scopes";

export default function App() {
  const router = useRouter();
  const { clientId, clientSecret, tenant, scope } = router.query;
  const parsedScope = scope ? decodeURIComponent(scope).split(" ") : [];
  
  const formattedScopeOptions = scopeOptions.map(option => {
    const [key, value] = option.split("#");
    return { key: value, value: key };
  });

  const initialFormData = {
    clientId: clientId || "",
    clientSecret: clientSecret || "",
    scope: parsedScope,
    environment: Object.keys(environments)[0] || "",
    tenant: tenant || "",
  };


  const [formData, setFormData] = useLocalStorage("openxpandFormData", initialFormData);
  const [accessToken, setAccessToken] = useState(null);
  const [selectedScope, setSelectedScope] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasHandledCode = useRef(false);

  useEffect(() => {
    if (router.isReady) {
      setFormData((prevData) => ({
        ...prevData,
        clientId: clientId || prevData.clientId,
        clientSecret: clientSecret || prevData.clientSecret,
        tenant: tenant || prevData.tenant,
        scope: parsedScope.map(s => formattedScopeOptions.find(opt => opt.key === s)?.value + "#" + s).filter(Boolean),
      }));
    }
  }, [router.isReady, clientId, clientSecret, tenant, scope, setFormData]);

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
      <h1 className={styles.title}>Openxpand Quick Tester</h1>
      {!accessToken ? (
        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="clientId" className={styles.label}>Client Id:</label>
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
            <label htmlFor="clientSecret" className={styles.label}>Client Secret:</label>
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
            <label htmlFor="tenant" className={styles.label}>Tenant:</label>
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
            <label htmlFor="environment" className={styles.label}>Environment:</label>
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
            <label className={styles.label}>Scopes:</label>
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

          <div className={styles.buttonGroup}>
            <button type="submit" className={`${styles.submitButton} ${isLoading ? styles.loading : ""}`} disabled={isLoading}>
              {isLoading ? "Loading..." : "Iniciar Sesión"}
            </button>
          </div>
        </form>
      ) : (
        <>
          <ApiCaller accessToken={accessToken} apiUrl={formData.environment} scope={selectedScope} />
          <div className="mt-8 flex flex-col items-center">
            {isLoading ? (
              <p className="text-lg font-semibold text-blue-500">Loading...</p>
            ) : (
              <>
                <p className="text-lg font-semibold mb-2">Access Token:</p>
                <textarea
                  value={accessToken}
                  readOnly
                  rows={5}
                  cols={60}
                  className={`${styles.textarea} text-sm`}
                />
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
