"use client";

import { useState, useEffect } from 'react';
import { FormData } from "@/types/api";

export function useLocalStorage(key: string, initialValue: FormData) {

  const [storedValue, setStoredValue] = useState<FormData>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error al leer localStorage key="${key}":`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(storedValue));
    } catch (error) {
      console.error(`Error al guardar en localStorage key="${key}":`, error);
    }
  }, [key, storedValue]);

  const setValue = (value: FormData) => {
    setStoredValue(value);
  };

  return [storedValue, setValue] as const;
}
