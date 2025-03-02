export class CustomError extends Error {
    status: number;
    code: string;
  
    constructor(status: number, message: string, code: string) {
      super(message);
      this.name = "CustomError";
      this.status = status;
      this.code = code;
    }
  
    toJSON() {
      return {
        status: this.status,
        message: this.message,
        code: this.code,
      };
    }
  }
  