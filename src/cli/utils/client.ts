import { BaserowClient } from '../../client';
import { getConfig } from './config';
import { configSet } from '../commands/config';
import { UserOperations } from '../../client/user-operations';
import { jwtDecode } from 'jwt-decode';
import { BaserowApiError } from '../../types/error';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

let cachedClient: BaserowClient | null = null;

// Track refresh token error state
const ERROR_STATE_FILE = path.join(os.homedir(), '.baserow_error_state');

/**
 * Custom error class for authentication issues
 */
export class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthError';
  }
}

/**
 * Save error state to remember refresh token failures
 */
async function saveErrorState(message: string): Promise<void> {
  try {
    fs.writeFileSync(ERROR_STATE_FILE, message);
  } catch (err) {
    // Silently fail if we can't write the error state
  }
}

/**
 * Read error state if it exists
 */
function readErrorState(): string | null {
  try {
    if (fs.existsSync(ERROR_STATE_FILE)) {
      return fs.readFileSync(ERROR_STATE_FILE, 'utf8');
    }
  } catch (err) {
    // Silently fail if we can't read the error state
  }
  return null;
}

/**
 * Clear error state if it exists
 */
function clearErrorState(): void {
  try {
    if (fs.existsSync(ERROR_STATE_FILE)) {
      fs.unlinkSync(ERROR_STATE_FILE);
    }
  } catch (err) {
    // Silently fail if we can't delete the error state
  }
}

/**
 * Decode JWT token to get expiration time
 */
function getTokenExpiration(token: string): number | null {
  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp ? decoded.exp * 1000 : null; // Convert to milliseconds
  } catch (err) {
    // Don't log error, just return null
    return null;
  }
}

/**
 * Check if token is expired or about to expire (within 30 seconds)
 */
function isTokenExpired(token: string): boolean {
  const expiration = getTokenExpiration(token);
  if (!expiration) return false;
  
  // Consider token expired if it expires within 30 seconds
  return Date.now() > (expiration - 30000);
}

/**
 * Clear authentication credentials from config when token becomes invalid
 */
async function clearAuthCredentials(): Promise<void> {
  // Clear tokens from config
  await configSet('token', '', { global: true });
  await configSet('refreshToken', '', { global: true });
  cachedClient = null;
}

/**
 * Refresh the access token using refresh token
 */
async function refreshAccessToken(client: BaserowClient, refreshToken: string): Promise<string> {
  try {
    const userOperations = new UserOperations(client);
    const response = await userOperations.refreshToken(refreshToken);
    
    // Update token in config
    await configSet('token', response.access_token, { global: true });
    
    // Clear any previous error state since refresh succeeded
    clearErrorState();
    
    return response.access_token;
  } catch (err: unknown) {
    // Specifically handle invalid refresh token error
    if (err instanceof BaserowApiError && err.code === 'ERROR_INVALID_REFRESH_TOKEN') {
      console.log('Refresh token is invalid or has expired.');
      
      // Clear invalid credentials
      await clearAuthCredentials();
      
      // Save the error state to persist between runs
      const errorMessage = 'Refresh token invalid or expired. Please login again.';
      await saveErrorState(errorMessage);
      
      // Throw specific error for invalid refresh token
      throw new AuthError(errorMessage);
    }
    
    // Rethrow any other errors
    if (err instanceof Error) {
      throw new AuthError(`Authentication failed: ${err.message}`);
    } else {
      throw new AuthError('Authentication failed: An unknown error occurred');
    }
  }
}

/**
 * Create an enhanced Baserow client with auto token refresh
 */
async function createEnhancedClient(config: any): Promise<BaserowClient> {
  const client = new BaserowClient({
    url: config.url,
    token: config.token,
    tokenType: config.tokenType || 'JWT',
  });

  // Patch the _request method to handle automatic token refresh
  const originalRequest = client._request.bind(client);
  client._request = async function<T>(
    method: any,
    path: string,
    queryParams?: any,
    body?: any,
    additionalHeaders?: any
  ): Promise<T> {
    try {
      // Try the original request
      return await originalRequest<T>(method, path, queryParams, body, additionalHeaders);
    } catch (err) {
      // If authentication error and we have a refresh token, try refreshing
      if (
        err instanceof BaserowApiError && 
        (err.status === 401 || err.status === 403) && 
        config.refreshToken
      ) {
        let newToken;
        try {
          newToken = await refreshAccessToken(client, config.refreshToken);
          
          // Update client token
          (client as any).token = newToken;
          
          // Retry the request with the new token
          return await originalRequest<T>(method, path, queryParams, body, additionalHeaders);
        } catch (refreshErr) {
          // If it's an AuthError with a specific message, preserve the error and save state
          if (refreshErr instanceof AuthError) {
            // Save the error state to persist between runs
            await saveErrorState(refreshErr.message);
            throw refreshErr;
          }
          
          // For other errors, convert to AuthError and save state
          const errorMessage = refreshErr instanceof Error 
            ? `Authentication failed: ${refreshErr.message}`
            : 'Authentication failed. Please login again.';
          
          await saveErrorState(errorMessage);
          throw new AuthError(errorMessage);
        }
      }
      
      // If it wasn't an auth error or no refresh token available, rethrow
      throw err;
    }
  };

  return client;
}

/**
 * Get or create a Baserow client instance using configuration
 */
export async function getClient(): Promise<BaserowClient> {
  try {
    // Check for saved error state first
    const errorState = readErrorState();
    if (errorState) {
      throw new AuthError(errorState);
    }
    
    const config = await getConfig();
    if (!config.url || !config.token) {
      throw new AuthError('Not authenticated. Please login first.');
    }

    // Clear error state when we have valid credentials
    // This handles the case where user logged in again after error
    clearErrorState();

    // Check if token is expired and we have a refresh token
    if (config.tokenType === 'JWT' && config.token && config.refreshToken && isTokenExpired(config.token)) {
      console.log('Access token expired, attempting to refresh...');
      
      try {
        // Create a temporary client just for refreshing the token
        const tempClient = new BaserowClient({
          url: config.url,
          token: config.token,
          tokenType: config.tokenType || 'JWT',
        });
        
        // This will throw if refresh fails
        const newToken = await refreshAccessToken(tempClient, config.refreshToken);
        
        // Update the token in the config
        config.token = newToken;
      } catch (refreshError) {
        // Directly rethrow AuthErrors which will have the specific message
        if (refreshError instanceof AuthError) {
          throw refreshError;
        }
        
        // Convert other errors to a generic auth error
        if (refreshError instanceof Error) {
          throw new AuthError(`Failed to refresh token: ${refreshError.message}`);
        } else {
          throw new AuthError('Failed to refresh token: An unknown error occurred');
        }
      }
    }

    // Create or update cached client with latest token
    if (!cachedClient) {
      // Create new enhanced client with auto-refresh capability
      cachedClient = await createEnhancedClient(config);
    } else if ((cachedClient as any).token !== config.token) {
      // If token has changed, create a new client
      cachedClient = await createEnhancedClient(config);
    }

    return cachedClient;
  } catch (err) {
    // Rethrow authentication errors
    if (err instanceof AuthError) {
      throw err;
    }
    
    // Convert other errors to authentication errors
    if (err instanceof Error) {
      throw new AuthError(`Failed to create client: ${err.message}`);
    } else {
      throw new AuthError('Failed to create client: An unknown error occurred');
    }
  }
}

/**
 * A test function to simulate a refresh token error
 * This is just for debugging purposes
 */
export async function testRefreshTokenError(): Promise<void> {
  try {
    // Simulate a refresh token error
    const fakeError = new BaserowApiError('Refresh token is invalid or expired', 401, 'ERROR_INVALID_REFRESH_TOKEN');
    throw fakeError;
  } catch (err) {
    if (err instanceof BaserowApiError && err.code === 'ERROR_INVALID_REFRESH_TOKEN') {
      // Clear invalid credentials
      await clearAuthCredentials();
      
      // Throw specific error for invalid refresh token
      throw new AuthError('Refresh token invalid or expired. Please login again.');
    }
    
    throw err;
  }
} 