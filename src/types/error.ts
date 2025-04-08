/**
 * Custom error class for Baserow API errors
 */
export class BaserowApiError extends Error {
  /**
   * HTTP status code
   */
  public readonly status: number;
  
  /**
   * Error code from Baserow
   */
  public readonly code?: string;
  
  /**
   * Detailed error information
   */
  public readonly detail?: string;
  
  constructor(message: string, status: number, code?: string, detail?: string) {
    super(message);
    this.name = 'BaserowApiError';
    this.status = status;
    this.code = code;
    this.detail = detail;
    
    // Ensure instanceof works correctly in TypeScript
    Object.setPrototypeOf(this, BaserowApiError.prototype);
  }
} 