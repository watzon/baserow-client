import chalk from 'chalk';
import Table from 'cli-table3';

/**
 * Format data as a table
 */
export function formatTable(data: Record<string, any>[]): string {
  if (!data || data.length === 0) {
    return 'No data to display';
  }

  // Ensure data[0] exists before accessing it
  const firstRow = data[0];
  if (!firstRow) {
    return 'No data to display';
  }

  const headers = Object.keys(firstRow);
  const table = new Table({
    head: headers.map(header => chalk.cyan(header))
  });

  data.forEach(row => {
    table.push(
      Object.values(row).map(value => {
        if (value === null) return 'null';
        if (typeof value === 'object') return JSON.stringify(value);
        return String(value);
      })
    );
  });

  return table.toString();
}

/**
 * Format data as JSON
 */
export function formatJSON(data: any): string {
  return JSON.stringify(data, null, 2);
}

/**
 * Format data for Nushell
 */
export function formatNushell(data: any): string {
  if (Array.isArray(data)) {
    const headers = data.length > 0 ? Object.keys(data[0]) : [];
    
    return JSON.stringify({
      headers,
      rows: data.map(item => headers.map(header => item[header])),
      span: headers.length
    });
  }
  
  // If not an array, convert to array with key-value pairs
  if (typeof data === 'object' && data !== null) {
    const formattedData = Object.entries(data).map(([key, value]) => ({ 
      key, 
      value: typeof value === 'object' ? JSON.stringify(value) : String(value)
    }));
    
    return formatNushell(formattedData);
  }
  
  return JSON.stringify(data);
} 