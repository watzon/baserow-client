import { getClient } from '../utils/client';
import { error, success } from '../utils/logger';
import Table from 'cli-table3';
import chalk from 'chalk';
import { formatJSON, formatNushell } from '../utils/formatter';
import { getConfigValue } from '../utils/config';

interface ListTablesOptions {
  format?: 'table' | 'json' | 'nushell';
}

interface CreateTableOptions {
  data?: string;
  firstRowHeader?: boolean;
}

interface UpdateTableOptions {
  name: string;
}

/**
 * List tables from a Baserow database
 */
export async function listTables(database: number | undefined, options: ListTablesOptions = {}): Promise<void> {
  const client = await getClient();
  if (!client) {
    error('Not authenticated. Please login first.');
    process.exit(1);
  }

  // Get database ID from config if not provided
  if (!database) {
    const configDatabaseId = await getConfigValue('database');
    if (!configDatabaseId) {
      error('Database ID is required. Provide it as an argument or set it in your config.');
      process.exit(1);
    }
    database = parseInt(configDatabaseId as string);
  }

  try {
    const tables = await client.databaseTables.list(database);

    if (tables.length === 0) {
      console.log(chalk.yellow('No tables found.'));
      return;
    }

    // Format output based on the requested format
    const format = options.format || 'table';
    
    if (format === 'json') {
      console.log(formatJSON(tables));
    } else if (format === 'nushell') {
      console.log(formatNushell(tables));
    } else {
      // Table format is the default
      const tableOutput = new Table({
        head: [
          chalk.white.bold('ID'),
          chalk.white.bold('Name'),
          chalk.white.bold('Order'),
          chalk.white.bold('Database ID')
        ]
      });
      
      tables.forEach(table => {
        tableOutput.push([
          table.id,
          table.name,
          table.order,
          table.database_id
        ]);
      });
      
      console.log(tableOutput.toString());
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to list tables: ${err.message}`);
    }
    throw new Error('Failed to list tables: An unknown error occurred');
  }
}

/**
 * Get a specific table by ID
 */
export async function getTable(tableId: number, options: ListTablesOptions = {}): Promise<void> {
  const client = await getClient();
  if (!client) {
    error('Not authenticated. Please login first.');
    process.exit(1);
  }

  try {
    const table = await client.databaseTables.get(tableId);

    // Format output based on the requested format
    const format = options.format || 'json';
    
    if (format === 'json') {
      console.log(formatJSON(table));
    } else if (format === 'nushell') {
      console.log(formatNushell(table));
    } else {
      // Table format for a single table
      const tableOutput = new Table();
      
      // Add each property as a row
      Object.entries(table).forEach(([key, value]) => {
        const formattedValue = typeof value === 'object' && value !== null 
          ? JSON.stringify(value) 
          : value === null ? 'null' : String(value);
          
        tableOutput.push([chalk.white.bold(key), formattedValue]);
      });
      
      console.log(tableOutput.toString());
    }
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to get table: ${err.message}`);
    }
    throw new Error('Failed to get table: An unknown error occurred');
  }
}

/**
 * Create a new table in a Baserow database
 */
export async function createTable(database: number | undefined, name: string, options: CreateTableOptions = {}): Promise<void> {
  const client = await getClient();
  if (!client) {
    error('Not authenticated. Please login first.');
    process.exit(1);
  }

  // Get database ID from config if not provided
  if (!database) {
    const configDatabaseId = await getConfigValue('database');
    if (!configDatabaseId) {
      error('Database ID is required. Provide it as an argument or set it in your config.');
      process.exit(1);
    }
    database = parseInt(configDatabaseId as string);
  }

  try {
    const payload: any = { name };
    
    // Add initial data if provided
    if (options.data) {
      try {
        payload.data = JSON.parse(options.data);
      } catch (err: unknown) {
        if (err instanceof Error) {
          error(`Invalid JSON data: ${err.message}`);
        } else {
          error('Invalid JSON data: An unknown error occurred');
        }
        process.exit(1);
      }
    }
    
    if (options.firstRowHeader !== undefined) {
      payload.first_row_header = options.firstRowHeader;
    }

    const newTable = await client.databaseTables.create(database, payload);
    
    success(`Table created successfully with ID: ${newTable.id}`);
    console.log(formatJSON(newTable));
    
  } catch (err: unknown) {
    if (err instanceof Error) {
      throw new Error(`Failed to create table: ${err.message}`);
    }
    throw new Error('Failed to create table: An unknown error occurred');
  }
}

/**
 * Update an existing table in Baserow
 */
export async function updateTable(tableId: number, options: UpdateTableOptions): Promise<void> {
  const client = await getClient();
  if (!client) {
    error('Not authenticated. Please login first.');
    process.exit(1);
  }

  try {
    const updatedTable = await client.databaseTables.update(tableId, { 
      name: options.name 
    });
    
    success(`Table ${tableId} successfully updated`);
    console.log(formatJSON(updatedTable));
  } catch (err: unknown) {
    if (err instanceof Error) {
      error(`Failed to update table: ${err.message}`);
    } else {
      error('Failed to update table: An unknown error occurred');
    }
    process.exit(1);
  }
}

/**
 * Delete a table from Baserow
 */
export async function deleteTable(tableId: number): Promise<void> {
  const client = await getClient();
  if (!client) {
    error('Not authenticated. Please login first.');
    process.exit(1);
  }

  try {
    await client.databaseTables.delete(tableId);
    success(`Table ${tableId} successfully deleted`);
  } catch (err: unknown) {
    if (err instanceof Error) {
      error(`Failed to delete table: ${err.message}`);
    } else {
      error('Failed to delete table: An unknown error occurred');
    }
    process.exit(1);
  }
} 