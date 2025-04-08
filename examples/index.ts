import { databaseRowsExample } from './database-rows';
import { databaseTablesExample } from './database-tables';
import { databaseFieldsExample } from './database-fields';

/**
 * This file exports all example functions and provides a simple way to run them.
 * 
 * To run an example, uncomment the example you want to run and execute this file:
 * 
 * For Node.js:
 * ts-node examples/index.ts
 * 
 * For Bun:
 * bun examples/index.ts
 */

// Choose which example to run by uncommenting the relevant line:

// databaseRowsExample();
// databaseTablesExample();
// databaseFieldsExample();

// Or run all examples sequentially:
async function runAllExamples() {
  console.log("=== RUNNING DATABASE TABLES EXAMPLE ===");
  await databaseTablesExample();
  
  console.log("\n=== RUNNING DATABASE FIELDS EXAMPLE ===");
  await databaseFieldsExample();
  
  console.log("\n=== RUNNING DATABASE ROWS EXAMPLE ===");
  await databaseRowsExample();
  
  console.log("\n=== ALL EXAMPLES COMPLETED ===");
}

// Uncomment to run all examples
// runAllExamples();

// Export all examples for use in other files
export {
  databaseRowsExample,
  databaseTablesExample,
  databaseFieldsExample,
  runAllExamples
}; 