/**
 * Configuration for a specific project
 */
export interface ProjectConfig {
  name: string;
  url?: string;
  token?: string;
  tokenType?: "JWT" | "Token";
  refreshToken?: string; // JWT refresh token for authentication
  database?: string;
  output?: string;
  tables?: string[];
  userEmail?: string; // User's email address (saved after login)
  userFirstName?: string; // User's first name (saved after login)
}

/**
 * Project configuration as stored in global config
 */
export interface GlobalProjectConfig extends ProjectConfig {
  path: string;
}

/**
 * Global configuration structure
 */
export interface BaserowConfig {
  projects: Record<string, GlobalProjectConfig>;
}

/**
 * Configuration resolved from both global and local sources
 */
export interface ResolvedConfig {
  url: string;
  token: string;
  tokenType?: "JWT" | "Token";
  refreshToken?: string; // JWT refresh token for authentication
  database: string;
  output: string;
  tables?: string[];
  userEmail?: string; // User's email address (saved after login)
  userFirstName?: string; // User's first name (saved after login)
} 