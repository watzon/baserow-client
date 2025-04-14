import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface BaserowConfig {
  projectName?: string;
  url?: string;
  token?: string;
  tokenType?: 'JWT' | 'Token';
  refreshToken?: string;
  databaseId?: string;
  outputPath?: string;
  tables?: string[];
}

let cachedConfig: BaserowConfig | null = null;

/**
 * Parse JSONC content
 */
async function parseJsonc(filePath: string): Promise<any> {
  // Check if running in Bun
  if (typeof process.versions.bun !== 'undefined') {
    try {
      // Use Bun's native JSONC support
      const module = await import(filePath);
      return module.default;
    } catch (error) {
      // If dynamic import fails, fall back to reading the file
      console.warn('Could not parse JSONC file at ' + filePath + ': ' + error);
    }
  }
}

/**
 * Get configuration from .baserowrc.jsonc file
 */
export async function getConfig(): Promise<BaserowConfig> {
  if (cachedConfig) {
    return cachedConfig;
  }

  try {
    const configPath = path.join(process.cwd(), '.baserowrc.jsonc');
    const homeConfigPath = path.join(os.homedir(), '.baserowrc.jsonc');

    let config: BaserowConfig = {};
    
    // First load global config if it exists
    if (fs.existsSync(homeConfigPath)) {
      config = await parseJsonc(homeConfigPath);
    }
    
    // Then load local config if it exists (overriding global config)
    if (fs.existsSync(configPath)) {
      const localConfig = await parseJsonc(configPath);
      
      // Merge configs with local taking priority
      config = { ...config, ...localConfig };
    }
    
    cachedConfig = config;
    return config;
  } catch (error) {
    console.error('Error loading config:', error);
    return {};
  }
}

/**
 * Get a specific configuration value
 */
export async function getConfigValue(key: string): Promise<any> {
  const config = await getConfig();
  return config[key as keyof BaserowConfig];
}

/**
 * Set a configuration value
 */
export async function setConfigValue(key: string, value: any): Promise<void> {
  const config = await getConfig();
  config[key as keyof BaserowConfig] = value;
  
  const configPath = path.join(process.cwd(), '.baserowrc.jsonc');
  fs.writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf8');
  
  // Reset cache
  cachedConfig = null;
} 