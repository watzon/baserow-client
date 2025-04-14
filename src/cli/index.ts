#!/usr/bin/env bun
import { Command } from 'commander';
import { generateTypes } from './commands/generate-types';
import { configGet, configSet, configInit } from './commands/config';
import { login } from './commands/login';
import { logout } from './commands/logout';
import { ConfigManager } from './config/manager';
import { error } from './utils/output';
import { getConfig, getConfigValue } from './utils/config';
import type { OutputFormat } from './utils/output';
import type { ResolvedConfig } from './config/types';
import { listRows, createRow, updateRow } from './commands/rows';
import { listTables, getTable, createTable, updateTable, deleteTable } from './commands/tables';
import { AuthError } from './utils/client';

const program = new Command();

program
  .name('baserow')
  .description('CLI for interacting with Baserow')
  .version('0.1.0');

/**
 * Common error handler for all commands
 */
function handleCommandError(err: unknown, commandName: string): never {
  if (err instanceof AuthError) {
    // Special handling for authentication errors
    error(err.message);
  } else if (err instanceof Error) {
    error(`${commandName} failed: ${err.message}`);
  } else {
    error(`${commandName} failed: An unknown error occurred`);
  }
  process.exit(1);
}

program
  .command('login')
  .description('Log in to Baserow to obtain a JWT token for authentication')
  .option('-l, --local', 'Store credentials in local project config (less secure)')
  .option('-u, --url <url>', 'Baserow instance URL')
  .action(async (options) => {
    try {
      await login(options);
    } catch (err: unknown) {
      handleCommandError(err, 'Login');
    }
  });

program
  .command('logout')
  .description('Log out from Baserow and clear stored credentials')
  .option('-l, --local', 'Remove credentials from local project config instead of global')
  .action(async (options) => {
    try {
      await logout(options);
    } catch (err: unknown) {
      handleCommandError(err, 'Logout');
    }
  });

program
  .command('config')
  .description('Get or set configuration values')
  .argument('[key]', 'Configuration key (e.g., "url" or "token")')
  .argument('[value]', 'Value to set')
  .option('-g, --global', 'Use global configuration')
  .option('-f, --format <format>', 'Output format (table, json, nushell)', 'table')
  .action(async (key?: string, value?: string, options?: { global?: boolean, format?: OutputFormat }) => {
    try {
      if (value) {
        if (!key) {
          throw new Error('A key is required when setting a value');
        }
        await configSet(key, value, options || {});
      } else {
        await configGet(key, options);
      }
    } catch (err: unknown) {
      handleCommandError(err, value ? 'Config set' : 'Config get');
    }
  });

program
  .command('init')
  .description('Initialize a new project configuration')
  .argument('[name]', 'Project name')
  .action(async (name?: string) => {
    try {
      await configInit(name);
    } catch (err: unknown) {
      handleCommandError(err, 'Init');
    }
  });

program
  .command('generate-types')
  .description('Generate TypeScript types from Baserow database')
  .option('-u, --url <url>', 'Baserow instance URL (can be set in config)')
  .option('-t, --token <token>', 'API token (can be set in config)')
  .option('-d, --database <id>', 'Database ID (can be set in config)')
  .option('-o, --output <path>', 'Output directory (defaults to config or "./types")')
  .option('--tables <tables>', 'Comma-separated list of table names to generate types for')
  .option('--token-type <type>', 'Token type ("JWT" or "Token", defaults to "Token")')
  .action(async (options) => {
    try {
      // Convert comma-separated tables to array if provided
      if (options.tables) {
        options.tables = options.tables.split(',').map(t => t.trim());
      }

      // Get config and merge with CLI options
      const configManager = ConfigManager.getInstance();
      const resolvedConfig = configManager.resolveConfig(options);

      // Try to use the new config utils if config manager doesn't have values
      if (!resolvedConfig.url) resolvedConfig.url = await getConfigValue('url') as string;
      if (!resolvedConfig.token) resolvedConfig.token = await getConfigValue('token') as string;
      if (!resolvedConfig.database) resolvedConfig.database = await getConfigValue('databaseId') as string;
      if (!resolvedConfig.output && !options.output) {
        const configOutput = await getConfigValue('outputPath');
        if (configOutput) resolvedConfig.output = configOutput;
      }
      if (!resolvedConfig.tables && !options.tables) {
        const configTables = await getConfigValue('tables');
        if (configTables) resolvedConfig.tables = configTables;
      }

      // Validate required fields
      const missingFields: string[] = [];
      if (!resolvedConfig.url) missingFields.push('url');
      if (!resolvedConfig.token) missingFields.push('token');
      if (!resolvedConfig.database) missingFields.push('database');

      if (missingFields.length > 0) {
        error(`Missing required configuration: ${missingFields.join(', ')}`);
        console.log('\nThese can be set either:');
        console.log('1. In your .baserowrc.jsonc file');
        console.log('2. Via the config command:');
        missingFields.forEach(field => {
          console.log(`   baserow config ${field} <value>`);
        });
        console.log('3. As command line options:');
        missingFields.forEach(field => {
          console.log(`   --${field} <value>`);
        });
        console.log('4. By logging in with "baserow login"');
        process.exit(1);
      }

      // Create a valid ResolvedConfig from the ProjectConfig
      const finalConfig: ResolvedConfig = {
        url: resolvedConfig.url!,
        token: resolvedConfig.token!,
        tokenType: resolvedConfig.tokenType || "Token",
        refreshToken: resolvedConfig.refreshToken,
        database: resolvedConfig.database!,
        output: resolvedConfig.output || './types/baserow.ts',
        tables: resolvedConfig.tables
      };

      await generateTypes(finalConfig);
    } catch (err: unknown) {
      handleCommandError(err, 'Type generation');
    }
  });

// Add rows command group
const rowsCommand = program
  .command('rows')
  .description('Manage rows in Baserow tables');

rowsCommand
  .command('list')
  .description('List rows from a table')
  .argument('<table-id>', 'ID of the table to list rows from')
  .option('-l, --limit <limit>', 'Maximum number of rows to return', '100')
  .option('-o, --offset <offset>', 'Offset for pagination', '0')
  .option('-s, --search <term>', 'Search term to filter rows')
  .option('-f, --filter <filters...>', 'Filters in format field_id:op:value (e.g. "field_1:equal:value")')
  .option('--field-names', 'Use field names instead of field IDs', false)
  .option('--format <format>', 'Output format (table, json, nushell)', 'table')
  .action(async (tableId, options) => {
    try {
      await listRows(parseInt(tableId), options);
    } catch (err: unknown) {
      handleCommandError(err, 'List rows');
    }
  });

rowsCommand
  .command('create')
  .description('Create a new row in a table')
  .argument('<table-id>', 'ID of the table to create a row in')
  .option('-d, --data <data>', 'JSON string with row data')
  .option('-f, --field <fieldData...>', 'Field data in format field_id:value')
  .option('--field-names', 'Use field names instead of field IDs', false)
  .option('--format <format>', 'Output format (table, json, nushell)', 'table')
  .action(async (tableId, options) => {
    try {
      await createRow(parseInt(tableId), options);
    } catch (err: unknown) {
      handleCommandError(err, 'Create row');
    }
  });

rowsCommand
  .command('update')
  .description('Update an existing row in a table')
  .argument('<table-id>', 'ID of the table containing the row')
  .argument('<row-id>', 'ID of the row to update')
  .option('-d, --data <data>', 'JSON string with row data')
  .option('--field-names', 'Use field names instead of field IDs', false)
  .action(async (tableId, rowId, options) => {
    try {
      await updateRow(parseInt(tableId), parseInt(rowId), options);
    } catch (err: unknown) {
      handleCommandError(err, 'Update row');
    }
  });

// Add tables command group
const tablesCommand = program
  .command('tables')
  .description('Manage tables in Baserow databases');

tablesCommand
  .command('list')
  .description('List tables from a database')
  .argument('[database-id]', 'ID of the database to list tables from (uses config value if not provided)')
  .option('--format <format>', 'Output format (table, json, nushell)', 'table')
  .action(async (databaseId, options) => {
    try {
      await listTables(databaseId ? parseInt(databaseId) : undefined, options);
    } catch (err: unknown) {
      handleCommandError(err, 'List tables');
    }
  });

tablesCommand
  .command('get')
  .description('Get details of a specific table')
  .argument('<table-id>', 'ID of the table to retrieve')
  .option('--format <format>', 'Output format (table, json, nushell)', 'json')
  .action(async (tableId, options) => {
    try {
      await getTable(parseInt(tableId), options);
    } catch (err: unknown) {
      handleCommandError(err, 'Get table');
    }
  });

tablesCommand
  .command('create')
  .description('Create a new table in a database')
  .argument('[database-id]', 'ID of the database to create a table in (uses config value if not provided)')
  .argument('<name>', 'Name of the new table')
  .option('-d, --data <data>', 'JSON array of arrays with initial table data')
  .option('--first-row-header', 'Use the first row as field headers', false)
  .action(async (databaseId, name, options) => {
    try {
      await createTable(databaseId ? parseInt(databaseId) : undefined, name, {
        data: options.data,
        firstRowHeader: options.firstRowHeader
      });
    } catch (err: unknown) {
      handleCommandError(err, 'Create table');
    }
  });

tablesCommand
  .command('update')
  .description('Update an existing table')
  .argument('<table-id>', 'ID of the table to update')
  .argument('<name>', 'New name for the table')
  .action(async (tableId, name) => {
    try {
      await updateTable(parseInt(tableId), { name });
    } catch (err: unknown) {
      handleCommandError(err, 'Update table');
    }
  });

tablesCommand
  .command('delete')
  .description('Delete a table')
  .argument('<table-id>', 'ID of the table to delete')
  .action(async (tableId) => {
    try {
      await deleteTable(parseInt(tableId));
    } catch (err: unknown) {
      handleCommandError(err, 'Delete table');
    }
  });

program.parse(process.argv); 
