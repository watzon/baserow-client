import { homedir } from 'os';
import { join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import type { BaserowConfig, ProjectConfig, GlobalProjectConfig } from './types';

export class ConfigManager {
  private static instance: ConfigManager;
  private globalConfigPath: string;
  private localConfigPath: string;

  private constructor() {
    this.globalConfigPath = join(homedir(), '.baserowrc.jsonc');
    this.localConfigPath = '.baserowrc.jsonc';
  }

  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  private readJsonFile<T>(path: string): T | null {
    try {
      if (!existsSync(path)) return null;
      const content = readFileSync(path, 'utf-8');
      // Remove comments before parsing
      const jsonContent = content.replace(/\\"|"(?:\\"|[^"])*"|(\/\/.*|\/\*[\s\S]*?\*\/)/g, (m, g) => g ? '' : m);
      return JSON.parse(jsonContent) as T;
    } catch (error) {
      return null;
    }
  }

  private writeJsonFile(path: string, data: any, template: boolean = false): void {
    if (!template) {
      writeFileSync(path, JSON.stringify(data, null, 2));
      return;
    }

    // Create a well-documented template
    const content = `{
  // Project name - Used to identify this project in the global config
  "name": "${data.name}",

  // Baserow instance URL (required for API operations)
  // Examples:
  //   - Self-hosted: "http://localhost:3000"
  //   - Cloud: "https://api.baserow.io"
  // "url": "https://api.baserow.io",

  // API token for authentication (required for API operations)
  // Generate this in your Baserow account settings
  // Example: "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9..."
  // "token": "",

  // Database ID to use for operations (required for table operations)
  // Find this in the URL when viewing your database
  // Example: "12345"
  // "database": "",

  // Output path for generated TypeScript types
  // Relative to the project root or absolute path
  "output": "./types/baserow.ts",

  // Optional: Specific tables to include when generating types
  // If not specified, all tables will be included
  // "tables": [
  //   "Customers",
  //   "Orders",
  //   "Products"
  // ]
}`;
    writeFileSync(path, content);
  }

  public getGlobalConfig(): BaserowConfig {
    return this.readJsonFile<BaserowConfig>(this.globalConfigPath) || { projects: {} };
  }

  public getLocalConfig(): ProjectConfig | null {
    return this.readJsonFile<ProjectConfig>(this.localConfigPath);
  }

  public getCurrentProjectConfig(): ProjectConfig | null {
    const localConfig = this.getLocalConfig();
    if (localConfig) {
      return localConfig;
    }

    // If no local config, try to find the current directory in global config
    const globalConfig = this.getGlobalConfig();
    const currentDir = process.cwd();
    
    const projects = Object.entries(globalConfig.projects || {});
    for (const [, project] of projects) {
      if (project.path === currentDir) {
        const { path, ...projectConfig } = project;
        return projectConfig;
      }
    }

    return null;
  }

  public resolveConfig(cliOptions: Record<string, any> = {}): ProjectConfig {
    // Start with any CLI options
    let config: Partial<ProjectConfig> = { ...cliOptions };

    // Add local config (takes precedence over global)
    const localConfig = this.getLocalConfig();
    if (localConfig) {
      config = { ...config, ...localConfig };
    }

    // If no local config, try to find in global config
    if (!localConfig) {
      const currentDir = process.cwd();
      const globalConfig = this.getGlobalConfig();
      
      const projects = Object.entries(globalConfig.projects || {});
      for (const [, project] of projects) {
        if (project.path === currentDir) {
          const { path, ...projectConfig } = project;
          config = { ...config, ...projectConfig };
          break;
        }
      }
    }

    return config as ProjectConfig;
  }

  public saveGlobalConfig(config: BaserowConfig): void {
    this.writeJsonFile(this.globalConfigPath, config);
  }

  public saveLocalConfig(config: ProjectConfig): void {
    this.writeJsonFile(this.localConfigPath, config);
  }

  public async initializeProject(name?: string): Promise<void> {
    const currentDir = process.cwd();
    const projectName = name || currentDir.split('/').pop() || 'baserow-project';

    // Create local config with template
    const localConfig: ProjectConfig = {
      name: projectName,
      output: './types/baserow.ts'
    };
    this.writeJsonFile(this.localConfigPath, localConfig, true);

    // Update global config
    const globalConfig = this.getGlobalConfig();
    const globalProjectConfig: GlobalProjectConfig = {
      ...localConfig,
      path: currentDir
    };
    
    globalConfig.projects = globalConfig.projects || {};
    globalConfig.projects[projectName] = globalProjectConfig;
    this.saveGlobalConfig(globalConfig);
  }
}