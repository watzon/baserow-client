# Baserow API Client Test Suite

This test suite provides comprehensive testing for the Baserow API client. It uses Bun as a runtime and testing framework.

## Testing Approach

The test suite implements a multi-layered testing approach:

1. **Unit Tests with Postman Mock Server**
   - Test against Postman mock responses that mirror the Baserow API
   - Validate client-side logic and request/response handling
   - Ensure compatibility with the Baserow API contract

2. **Integration Tests** (future implementation)
   - Connect to a real Baserow instance
   - Test actual API behavior
   - Validate responses match API contract

## Setup and Installation

To set up the development environment:

```bash
# Install dependencies
bun install
```

## Running Tests

To run the tests:

```bash
# Run all tests
bun test

# Run specific test file
bun test src/test/health-operations.postman.test.ts
```

## Mock Server

Tests use a Postman mock server that simulates the Baserow API:

- **Shared mock server URL**: https://cda62bdf-0231-4eac-932b-ec788095746a.mock.pstmn.io
- This URL is included in the test files by default

### Custom Mock Server

You can configure tests to use a different mock server or a real Baserow instance:

```bash
# Set custom mock server URL
MOCK_SERVER_URL=https://your-custom-mock.example.com bun test

# Test against a real Baserow server
MOCK_SERVER_URL=https://your-baserow-instance.example.com bun test
```

## Adding Tests

To add tests for new operations:

1. Create test files following the naming pattern: `{operation}-operations.postman.test.ts`
2. Set up the mock client with the appropriate operations class
3. Write tests that verify both request formation and response handling

## Example Test

Here's an example of a test for a Database Table operation:

```typescript
describe('DatabaseTableOperations', () => {
  let client: BaserowClient;
  let tableOps: DatabaseTableOperations;
  
  beforeAll(() => {
    // The client will use the mock server URL from the environment or the default
    client = new BaserowClient({
      url: process.env.MOCK_SERVER_URL || 'https://cda62bdf-0231-4eac-932b-ec788095746a.mock.pstmn.io', 
      token: 'fake-token'
    });
    tableOps = client.databaseTables;
  });
  
  it('should list tables', async () => {
    const result = await tableOps.list(1);
    
    expect(Array.isArray(result.results)).toBe(true);
  });
});
```

## Project Structure

```
src/
├── client/         # Client implementation
│   ├── baserow-client.ts        # Main client class
│   ├── workspace-operations.ts  # Workspace API methods
│   └── ...                      # Other API operation classes
├── test/           # Test files
│   ├── workspace-operations.postman.test.ts
│   ├── health-operations.postman.test.ts
│   └── ...
└── types/          # TypeScript type definitions
    └── ...
```

## Future Improvements

1. **Docker Integration Tests**: Add testing against a real Baserow instance using Docker
2. **Test Coverage Reporting**: Implement code coverage tracking
3. **Automated API Compatibility**: Generate tests from OpenAPI specifications 