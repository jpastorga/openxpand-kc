"use client";
import React, { createContext, useState, useEffect } from 'react';

export const EnvironmentContext = createContext<{ environment: string | null; setEnvironment: React.Dispatch<React.SetStateAction<string | null>> } | null>(null);

export const EnvironmentProvider = ({ children }: { children: React.ReactNode }) => {
  const [environment, setEnvironment] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedEnv = localStorage.getItem('selectedEnvironment');
      setEnvironment(storedEnv ? JSON.parse(storedEnv) : '');
    } catch (error) {
      console.error('Error reading localStorage:', error);
    }
  }, []);

  useEffect(() => {
    try {
      if (environment) {
        localStorage.setItem('selectedEnvironment', JSON.stringify(environment));
      } else {
        localStorage.removeItem('selectedEnvironment');
      }
    } catch (error) {
      console.error('Error writing to localStorage:', error);
    }
  }, [environment]);

  return (
    <EnvironmentContext.Provider value={{ environment, setEnvironment }}>
      {children}
    </EnvironmentContext.Provider>
  );
};
