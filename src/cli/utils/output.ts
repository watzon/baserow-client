import chalk from 'chalk';
import Table from 'cli-table3';
import type { Table as TableType } from 'cli-table3';

/**
 * Output formats supported for table data
 */
export type OutputFormat = 'table' | 'json' | 'nushell';

/**
 * Options for formatting terminal output
 */
export interface OutputOptions {
  format?: OutputFormat;
  title?: string;
}

/**
 * Formats a success message with a green checkmark
 */
export function success(message: string): void {
  console.log(chalk.green('✓'), message);
}

/**
 * Formats an info message in cyan
 */
export function info(message: string): void {
  console.log(chalk.cyan('ℹ'), message);
}

/**
 * Formats a warning message in yellow
 */
export function warning(message: string): void {
  console.log(chalk.yellow('⚠'), message);
}

/**
 * Formats an error message in red
 */
export function error(message: string): void {
  console.error(chalk.red('✖'), message);
}

/**
 * Formats key-value data for display
 */
export function formatKeyValue(key: string, value: any): void {
  console.log(chalk.cyan(key + ':'), typeof value === 'object' ? 
    JSON.stringify(value, null, 2) : value);
}

/**
 * Creates a formatted table from data
 */
export function createTable(headers: string[], rows: any[][]): TableType {
  return new Table({
    head: headers.map(h => chalk.cyan(h)),
    style: {
      head: [], // Disable default styling
      border: [] // Disable default styling
    }
  });
}

/**
 * Formats tabular data based on the specified output format
 */
export function formatTable(
  data: Record<string, any>[],
  options: OutputOptions = {}
): void {
  if (!data || data.length === 0) {
    info('No data to display');
    return;
  }

  const headers = Object.keys(data[0] || {});
  const rows = data.map(item => headers.map(header => item[header]));

  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(data, null, 2));
      break;
      
    case 'nushell':
      // Format data in a way that Nushell can parse
      console.log(JSON.stringify({
        headers,
        rows,
        span: headers.length
      }));
      break;
      
    case 'table':
    default:
      if (options.title) {
        console.log(chalk.bold(chalk.cyan(options.title)));
      }
      
      const table = createTable(headers, rows);
      rows.forEach(row => table.push(row));
      console.log(table.toString());
  }
}

/**
 * Formats configuration data for display
 */
export function formatConfig(config: Record<string, any>, options: OutputOptions = {}): void {
  switch (options.format) {
    case 'json':
      console.log(JSON.stringify(config, null, 2));
      break;
      
    case 'nushell':
      // Convert config to table format for Nushell
      const data = Object.entries(config).map(([key, value]) => ({
        key,
        value: typeof value === 'object' ? JSON.stringify(value) : String(value)
      }));
      formatTable(data, { format: 'nushell' });
      break;
      
    default:
      if (options.title) {
        console.log(chalk.bold(chalk.cyan(options.title)));
      }
      Object.entries(config).forEach(([key, value]) => {
        formatKeyValue(key, value);
      });
  }
} 