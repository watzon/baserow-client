import { BaserowClient } from "../src";
import type { CreateRowCommentPayload, UpdateRowCommentPayload } from "../src/types/database";

/**
 * This example demonstrates how to use the Baserow client to perform CRUD operations
 * on database rows, including listing, creating, updating, deleting, and batch operations.
 */

// Initialize the client
const client = new BaserowClient({
  url: "https://api.baserow.io", // Replace with your Baserow instance URL
  token: "YOUR_API_TOKEN", // Replace with your API token
});

// Table ID to work with
const TABLE_ID = 123; // Replace with your actual table ID

/**
 * Main function to demonstrate database row operations
 */
async function databaseRowsExample() {
  try {
    // List rows with pagination and filtering
    console.log("Listing rows...");
    const rows = await client.databaseRows.list(TABLE_ID, {
      page: 1,
      size: 10,
      search: "example",
      // Using simple filters
      filter__field_1__contains: "test",
      // Or using structured filters
      filters: {
        filter_type: "AND",
        filters: [
          {
            field: 1, // field_1
            type: "contains",
            value: "test"
          }
        ]
      }
    });
    console.log(`Retrieved ${rows.count} rows`);
    
    // Get a specific row
    if (rows.results.length > 0) {
      const rowId = rows.results[0].id;
      console.log(`Getting row with ID: ${rowId}`);
      const row = await client.databaseRows.get(TABLE_ID, rowId);
      console.log("Row data:", row);
    }
    
    // Create a new row
    console.log("Creating a new row...");
    const newRow = await client.databaseRows.create(
      TABLE_ID,
      {
        // Use field_XX format where XX is the field ID
        field_1: "New value for field 1",
        field_2: "New value for field 2"
      },
      {
        // Optional: use user-friendly field names instead of field_XX
        user_field_names: false,
        // Optional: position the new row before another row (or undefined for default position)
        before: undefined
      }
    );
    console.log("Created row with ID:", newRow.id);
    
    // Update a row
    console.log(`Updating row with ID: ${newRow.id}`);
    const updatedRow = await client.databaseRows.update(
      TABLE_ID,
      newRow.id,
      {
        field_1: "Updated value for field 1"
      }
    );
    console.log("Updated row:", updatedRow);
    
    // Delete a row
    console.log(`Deleting row with ID: ${newRow.id}`);
    await client.databaseRows.delete(TABLE_ID, newRow.id);
    console.log("Row deleted successfully");
    
    // Batch operations example
    await batchOperationsExample(TABLE_ID);
    
    // Get row history example (if the premium feature is available)
    await rowHistoryExample(TABLE_ID);
    
    // Row comments example (if the premium feature is available)
    await rowCommentsExample(TABLE_ID);
    
  } catch (error) {
    console.error("Error:", error);
  }
}

/**
 * Example demonstrating batch operations
 */
async function batchOperationsExample(tableId: number) {
  try {
    console.log("\n--- Batch Operations Example ---");
    
    // Batch create multiple rows
    console.log("Batch creating rows...");
    const batchCreateResult = await client.databaseRows.batchCreate(
      tableId,
      {
        items: [
          { field_1: "Batch item 1", field_2: "Description 1" },
          { field_1: "Batch item 2", field_2: "Description 2" },
          { field_1: "Batch item 3", field_2: "Description 3" }
        ]
      }
    );
    console.log(`Created ${batchCreateResult.items.length} rows`);
    
    // Get the IDs of the created rows for later operations
    const createdIds = batchCreateResult.items.map(row => row.id);
    
    // Batch update multiple rows
    console.log("Batch updating rows...");
    await client.databaseRows.batchUpdate(
      tableId,
      {
        items: createdIds.map((id, index) => ({
          id,
          field_2: `Updated description ${index + 1}`
        }))
      }
    );
    console.log(`Updated ${createdIds.length} rows`);
    
    // Batch delete multiple rows
    console.log("Batch deleting rows...");
    await client.databaseRows.batchDelete(tableId, createdIds);
    console.log(`Deleted ${createdIds.length} rows`);
    
  } catch (error) {
    console.error("Error in batch operations:", error);
  }
}

/**
 * Example demonstrating row history operations (Premium feature)
 */
async function rowHistoryExample(tableId: number) {
  try {
    console.log("\n--- Row History Example (Premium) ---");
    
    // First, create a row to work with
    const historyRow = await client.databaseRows.create(
      tableId,
      { field_1: "Row for history example" }
    );
    console.log(`Created row with ID: ${historyRow.id}`);
    
    // Update it to create history
    await client.databaseRows.update(
      tableId, 
      historyRow.id,
      { field_1: "Updated for history example" }
    );
    console.log("Updated row to create history entry");
    
    // Get row history
    console.log("Getting row history...");
    try {
      const history = await client.databaseRows.getHistory(tableId, historyRow.id);
      console.log(`Retrieved ${history.count} history entries`);
    } catch (error: any) {
      if (error.status === 402) {
        console.log("Row history is a premium feature");
      } else {
        throw error;
      }
    }
    
    // Clean up
    await client.databaseRows.delete(tableId, historyRow.id);
    
  } catch (error) {
    console.error("Error in row history example:", error);
  }
}

/**
 * Example demonstrating row comments operations (Premium feature)
 */
async function rowCommentsExample(tableId: number) {
  try {
    console.log("\n--- Row Comments Example (Premium) ---");
    
    // First, create a row to work with
    const commentRow = await client.databaseRows.create(
      tableId,
      { field_1: "Row for comments example" }
    );
    console.log(`Created row with ID: ${commentRow.id}`);
    
    // List comments
    console.log("Listing comments...");
    try {
      const comments = await client.databaseRows.listComments(tableId, commentRow.id);
      console.log(`Retrieved ${comments.count} comments`);
      
      // Create a comment
      console.log("Creating a comment...");
      const newComment = await client.databaseRows.createComment(
        tableId, 
        commentRow.id,
        { message: "This is a test comment" }
      );
      console.log(`Created comment with ID: ${newComment.id}`);
      
      // Update the comment
      console.log("Updating the comment...");
      const updatedComment = await client.databaseRows.updateComment(
        tableId,
        newComment.id,
        { message: "This is an updated comment" }
      );
      console.log("Comment updated successfully");
      
      // Delete the comment
      console.log("Deleting the comment...");
      await client.databaseRows.deleteComment(tableId, newComment.id);
      console.log("Comment deleted successfully");
      
    } catch (error: any) {
      if (error.status === 402) {
        console.log("Row comments are a premium feature");
      } else {
        throw error;
      }
    }
    
    // Clean up
    await client.databaseRows.delete(tableId, commentRow.id);
    
  } catch (error) {
    console.error("Error in row comments example:", error);
  }
}

// Run the example
// databaseRowsExample();

// Export the example function so it can be run from another file
export { databaseRowsExample }; 