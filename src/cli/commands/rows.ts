import { getClient, AuthError } from '../utils/client';
import { success } from '../utils/logger';
import Table from 'cli-table3';
import chalk from 'chalk';
import { formatJSON, formatNushell } from '../utils/formatter';

interface ListRowsOptions {
  limit?: number;
  offset?: number;
  search?: string;
  filters?: string;
  fieldNames?: boolean;
  format?: 'table' | 'json' | 'nushell';
}

interface CreateRowOptions {
  data: string;
  fieldNames?: boolean;
}

interface UpdateRowOptions {
  data: string;
  fieldNames?: boolean;
}

/**
 * List rows from a Baserow table
 */
export async function listRows(tableId: number, options: ListRowsOptions): Promise<void> {
  // getClient() now throws errors instead of returning null
  const client = await getClient();

  const params: Record<string, any> = {
    user_field_names: options.fieldNames ?? false
  };

  if (options.limit) {
    params.size = options.limit;
  }

  if (options.offset) {
    params.offset = options.offset;
  }

  if (options.search) {
    params.search = options.search;
  }

  // Handle filters if provided
  if (options.filters) {
    try {
      const filtersObj = JSON.parse(options.filters);
      
      // Check if filters is an array
      if (Array.isArray(filtersObj)) {
        // Format expected by Baserow API
        params.filter_object = filtersObj.map(filter => ({
          field: filter.field,
          type: filter.type,
          value: filter.value
        }));
      } else {
        // If it's a single filter object
        params.filter_object = [{
          field: filtersObj.field,
          type: filtersObj.type,
          value: filtersObj.value
        }];
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        throw new Error(`Invalid filter format: ${err.message}`);
      } else {
        throw new Error('Invalid filter format: An unknown error occurred');
      }
    }
  }

  const rows = await client.databaseRows.list(tableId, params);

  if (rows.results.length === 0) {
    console.log(chalk.yellow('No rows found.'));
    return;
  }

  // Format output based on the requested format
  const format = options.format || 'table';
  
  if (format === 'json') {
    console.log(formatJSON(rows));
  } else if (format === 'nushell') {
    console.log(formatNushell(rows.results));
  } else {
    // Table format is the default
    // Ensure we have at least one row before accessing it
    const firstRow = rows.results[0];
    if (!firstRow) {
      console.log(chalk.yellow('No rows found.'));
      return;
    }
    
    const table = new Table({
      head: Object.keys(firstRow).map(key => chalk.white.bold(key))
    });
    
    rows.results.forEach(row => {
      table.push(Object.values(row).map(value => {
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value);
        }
        return value === null ? 'null' : String(value);
      }));
    });
    
    console.log(table.toString());
  }
}

/**
 * Create a new row in a Baserow table
 */
export async function createRow(tableId: number, options: CreateRowOptions): Promise<void> {
  const client = await getClient();

  // Parse the JSON data for the new row
  let rowData: Record<string, any>;
  try {
    rowData = JSON.parse(options.data);
  } catch (err: unknown) {
    throw new Error(`Invalid JSON data: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
  }

  // Create the row
  const params = {
    userFieldNames: options.fieldNames ?? false
  };

  const newRow = await client.databaseRows.create(tableId, rowData, params);
  
  success(`Row created successfully with ID: ${newRow.id}`);
  console.log(formatJSON(newRow));
}

/**
 * Updates an existing row in a Baserow table
 */
export async function updateRow(tableId: number, rowId: number, options: UpdateRowOptions): Promise<void> {
  const client = await getClient();

  // Parse the data JSON string
  let rowData: Record<string, any>;
  
  try {
    rowData = JSON.parse(options.data);
  } catch (err: unknown) {
    throw new Error(`Invalid JSON data: ${err instanceof Error ? err.message : 'An unknown error occurred'}`);
  }
  
  // Update the row
  const updatedRow = await client.databaseRows.update(
    tableId,
    rowId,
    rowData,
    {
      userFieldNames: options.fieldNames ?? false
    }
  );
  
  success(`Row ${rowId} successfully updated in table ${tableId}`);
  console.log(formatJSON(updatedRow));
} 