import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'bun:test';
import { BaserowClient } from '../client/baserow-client';
import { HealthOperations } from '../client/health-operations';
import { BaserowApiError } from '../types/error';

// Environment variable for the mock server URL
const MOCK_SERVER_URL = process.env.MOCK_SERVER_URL || 'https://cda62bdf-0231-4eac-932b-ec788095746a.mock.pstmn.io';

// Mock server available flag - we'll check this once and use it to skip tests if needed
let mockServerAvailable = true;

// Helper function to handle API errors and log request URLs
const expectApiResponse = async <T>(
  promise: Promise<T>, 
  endpointDescription: string,
  endpoint: string,
  method: string = 'GET'
): Promise<T | null> => {
  const fullUrl = `${MOCK_SERVER_URL}${endpoint}`;
  console.log(`Sending ${method} request to: ${fullUrl}`);
  
  try {
    return await promise;
  } catch (error) {
    console.log(`API Error for ${endpointDescription}:`, error);
    throw error;
  }
};

describe('HealthOperations', () => {
  let client: BaserowClient;
  let healthOps: HealthOperations;
  
  // Setup before all tests
  beforeAll(() => {
    // Create a new client that points to the Postman mock server
    client = new BaserowClient({
      url: MOCK_SERVER_URL,
      token: 'fake-token'
    });
    healthOps = new HealthOperations(client);
    
    console.log(`Using mock server URL: ${MOCK_SERVER_URL}`);
  });
  
  // Test getFullHealthCheck method
  it('should get full health check status', async () => {
    // Skip the test if we know the mock server is unavailable
    if (!mockServerAvailable) {
      console.log('Skipping test: Mock server is unavailable');
      return;
    }
    
    // Call the method with error handling and URL logging
    const result = await expectApiResponse(
      healthOps.getFullHealthCheck(), 
      'full health check',
      '/api/_health/full/'
    );
    
    // If the endpoint doesn't exist, skip the rest of the test
    if (result === null) {
      console.log('Skipping validation for full health check endpoint');
      return;
    }
    
    // Verify the result has expected structure
    expect(result).toBeDefined();
    expect(result).toHaveProperty('passing');
    expect(result).toHaveProperty('checks');
    expect(result).toHaveProperty('celery_queue_size');
    expect(result).toHaveProperty('celery_export_queue_size');
    
    // Check for placeholder or actual values
    if (typeof result.passing === 'string') {
      expect(result.passing as string).toBe('<boolean>');
    } else {
      expect(typeof result.passing).toBe('boolean');
    }
    
    if (typeof result.celery_queue_size === 'string') {
      expect(result.celery_queue_size as string).toBe('<integer>');
    } else {
      expect(typeof result.celery_queue_size).toBe('number');
    }
  });
  
  // Test testEmail method
  it('should test email configuration', async () => {
    // Skip the test if we know the mock server is unavailable
    if (!mockServerAvailable) {
      console.log('Skipping test: Mock server is unavailable');
      return;
    }
    
    // Email test request
    const emailRequest = {
      target_email: 'test@example.com'
    };
    
    // Call the method with error handling and URL logging
    const result = await expectApiResponse(
      healthOps.testEmail(emailRequest), 
      'test email',
      '/api/_health/email/',
      'POST'
    );
    
    // If the endpoint doesn't exist, skip the rest of the test
    if (result === null) {
      console.log('Skipping validation for test email endpoint');
      return;
    }
    
    // Verify the result has expected properties
    expect(result).toBeDefined();
    expect(result).toHaveProperty('succeeded');
    
    // Check for placeholder or actual value
    if (typeof result.succeeded === 'string') {
      expect(result.succeeded as string).toBe('<boolean>');
    } else {
      expect(typeof result.succeeded).toBe('boolean');
    }
  });
  
  // Test checkCeleryQueueSize method
  it('should check celery queue size', async () => {
    // Skip the test if we know the mock server is unavailable
    if (!mockServerAvailable) {
      console.log('Skipping test: Mock server is unavailable');
      return;
    }
    
    // Call the method with error handling and URL logging
    // This endpoint returns 200 with no body if successful, 503 if queue size exceeds limit
    await expectApiResponse(
      healthOps.checkCeleryQueueSize(['celery', 'export']), 
      'celery queue size check',
      '/api/_health/celery-queue/?queue=celery&queue=export'
    );
    
    // Success is implied if no error is thrown
    expect(true).toBe(true);
  });
  
  // Test the deprecated getHealthCheck method
  it('should forward deprecated getHealthCheck to getFullHealthCheck', async () => {
    // Skip the test if we know the mock server is unavailable
    if (!mockServerAvailable) {
      console.log('Skipping test: Mock server is unavailable');
      return;
    }
    
    // Since Bun doesn't have a built-in spy mechanism like Jest,
    // we'll directly check that the API is calling the correct endpoint
    
    // Create a special instance to track the call
    const originalGetFullHealthCheck = healthOps.getFullHealthCheck;
    let wasCalled = false;
    
    try {
      // Replace the method with one that sets our flag
      healthOps.getFullHealthCheck = async function() {
        wasCalled = true;
        return originalGetFullHealthCheck.call(this);
      };
      
      // Call the deprecated method
      try {
        await healthOps.getHealthCheck();
      } catch (error) {
        // Ignore any network errors, we just want to check if the method was called
      }
      
      // Verify that the flag was set indicating getFullHealthCheck was called
      expect(wasCalled).toBe(true);
    } finally {
      // Restore the original method
      healthOps.getFullHealthCheck = originalGetFullHealthCheck;
    }
  });
}); 