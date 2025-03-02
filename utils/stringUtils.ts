import { FormDataWithCode } from "@/types/api"; 

export const replacePlaceholders = (
    template: string,
    values: FormDataWithCode,
    keysToEncode: string[] = []
  ) => {
    const encodeSet = new Set(keysToEncode);
  
    return template.replace(/:([a-zA-Z_]+)/g, (_, key) => {
      const value = values[key as keyof FormDataWithCode] || "";
  
      if (!encodeSet.has(key)) {
        return Array.isArray(value) ? value.join("%20") : value.toString();
      }
  
      if (Array.isArray(value)) {
        return value
          .map(item =>
            item.includes(":")
              ? item.split(":").map((part, index) => (index === 0 ? part : encodeURIComponent(part))).join(":")
              : encodeURIComponent(item)
          )
          .join("%20");
      } 

      return value.includes(":")
        ? value.split(":").map((part, index) => (index === 0 ? part : encodeURIComponent(part))).join(":")
        : encodeURIComponent(value);
    });
  };
