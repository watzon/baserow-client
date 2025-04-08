# Baserow Client Examples

This directory contains examples demonstrating how to use the Baserow client library for different operations.

## Available Examples

1. **Database Table Operations** - [`database-tables.ts`](./database-tables.ts)
   - Creating, listing, updating, and deleting tables
   - Changing table order
   - Importing and exporting data
   - Duplicating tables

2. **Database Field Operations** - [`database-fields.ts`](./database-fields.ts)
   - Creating fields of different types (text, number, date, etc.)
   - Listing, updating, and deleting fields
   - Getting unique values from fields
   - Duplicating fields

3. **Database Row Operations** - [`database-rows.ts`](./database-rows.ts)
   - Creating, reading, updating, and deleting rows
   - Filtering and pagination
   - Batch operations (create, update, delete multiple rows)
   - Row history and comments

## Running the Examples

Before running any example, make sure to:

1. Update the Baserow API URL to point to your Baserow instance
2. Replace the API token with your own
3. Update database IDs and table IDs as needed

### Method 1: Run individual examples

Open the specific example file and uncomment the function call at the bottom of the file. Then run it with your TypeScript runner of choice:

```bash
# Using ts-node
npx ts-node examples/database-rows.ts

# Using Bun
bun examples/database-rows.ts
```

### Method 2: Use the index file

The [`index.ts`](./index.ts) file allows you to run one or all examples. Open the file, uncomment the example(s) you want to run, and then execute it:

```bash
# Using ts-node
npx ts-node examples/index.ts

# Using Bun
bun examples/index.ts
```

## Notes

- Some examples use premium features which may not work without a premium Baserow license
- The examples include error handling to catch premium feature limitations
- All examples clean up after themselves by deleting created resources
- For production use, you should adapt these examples with proper authentication and error handling

## Debugging

If you encounter any issues:

1. Check that your API token is valid and has the necessary permissions
2. Verify that the Baserow instance URL is correct
3. Examine the error messages which often contain details about what went wrong
4. For premium feature errors (402 status), confirm your Baserow instance has the required license 