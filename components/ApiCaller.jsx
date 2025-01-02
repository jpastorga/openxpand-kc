
import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism'; // Puedes elegir otros estilos
import axios from 'axios';
import environments from '../constants/environments';
import apiList from '../constants/apis';

export default function ApiCaller({ accessToken, apiUrl }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [responses, setResponses] = useState({});
  const [loading, setLoading] = useState({});

  const initialInputs = apiList.reduce((acc, api) => {
    acc[api.name] = api.body;
    return acc;
  }, {});

  const [inputs, setInputs] = useState(initialInputs);

  const toggleAccordion = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  const handleInputChange = (apiName, value) => {
    setInputs((prev) => ({
      ...prev,
      [apiName]: value,
    }));
  };

  const makeRequest = async ({ method = 'POST', url, data = {}, headers = {} }) => {
    try {
      const config = {
        method,
        url,
        headers,
        ...(method === 'GET' ? { params: data } : { data })
      };

      const response = await axios(config);
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error.response?.data || error.message || error;
    }
  };

  const handleSubmit = async (apiName, path, method='POST') => {
    const inputData = inputs[apiName] || '';
    let parsedData = {};

    try {
      parsedData = inputData ? JSON.parse(inputData) : {};
    } catch (error) {
      console.error('Error parsing data:', error);
      return;
    }
    
    setLoading((prev) => ({ ...prev, [apiName]: true }));
    setResponses((prev) => ({ ...prev, [apiName]: null }));

    try {
      const { api } = environments[apiUrl];
      const response = await makeRequest({
        method,
        url: `${api}/api/camara/${path}`,
        data: parsedData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
      });

      setResponses((prev) => ({ ...prev, [apiName]: response.data }));
    } catch (error) {

      console.error(`Error - ${apiName}:`, error);
      setResponses((prev) => ({
        ...prev,
        [apiName]: { error: `${error.code || 'unknown'} - ${error.message || 'unknown'}` },
      }));

    } finally {
      setLoading((prev) => ({ ...prev, [apiName]: false }));
    }
  };

  return (
    <div className="w-[35%] max-w-4xl mt-9">
      <div className="space-y-4">
        {apiList.map((api, index) => (
          <div key={api.name} className="border rounded-md">
            {/* Header del Acordeón */}
            <button
              onClick={() => toggleAccordion(index)}
              className="w-full px-4 py-3 text-left bg-gray-100 hover:bg-gray-200 focus:outline-none flex justify-between items-center"
            >
              <span className="font-medium">{api.displayName}</span>
              <svg
                className={`w-5 h-5 transform transition-transform duration-300 ${activeIndex === index ? 'rotate-180' : 'rotate-0'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {/* Panel del Acordeón */}
            {activeIndex === index && (
              <div className="px-4 py-3 bg-white">
                <p className="text-sm text-gray-600 mb-4">{api.description}</p>

                {/* Textarea para ingresar parámetros */}
                <textarea
                  value={inputs[api.name] || ''}
                  onChange={(e) => handleInputChange(api.name, e.target.value)}
                  placeholder={api.body}
                  className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={4}
                ></textarea>

                {/* Botón para hacer la llamada a la API */}
                <button
                  onClick={() => handleSubmit(api.name, api.path, api?.method)}
                  className="mt-3 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200"
                  disabled={loading[api.name]}
                >
                  {loading[api.name] ? 'Cargando...' : 'Enviar'}
                </button>

                {/* Área para mostrar la respuesta */}
                {responses[api.name] && (
                  <div className="mt-4">
                    {responses[api.name].error ? (
                      <p className="text-red-500">{responses[api.name].error}</p>
                    ) : (
                      <SyntaxHighlighter language="json" style={coy} className="rounded-md">
                        {JSON.stringify(responses[api.name], null, 2)}
                      </SyntaxHighlighter>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
