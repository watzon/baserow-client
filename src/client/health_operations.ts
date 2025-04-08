import type { BaserowClient } from "./baserow-client";
import type {
    EmailTesterRequest,
    EmailTesterResponse,
    FullHealthCheck,
} from '../types'

class HealthOperations {
    constructor(private client: BaserowClient) {}

    /**
     * Checks the size of specified Celery queues.
     * @param queues - Array of queue names ('celery' or 'export').
     * @returns void - Throws BaserowApiError with 503 if queues are too large, 200 otherwise.
     * @see https://api.baserow.io/api/redoc/#tag/Health/operation/celery_queue_size_check
     */
    async checkCeleryQueueSize(queues: ('celery' | 'export')[]): Promise<void> {
        const queryParams = { queue: queues }; // Param can be provided multiple times
        await this.client._request<void>('GET', '/api/_health/celery-queue/', queryParams);
        // Successful response is 200 OK with no body, error handled by _request
    }

    /**
     * Sends a test email to the provided address.
     * @param payload - Object containing the target_email.
     * @returns An object indicating success or failure and error details.
     * @see https://api.baserow.io/api/redoc/#tag/Health/operation/email_tester
     */
    async testEmail(payload: EmailTesterRequest): Promise<EmailTesterResponse> {
        return this.client._request<EmailTesterResponse>('POST', '/api/_health/email/', undefined, payload);
    }

    /**
     * Runs a full health check on the Baserow instance.
     * @returns An object containing the results of various health checks.
     * @see https://api.baserow.io/api/redoc/#tag/Health/operation/full_health_check
     */
    async fullCheck(): Promise<FullHealthCheck> {
        return this.client._request<FullHealthCheck>('GET', '/api/_health/full/');
    }
}