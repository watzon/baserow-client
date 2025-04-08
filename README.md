# Baserow JavaScript Client

A comprehensive TypeScript client library for the [Baserow](https://baserow.io) API. This client provides a clean interface to interact with all aspects of the Baserow API from JavaScript environments, including Node.js, Bun, Deno, and the browser.

## Features

- 🔄 Full TypeScript support with comprehensive type definitions
- 🔌 Universal compatibility (Node.js, Bun, Deno, and browser environments)
- 🧩 Modular API with logical operation grouping
- 🔐 Built-in authentication handling
- 🚦 Proper error handling with detailed error information

## Installation

### Node.js

```bash
# Using npm
npm install baserow

# Using yarn
yarn add baserow

# Using pnpm
pnpm add baserow
```

### Bun

```bash
bun install baserow
```

### Deno

```typescript
// Import from npm registry in your script
import { BaserowClient } from "npm:baserow";
```

## Quick Start

```typescript
import { BaserowClient } from "baserow";

// Initialize the client
const client = new BaserowClient({
  url: "https://api.baserow.io",
  token: "YOUR_API_TOKEN",
  // Optional: tokenType defaults to "Token", can be "JWT" for JWT tokens
  tokenType: "Token",
});

// Basic example: Get workspace list
const workspaces = await client.workspace.getAll();
console.log(workspaces);

// Example: Create a row in a table
const newRow = await client.databaseRows.create(
  tableId, 
  { field_1: "Value 1", field_2: "Value 2" }
);
```

## API Structure

The client is organized into logical operation groups that match Baserow's API structure:

```typescript
// Health check operations
client.health.getFullHealthCheck();

// Admin operations
client.admin.getUserList();

// Workspace operations
client.workspace.getAll();

// Database row operations
client.databaseRows.getAll(tableId);
```

## Roadmap

### Core Infrastructure

- [x] Base client with authentication handling
- [x] Request/response handling with error management
- [x] TypeScript type definitions
- [ ] Comprehensive documentation
- [ ] Full test coverage
- [ ] Browser bundle optimization

### API Operations

#### System & Administration
- [x] Health Operations - Server health checks and diagnostics
- [x] Admin Operations - User, instance and settings management
- [ ] License Operations - License management
- [ ] Job Operations - Background job management
- [ ] Template Operations - Template management

#### User & Workspace Management
- [x] Workspace Operations - Creating and managing workspaces/groups
- [ ] User Operations - User profile and settings
- [ ] Team Operations - Team management
- [ ] Role Assignment Operations - Permissions and role management
- [ ] SSO Operations - Single Sign-On integrations
- [ ] User Source Operations - External user sources

#### Database Operations
- [x] Database Row Operations - CRUD operations for table rows
- [x] Database Table Operations - Table creation and management
- [ ] Database Field Operations - Field definition and customization
- [ ] Database View Operations - View creation and configuration
- [ ] Database Webhook Operations - Webhook management
- [ ] Database Token Operations - API token management

#### File Operations
- [ ] User File Operations - User file management
- [ ] Secure File Operations - Secure file handling

#### Additional Features
- [ ] Application Operations - Application management
- [ ] Integration Operations - Third-party integrations
- [ ] Builder Operations - Page builder functionality
- [ ] Dashboard Operations - Dashboard creation and management
- [ ] Notification Operations - User notifications
- [ ] Trash Operations - Trash management and restoration

### Platform Support

- [x] Node.js compatibility
- [x] Bun compatibility
- [ ] Deno compatibility (needs testing)
- [ ] Browser compatibility (needs testing)
- [ ] React Native compatibility (needs testing)

### Documentation

- [ ] API Reference
- [ ] Usage Examples
- [ ] Migration Guide
- [ ] Contributing Guide

## Development

For development and testing instructions, please refer to the [test directory README](src/test/README.md).

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
