// --- Health Operation Types ---

/**
 * Request for testing email configuration
 */
export interface EmailTesterRequest {
  target_email: string;
  [key: string]: string | number | boolean | string[] | null | undefined;
}

/**
 * Response from email testing endpoint
 */
export interface EmailTesterResponse {
  succeeded: boolean;
  error_stack?: string | null;
  error_type?: string | null;
  error?: string | null;
}

/**
 * Full health check response
 */
export interface FullHealthCheck {
  passing: boolean;
  checks: { [key: string]: string };
  celery_queue_size: number;
  celery_export_queue_size: number;
}

/**
 * @deprecated - These interfaces are no longer used and don't match the API spec
 */
export interface OldFullHealthCheck {
  error?: string;
  databases: DatabasesHealthResponse;
  email?: EmailHealthResponse;
}

/**
 * @deprecated - This interface is no longer used and doesn't match the API spec
 */
interface DatabasesHealthResponse {
  connected: boolean;
  error?: string;
}

/**
 * @deprecated - This interface is no longer used and doesn't match the API spec
 */
interface EmailHealthResponse {
  works: boolean;
  error?: string;
} 