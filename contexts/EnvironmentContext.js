import React, { createContext, useState, useEffect } from 'react';

export const EnvironmentContext = createContext();

export const EnvironmentProvider = ({ children }) => {

  const [environment, setEnvironment] = useState(() => {
    if (typeof window !== 'undefined') {
      const storedEnv = window.localStorage.getItem('selectedEnvironment');
      return storedEnv ? JSON.parse(storedEnv) : '';
    }
    return '';
  });

  useEffect(() => {
    if (environment) {
      window.localStorage.setItem('selectedEnvironment', JSON.stringify(environment));
    } else {
      window.localStorage.removeItem('selectedEnvironment');
    }
  }, [environment]);

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
};
