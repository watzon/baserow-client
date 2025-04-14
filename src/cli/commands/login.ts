import * as readline from 'readline';
import { BaserowClient } from '../../client/baserow-client';
import { UserOperations } from '../../client/user-operations';
import { ConfigManager } from '../config/manager';
import { success, error, warning } from '../utils/output';
import { configSet } from './config';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

// Define the error state file path (must match the one in client.ts)
const ERROR_STATE_FILE = path.join(os.homedir(), '.baserow_error_state');

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
 * Creates a readline interface for handling user input
 */
function createReadlineInterface() {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
}

/**
 * Prompts the user for input with the given question
 */
function prompt(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

/**
 * Prompts the user for a password with masked input
 */
function promptPassword(rl: readline.Interface, question: string): Promise<string> {
  return new Promise((resolve) => {
    // First output the prompt manually
    process.stdout.write(question);
    
    // Configure stdin to disable automatic printing of user input
    const stdin = process.stdin;
    const isRaw = stdin.isRaw;
    if (!isRaw) {
      stdin.setRawMode && stdin.setRawMode(true);
    }
    
    let password = '';
    
    // Handle keypress events
    const onKeypress = (char: any, key: any) => {
      // Ctrl+C or Ctrl+D
      if ((key && key.ctrl && key.name === 'c') || 
          (key && key.ctrl && key.name === 'd') || 
          (key && key.name === 'return')) {
        stdin.removeListener('data', onData);
        stdin.setRawMode && stdin.setRawMode(isRaw);
        process.stdout.write('\n');
        resolve(password);
      } else if (key && key.name === 'backspace') {
        if (password.length > 0) {
          password = password.slice(0, -1);
          process.stdout.write('\b \b'); // Erase last character
        }
      } else if (char) {
        password += char;
        process.stdout.write('*'); // Show asterisk for each character
      }
    };
    
    // Data event handler
    const onData = (data: Buffer) => {
      const char = data.toString();
      // For each character in the buffer
      for (let i = 0; i < char.length; i++) {
        onKeypress(char[i], {
          name: char[i] === '\r' || char[i] === '\n' ? 'return' : 
                char[i] === '\u0008' || char[i] === '\u007F' ? 'backspace' : 'other'
        });
      }
    };
    
    stdin.on('data', onData);
  });
}

/**
 * Handles user login to Baserow
 * @param options Command options including local flag and optional URL
 */
export async function login(options?: { local?: boolean, url?: string }): Promise<void> {
  // Clear any previous error state
  clearErrorState();
  
  const config = ConfigManager.getInstance();
  const resolvedConfig = config.resolveConfig({});
  
  // By default, store auth in global config for security (not checking into VCS)
  const useGlobalConfig = !options?.local;
  
  const rl = createReadlineInterface();

  try {
    // Get the URL if not already in config
    let url = options?.url || resolvedConfig.url;
    if (!url) {
      url = await prompt(rl, 'Baserow URL: ');
      if (!url) {
        error('URL is required');
        rl.close();
        process.exit(1);
      }
    }

    // Get email and password
    const email = await prompt(rl, 'Email: ');
    const password = await promptPassword(rl, 'Password: ');
    
    if (!email || !password) {
      error('Email and password are required');
      rl.close();
      process.exit(1);
    }
    
    // Create a temporary client for authentication
    const client = new BaserowClient({
      url,
      token: 'temp', // Will be replaced after login
      tokenType: 'JWT'
    });
    
    const userOperations = new UserOperations(client);
    
    // Attempt login
    console.log('Authenticating...');
    const authResponse = await userOperations.login(email, password);
    
    // Security-related options go to global config by default
    const authConfigOptions = { global: useGlobalConfig };
    const urlConfigOptions = { global: !options?.local }; // URL can be stored in local config

    // Store tokens in config (security sensitive - use global config by default)
    await configSet('token', authResponse.access_token, authConfigOptions);
    await configSet('refreshToken', authResponse.refresh_token, authConfigOptions);
    await configSet('tokenType', 'JWT', authConfigOptions);
    await configSet('userEmail', authResponse.user.username, authConfigOptions);
    await configSet('userFirstName', authResponse.user.first_name, authConfigOptions);
    
    // Store URL in chosen config (less sensitive, can be in local)
    await configSet('url', url, urlConfigOptions);
    
    success(`Successfully logged in as ${authResponse.user.first_name} (${authResponse.user.username})`);
    
    // Provide information about where credentials are stored
    const configLocationMsg = useGlobalConfig 
      ? 'Authentication credentials stored in global config (~/.baserowrc.jsonc)'
      : 'Authentication credentials stored in local project config (.baserowrc.jsonc)';
    console.log(`\n${configLocationMsg}`);
    
    // Display some helpful information
    console.log('\nImportant notes:');
    console.log('1. A JWT token is now stored in your configuration');
    console.log('2. This token will expire after 10 minutes, but will be automatically refreshed when needed');
    console.log('3. You can log out with "baserow logout"');
  } catch (err: unknown) {
    if (err instanceof Error) {
      error(`Authentication failed: ${err.message}`);
    } else {
      error('Authentication failed: An unknown error occurred');
    }
    process.exit(1);
  } finally {
    rl.close();
  }
} 