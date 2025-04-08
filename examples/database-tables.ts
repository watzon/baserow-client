import { BaserowClient } from "../src";

/**
 * This example demonstrates how to use the Baserow client to perform operations
 * on database tables, including creating, listing, updating, and deleting tables.
 */

// Initialize the client
const client = new BaserowClient({
  url: "https://api.baserow.io", // Replace with your Baserow instance URL
  token: "YOUR_API_TOKEN", // Replace with your API token
});

// Database ID to work with
const DATABASE_ID = 123; // Replace with your actual database ID

/**
 * Main function to demonstrate database table operations
 */
async function databaseTablesExample() {
  try {
    // List all tables in the database
    console.log(`Listing tables in database ${DATABASE_ID}...`);
    const tables = await client.databaseTables.list(DATABASE_ID);
    console.log(`Found ${tables.length} tables`);
    
    // Create a new table
    console.log("Creating a new table...");
    const newTable = await client.databaseTables.create(
      DATABASE_ID,
      {
        name: "New Example Table",
        // Optional: Initialize with data
        data: [
          ["Name", "Email", "Notes"], // First row (headers)
          ["John Doe", "john@example.com", "Example note 1"],
          ["Jane Smith", "jane@example.com", "Example note 2"]
        ],
        first_row_header: true // Indicates first row contains field names
      }
    );
    console.log(`Created table "${newTable.name}" with ID: ${newTable.id}`);
    
    // Get a specific table
    console.log(`Getting table details for ID: ${newTable.id}`);
    const tableDetails = await client.databaseTables.get(newTable.id);
    console.log("Table details:", tableDetails);
    
    // Update a table
    console.log(`Updating table name for ID: ${newTable.id}`);
    const updatedTable = await client.databaseTables.update(
      newTable.id,
      { name: "Updated Example Table" }
    );
    console.log(`Table renamed to: "${updatedTable.name}"`);
    
    // Create another table for ordering
    console.log("Creating another table for order demonstration...");
    const secondTable = await client.databaseTables.create(
      DATABASE_ID,
      { name: "Second Example Table" }
    );
    console.log(`Created second table with ID: ${secondTable.id}`);
    
    // Order tables (change their order)
    console.log("Changing table order...");
    await client.databaseTables.order(
      DATABASE_ID,
      { table_ids: [secondTable.id, newTable.id] } // The new order of table IDs
    );
    console.log("Tables reordered successfully");
    
    // List tables again to see the new order
    const tablesAfterReorder = await client.databaseTables.list(DATABASE_ID);
    console.log("Tables after reordering:", 
      tablesAfterReorder.map(t => ({ id: t.id, name: t.name, order: t.order }))
    );
    
    // Duplicate a table asynchronously (premium feature)
    console.log(`Duplicating table ${newTable.id} asynchronously...`);
    try {
      const duplicationJob = await client.databaseTables.duplicateAsync(newTable.id);
      console.log(`Duplication job started with ID: ${duplicationJob.id}`);
      console.log(`Job status: ${duplicationJob.state}, ${duplicationJob.progress_percentage}% complete`);
      // In a real app, you would poll the job status until completion
    } catch (error: any) {
      if (error.status === 402) {
        console.log("Table duplication is a premium feature");
      } else {
        throw error;
      }
    }
    
    // Import data into existing table (update table data)
    console.log(`Importing data into table ${newTable.id}...`);
    try {
      const importJob = await client.databaseTables.importDataAsync(
        newTable.id,
        {
          data: [
            ["John Updated", "john.updated@example.com", "Updated note 1"],
            ["Jane Updated", "jane.updated@example.com", "Updated note 2"],
            ["New Person", "new@example.com", "New record"]
          ]
        }
      );
      console.log(`Import job started with ID: ${importJob.id}`);
      console.log(`Job status: ${importJob.state}, ${importJob.progress_percentage}% complete`);
      // In a real app, you would poll the job status until completion
    } catch (error) {
      console.error("Error importing data:", error);
    }
    
    // Export table data (premium feature)
    console.log(`Exporting table ${newTable.id} data...`);
    try {
      const exportJob = await client.databaseTables.exportTable(
        newTable.id,
        {
          exporter_type: "csv",
          csv_column_separator: ",",
          csv_include_header: true,
          export_charset: "utf-8"
        }
      );
      console.log(`Export job started with ID: ${exportJob.id}`);
      console.log(`Job status: ${exportJob.state}, ${exportJob.progress_percentage}% complete`);
      if (exportJob.url) {
        console.log(`Download export from: ${exportJob.url}`);
      }
      // In a real app, you would poll the job status until completion
    } catch (error: any) {
      if (error.status === 402) {
        console.log("Table export is a premium feature");
      } else {
        throw error;
      }
    }
    
    // Clean up - delete the tables we created
    console.log("Cleaning up - deleting tables...");
    await client.databaseTables.delete(newTable.id);
    await client.databaseTables.delete(secondTable.id);
    console.log("Tables deleted successfully");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example
// databaseTablesExample();

// Export the example function so it can be run from another file
export { databaseTablesExample }; 