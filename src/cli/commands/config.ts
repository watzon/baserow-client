import { ConfigManager } from '../config/manager';
import { success, formatConfig } from '../utils/output';
import type { OutputFormat } from '../utils/output';
import type { BaserowConfig, ProjectConfig } from '../config/types';

/** @typedef {import('../utils/output').OutputFormat} OutputFormat */

/**
 * @typedef {Object} ConfigSetOptions
 * @property {boolean} [global]
 * @property {OutputFormat} [format]
 */

interface ConfigSetOptions {
  global?: boolean;
  format?: OutputFormat;
}

/**
 * Sets a configuration value
 * @param {string} key - The configuration key
 * @param {string} value - The value to set
 * @param {ConfigSetOptions} options - Configuration options
 */
export async function configSet(key: string, value: string, options: ConfigSetOptions = {}) {
  const config = ConfigManager.getInstance();

  if (options.global) {
    const globalConfig = config.getGlobalConfig();
    let current: any = globalConfig;
    
    // Handle nested keys (e.g., "projects.myproject.database")
    const keys = key.split('.');
    if (keys.length === 0) {
      throw new Error('Invalid key provided');
    }
    
    // Build nested structure except for the last key
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (k && !(k in current)) {
        current[k] = {};
      }
      if (k) {
        current = current[k];
      }
    }
    
    // Set the final value
    const lastKey = keys[keys.length - 1];
    if (lastKey) {
      current[lastKey] = value;
    }

    config.saveGlobalConfig(globalConfig);
    success(`Set global config ${key}=${value}`);
  } else {
    // For local config, we need to ensure we create a valid ProjectConfig
    const localConfig = config.getLocalConfig() || {
      name: process.cwd().split('/').pop() || 'baserow-project'
    };
    
    // Handle direct property setting for ProjectConfig
    const validConfigKeys = [
      'url', 'token', 'tokenType', 'refreshToken', 'database', 
      'output', 'tables', 'userEmail', 'userFirstName'
    ];
    
    if (key in localConfig || validConfigKeys.includes(key)) {
      (localConfig as any)[key] = value;
    } else {
      throw new Error(`Invalid local config key: ${key}`);
    }

    config.saveLocalConfig(localConfig);
    success(`Set local config ${key}=${value}`);
  }
}

/**
 * Gets a configuration value
 * @param {string} [key] - The configuration key
 * @param {ConfigSetOptions} [options] - Configuration options
 */
export async function configGet(key?: string, options: ConfigSetOptions = {}) {
  const config = ConfigManager.getInstance();
  const currentConfig = options.global ? 
    config.getGlobalConfig() : 
    (config.getLocalConfig() || { name: process.cwd().split('/').pop() || 'baserow-project' });

  if (!key) {
    formatConfig(currentConfig, {
      format: options.format,
      title: options.global ? 'Global Configuration' : 'Local Configuration'
    });
    return;
  }

  // Handle nested keys
  const keys = key.split('.');
  let value: any = currentConfig;
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k) {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }

  if (value === undefined) {
    console.log(`Configuration key "${key}" not found`);
  } else {
    formatConfig({ [key]: value }, {
      format: options.format,
      title: `Configuration for ${key}`
    });
  }
}

/**
 * Initializes a new project configuration
 * @param {string} [name] - Optional project name
 */
export async function configInit(name?: string) {
  const config = ConfigManager.getInstance();
  await config.initializeProject(name);
  success('Initialized project configuration');
} 