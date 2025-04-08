import { BaserowClient } from "../src";

/**
 * This example demonstrates how to use the Baserow client to perform operations
 * on database fields, including creating, listing, updating, and deleting fields.
 */

// Initialize the client
const client = new BaserowClient({
  url: "https://api.baserow.io", // Replace with your Baserow instance URL
  token: "YOUR_API_TOKEN", // Replace with your API token
});

// Database ID and Table ID to work with
const DATABASE_ID = 123; // Replace with your actual database ID
const TABLE_ID = 456; // Replace with your actual table ID or use the created table ID

/**
 * Main function to demonstrate database field operations
 */
async function databaseFieldsExample() {
  try {
    // First, create a table to work with if needed
    console.log("Creating a table for field operations...");
    const table = await client.databaseTables.create(
      DATABASE_ID,
      { name: "Field Operations Example" }
    );
    const tableId = table.id;
    console.log(`Created table with ID: ${tableId}`);
    
    // List existing fields in the table (should have at least an ID field by default)
    console.log(`Listing fields in table ${tableId}...`);
    const fields = await client.databaseFields.list(tableId);
    console.log(`Found ${fields.length} fields`);
    
    // Get details of the primary field (usually ID)
    if (fields.length > 0) {
      const primaryField = fields.find(field => field.primary);
      if (primaryField) {
        console.log(`Primary field: ${primaryField.name} (ID: ${primaryField.id})`);
      }
    }
    
    // Create a text field
    console.log("Creating a text field...");
    const textField = await client.databaseFields.create(
      tableId,
      {
        name: "Full Name",
        type: "text",
      }
    );
    console.log(`Created text field "${textField.name}" with ID: ${textField.id}`);
    
    // Create a number field
    console.log("Creating a number field...");
    const numberField = await client.databaseFields.create(
      tableId,
      {
        name: "Age",
        type: "number",
        number_decimal_places: 0,
        number_negative: false
      }
    );
    console.log(`Created number field "${numberField.name}" with ID: ${numberField.id}`);
    
    // Create a long text field
    console.log("Creating a long text field...");
    const longTextField = await client.databaseFields.create(
      tableId,
      {
        name: "Description",
        type: "long_text"
      }
    );
    console.log(`Created long text field "${longTextField.name}" with ID: ${longTextField.id}`);
    
    // Create a date field
    console.log("Creating a date field...");
    const dateField = await client.databaseFields.create(
      tableId,
      {
        name: "Birth Date",
        type: "date",
        date_format: "US",
        date_include_time: false
      }
    );
    console.log(`Created date field "${dateField.name}" with ID: ${dateField.id}`);
    
    // Create a boolean field
    console.log("Creating a boolean field...");
    const booleanField = await client.databaseFields.create(
      tableId,
      {
        name: "Active",
        type: "boolean"
      }
    );
    console.log(`Created boolean field "${booleanField.name}" with ID: ${booleanField.id}`);
    
    // Update a field
    console.log(`Updating field ${textField.id}...`);
    const updatedTextField = await client.databaseFields.update(
      textField.id,
      {
        name: "Full Legal Name",
        description: "The legal name as it appears on official documents"
      }
    );
    console.log(`Updated text field name to "${updatedTextField.name}"`);
    
    // Get unique row values for a field (requires some data in the table)
    // First add a row to have some data
    console.log("Adding a row to get unique values later...");
    await client.databaseRows.create(
      tableId,
      {
        [`field_${textField.id}`]: "John Doe",
        [`field_${numberField.id}`]: 30,
        [`field_${longTextField.id}`]: "Example description for John Doe",
        [`field_${dateField.id}`]: "2000-01-01",
        [`field_${booleanField.id}`]: true
      }
    );
    
    // Get unique values for the text field
    console.log(`Getting unique values for field ${textField.id}...`);
    try {
      const uniqueValues = await client.databaseFields.getUniqueRowValues(textField.id);
      console.log(`Unique values for "${updatedTextField.name}":`, uniqueValues.values);
    } catch (error) {
      console.error("Error getting unique values:", error);
    }
    
    // Duplicate a field (premium feature)
    console.log(`Duplicating field ${textField.id}...`);
    try {
      const duplicationJob = await client.databaseFields.duplicateAsync(
        textField.id,
        { duplicate_data: true }
      );
      console.log(`Duplication job started with ID: ${duplicationJob.id}`);
      console.log(`Job status: ${duplicationJob.state}, ${duplicationJob.progress_percentage}% complete`);
      // In a real app, you would poll the job status until completion
    } catch (error: any) {
      if (error.status === 402) {
        console.log("Field duplication is a premium feature");
      } else {
        throw error;
      }
    }
    
    // Delete a field
    console.log(`Deleting field ${longTextField.id}...`);
    await client.databaseFields.delete(longTextField.id);
    console.log("Field deleted successfully");
    
    // List fields again to see changes
    console.log("Listing fields after modifications...");
    const updatedFields = await client.databaseFields.list(tableId);
    console.log(`Now have ${updatedFields.length} fields:`);
    updatedFields.forEach(field => {
      console.log(`- ${field.name} (${field.type}, ID: ${field.id})`);
    });
    
    // Clean up - delete the table we created
    console.log("Cleaning up - deleting table...");
    await client.databaseTables.delete(tableId);
    console.log("Table deleted successfully");
    
  } catch (error) {
    console.error("Error:", error);
  }
}

// Run the example
// databaseFieldsExample();

// Export the example function so it can be run from another file
export { databaseFieldsExample }; 