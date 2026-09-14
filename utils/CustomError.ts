import { ApiErrorResponse } from "@/types/api";

export class CustomError extends Error {
    status: string;
    code: string;
    response: ApiErrorResponse;

    constructor(response: ApiErrorResponse) {
      const { status, message, code } = response;
      super(message);
      this.name = "CustomError";
      this.status = status;
      this.code = code;
      this.response = response;
    }
  
    toJSON() {
      return {
        ...this.response,
      };
    }
  }
