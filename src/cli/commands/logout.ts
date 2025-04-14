import { BaserowClient } from '../../client/baserow-client';
import { UserOperations } from '../../client/user-operations';
import { ConfigManager } from '../config/manager';
import { configSet } from './config';
import { success, error, warning } from '../utils/output';
import type { GlobalProjectConfig } from '../config/types';

/**
 * Handles user logout from Baserow
 * @param options Command options including local flag
 */
export async function logout(options?: { local?: boolean }): Promise<void> {
  const config = ConfigManager.getInstance();
  
  // By default, look for auth in global config for security
  const useGlobalConfig = !options?.local;
  const configOptions = { global: useGlobalConfig };

  // Check if there's a token in the specified config
  let resolvedConfig;
  if (useGlobalConfig) {
    // For global config, we need to look up the current project in the global config
    const globalConfig = config.getGlobalConfig();
    const currentDir = process.cwd();
    
    // Try to find the current directory in global projects
    let projectConfig: GlobalProjectConfig | undefined;
    const projects = Object.entries(globalConfig.projects || {});
    for (const [, project] of projects) {
      if (project.path === currentDir) {
        projectConfig = project;
        break;
      }
    }
    
    resolvedConfig = projectConfig || {};
  } else {
    // For local config, just get the local config
    resolvedConfig = config.getLocalConfig() || {};
  }
  
  // Check if already logged in
  if (!resolvedConfig.token) {
    const location = useGlobalConfig ? 'global' : 'local';
    warning(`Not currently logged in (no token found in ${location} config)`);
    return;
  }
  
  // Check if we have a refresh token to blacklist
  const refreshToken = resolvedConfig.refreshToken;
  const tokenType = resolvedConfig.tokenType;
  
  try {
    // If we have a refresh token and token type is JWT, try to blacklist it on the server
    if (refreshToken && resolvedConfig.url && tokenType === 'JWT') {
      const client = new BaserowClient({
        url: resolvedConfig.url,
        token: resolvedConfig.token,
        tokenType: 'JWT'
      });
      
      const userOperations = new UserOperations(client);
      
      try {
        console.log('Logging out from Baserow...');
        await userOperations.logout(refreshToken);
      } catch (err) {
        // If token blacklisting fails, just continue with local cleanup
        warning('Could not blacklist token on server, but will still remove local credentials');
      }
    }
    
    // Remove tokens from config
    await configSet('token', '', configOptions);
    await configSet('refreshToken', '', configOptions);
    await configSet('userEmail', '', configOptions);
    await configSet('userFirstName', '', configOptions);
    
    const location = useGlobalConfig ? 'global' : 'local';
    success(`Successfully logged out (removed credentials from ${location} config)`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      error(`Logout failed: ${err.message}`);
    } else {
      error('Logout failed: An unknown error occurred');
    }
    process.exit(1);
  }
} 