// pages/index.js
import { useState, useEffect, useRef, useCallback } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import axios from 'axios';
import styles from '../styles/Form.module.css';
import ApiCaller from '../components/ApiCaller';
import environments from '../constants/environments'; 
import scopeOptions from '../constants/scopes'; 

const initialFormData = {
  clientId: '',
  clientSecret: '',
  scope: ['openid'],
  environment: '',
  tenant: '',
};

export default function Home() {

  const [formData, setFormData] = useLocalStorage('openxpandFormData', initialFormData);
  const [accessToken, setAccessToken] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasHandledCode = useRef(false);

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
        scope: updatedScopes
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const { clientId, clientSecret, scope, tenant, environment } = formData;
    if (!clientId || !clientSecret || scope.length === 0 || !tenant || !environment ) {
      setError('Please fill in all the required fields');
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
    )}&scope=${encodeURIComponent(scope.join(' '))}`;

    window.location.href = url;
  };

  const handleCodeExchange = useCallback(async (code) => {
    setIsLoading(true);
    try {
      const { environment } = formData;
      const { auth } = environments[environment];
      const response = await axios.post('/api/auth/token', {
        code,
        redirect_uri: window.location.origin,
        client_id: formData.clientId,
        client_secret: formData.clientSecret,
        auth_url: auth,
        tenant: formData.tenant,
      });
  
      setAccessToken(response.data.access_token);
    } catch (err) {
      console.error('handleCodeExchange error:', err.response?.data || err.message);
      setError('Error getting access token');
    } finally {
      setIsLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
  
    if (code && !hasHandledCode.current) {
      hasHandledCode.current = true;
      handleCodeExchange(code);
      window.history.replaceState({}, document.title, '/');
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
              >
              <option value="">-- Select an Environment --</option>
              {Object.keys(environments).map((env) => (
                  <option key={env} value={env}>
                    {env.charAt(0).toUpperCase() + env.slice(1)}
                  </option>
                ))}
              </select>
          </div>

          {/* Scopes */}
          <div className={styles.formGroup}>
            <label className={styles.label}>Scopes:</label>
            <div className={styles.scopeContainer}>
              {scopeOptions.map((scope) => (
                <label key={scope} className={styles.checkboxLabel}>
                  <input
                    type="checkbox"
                    name="scope"
                    value={scope}
                    checked={formData.scope.includes(scope)}
                    onChange={handleScopeChange}
                    className={styles.checkbox}
                  />
                  {scope.includes('#') ? scope.split('#')[1] : scope}
                </label>
              ))}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <button type="submit" className={styles.submitButton}>Iniciar Sesión</button>
            <button
              type="button"
              className={styles.clearButton}
            >
              Limpiar Datos
            </button>
          </div>
        </form>
      ) : (
        <div className={styles.authenticated}>
          {isLoading ? (
            <p>Cargando access_token...</p>
          ) : (
            <>
              <p>Access Token:</p>
              <textarea
                value={accessToken}
                readOnly
                rows={5}
                cols={60}
                className={styles.textarea}
              />
              <button
                className={styles.clearButton}
                onClick={() => { window.location.href = window.location.origin;}}
              >
                Cerrar Sesión
              </button>
            </>
          )}

          {/* ApiCaller Component */}
          {accessToken && <ApiCaller accessToken={accessToken} apiUrl={formData.environment} />}
        </div>
      )}

      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}