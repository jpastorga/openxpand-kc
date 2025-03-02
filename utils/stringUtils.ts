import { FormDataWithCode } from "@/types/api"; 

export const replacePlaceholders = (
    template: string, 
    values: FormDataWithCode, 
    keysToEncode: string[] = []
  ) => {
    const encodeSet = new Set(keysToEncode);
  
    return template.replace(/:([a-zA-Z_]+)/g, (_, key) => {
      const value = values[key as keyof FormDataWithCode] || "";
  
      return encodeSet.has(key) ? encodeURIComponent(value.toString()) : value.toString();
    });
  };
  
