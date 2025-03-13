export const safeDecode = (value: string) => {
    try {
      return value && value !== "" ? atob(decodeURIComponent(value)) : "";
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("Error detailed:", error.message);
      } else {
        console.error("Unknown error:", error);
      }
      return "";
    }
  };
