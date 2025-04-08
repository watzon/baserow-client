/**
 * Configuration options for the Baserow client
 */
export interface BaserowClientConfig {
  /**
   * The base URL of the Baserow API server
   */
  url: string;
  
  /**
   * API token for authentication
   */
  token: string;
  
  /**
   * Token type, either "JWT" or "Token" (default is "Token")
   */
  tokenType?: "JWT" | "Token";
  
  /**
   * Default headers to include with every request
   */
  defaultHeaders?: Record<string, string>;
} 