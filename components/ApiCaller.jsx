import { useState } from 'react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { coy } from 'react-syntax-highlighter/dist/cjs/styles/prism';
import axios from 'axios';
import environments from '../constants/environments';
import apiList from '../constants/apis';

export default function ApiCaller({ accessToken, apiUrl, scope }) {
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
        ...(method === 'GET' ? { params: data } : { data }),
      };

      const response = await axios(config);
      return response;
    } catch (error) {
      console.error('Error making request:', error);
      throw error.response?.data || error.message || error;
    }
  };

  const handleSubmit = async (apiName, path, method = 'POST') => {
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
        url: `${api}/${path}`,
        data: parsedData,
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
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

  const groupedApis = apiList.reduce((acc, api) => {
    if (scope.includes(api.scope)) {
      if (!acc[api.usecase]) {
        acc[api.usecase] = [];
      }
      acc[api.usecase].push(api);
    }
    return acc;
  }, {});

  return (
    <div className="w-full max-w-[1400px] mt-9">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {Object.entries(groupedApis).map(([usecase, apis], usecaseIndex) => (
          <div key={usecase} className="border rounded-lg p-6 bg-gray-50 shadow-lg min-w-[600px]">
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 capitalize">{usecase}</h2>
            <div className="space-y-6">
              {apis.map((api, index) => (
                <div key={api.name} className="border rounded-md bg-white shadow-sm p-6">
                  {/* Header */}
                  <button
                    onClick={() => toggleAccordion(`${usecaseIndex}-${index}`)}
                    className="w-full px-4 py-3 text-left bg-gray-200 hover:bg-gray-300 focus:outline-none flex justify-between items-center"
                  >
                    <span className="font-medium">{api.displayName}</span>
                    <svg
                      className={`w-5 h-5 transform transition-transform duration-300 ${
                        activeIndex === `${usecaseIndex}-${index}` ? 'rotate-180' : 'rotate-0'
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>

                  {/* Panel */}
                  {activeIndex === `${usecaseIndex}-${index}` && (
                    <div className="mt-4">
                      <p className="text-sm text-gray-600 mb-4">{api.description}</p>

                      {/* Textarea */}
                      <textarea
                        value={inputs[api.name] || ''}
                        onChange={(e) => handleInputChange(api.name, e.target.value)}
                        placeholder={api.body}
                        className="w-full p-4 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[120px]"
                        rows={6}
                      ></textarea>

                      {/* API Button */}
                      <button
                        onClick={() => handleSubmit(api.name, api.path, api?.method)}
                        className="mt-4 px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-200 w-full"
                        disabled={loading[api.name]}
                      >
                        {loading[api.name] ? 'Loading...' : 'Enviar'}
                      </button>

                      {/* Response Area */}
                      {responses[api.name] && (
                        <div className="mt-6 max-h-[300px] overflow-auto bg-gray-100 p-4 rounded-md">
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
        ))}
      </div>
    </div>
  );
}
