import { useState, useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";
import { FormData } from "@/types/api";

export const usePersistentFormData = (key: string, initialData: FormData) => {
  const [storedData, setStoredData] = useLocalStorage(key, initialData);
  const [formData, setFormData] = useState<FormData>(storedData);

  useEffect(() => {
    setStoredData(formData);
  }, [formData, setStoredData]);

  return [formData, setFormData] as const;
};
