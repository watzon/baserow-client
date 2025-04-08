import { BaserowClient } from "./baserow-client";
import type { EmailTesterRequest, EmailTesterResponse, FullHealthCheck } from "../types/health";

/**
 * Operations for checking Baserow server health.
 */
export class HealthOperations {
  constructor(private client: BaserowClient) {}
  
  /**
   * Get full health check for the Baserow instance
   */
  async getFullHealthCheck(): Promise<FullHealthCheck> {
    return this.client._request<FullHealthCheck>('GET', '/api/_health/full/');
  }
  
  /**
   * Test email configuration
   */
  async testEmail(request: EmailTesterRequest): Promise<EmailTesterResponse> {
    return this.client._request<EmailTesterResponse>(
      'POST',
      '/api/_health/email/',
      request
    );
  }
  
  /**
   * Check celery queue size
   */
  async checkCeleryQueueSize(queues: string[] = ['celery', 'export']): Promise<void> {
    const queryParams = queues.map(queue => `queue=${queue}`).join('&');
    return this.client._request<void>(
      'GET',
      `/api/_health/celery-queue/?${queryParams}`
    );
  }
  
  /**
   * @deprecated Use getFullHealthCheck instead.
   * This method is kept for backward compatibility.
   */
  async getHealthCheck(): Promise<FullHealthCheck> {
    return this.getFullHealthCheck();
  }
  
  /**
   * @deprecated This endpoint doesn't exist in the OpenAPI specification.
   */
  async checkMigrations(): Promise<{ migration_migrations_applied: boolean }> {
    console.warn('checkMigrations is deprecated as this endpoint is not in the OpenAPI spec');
    return this.client._request<{ migration_migrations_applied: boolean }>(
      'GET',
      '/api/_health/migration-check/'
    );
  }
} 