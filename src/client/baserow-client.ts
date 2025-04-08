import { BaserowApiError } from "../types/error";
import type { BaserowClientConfig } from "../types/client";

// Import operation classes
import { HealthOperations } from "./health-operations";
import { AdminOperations } from "./admin-operations";
import { WorkspaceOperations } from "./workspace-operations";
import { ApplicationOperations } from "./application-operations";
import { IntegrationOperations } from "./integration-operations";
import { UserSourceOperations } from "./user-source-operations";
import { BuilderOperations } from "./builder-operations";
import { DashboardOperations } from "./dashboard-operations";
import { DatabaseTableOperations } from "./database-table-operations";
import { DatabaseFieldOperations } from "./database-field-operations";
import { DatabaseViewOperations } from "./database-view-operations";
import { DatabaseRowOperations } from "./database-row-operations";
import { DatabaseWebhookOperations } from "./database-webhook-operations";
import { DatabaseTokenOperations } from "./database-token-operations";
import { UserFileOperations } from "./user-file-operations";
import { SecureFileOperations } from "./secure-file-operations";
import { JobOperations } from "./job-operations";
import { LicenseOperations } from "./license-operations";
import { NotificationOperations } from "./notification-operations";
import { RoleAssignmentOperations } from "./role-assignment-operations";
import { TeamOperations } from "./team-operations";
import { TemplateOperations } from "./template-operations";
import { TrashOperations } from "./trash-operations";
import { UserOperations } from "./user-operations";
import { SsoOperations } from "./sso-operations";

/**
 * Main Baserow API Client class.
 */
export class BaserowClient {
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly tokenType: "JWT" | "Token";
  private readonly defaultHeaders: Record<string, string>;

  // --- API Resource Namespaces ---
  public readonly health: HealthOperations;
  public readonly admin: AdminOperations;
  public readonly workspace: WorkspaceOperations;
  public readonly applications: ApplicationOperations;
  public readonly integrations: IntegrationOperations;
  public readonly userSources: UserSourceOperations;
  public readonly builder: BuilderOperations;
  public readonly dashboard: DashboardOperations;
  public readonly databaseTables: DatabaseTableOperations;
  public readonly databaseFields: DatabaseFieldOperations;
  public readonly databaseViews: DatabaseViewOperations;
  public readonly databaseRows: DatabaseRowOperations;
  public readonly databaseWebhooks: DatabaseWebhookOperations;
  public readonly databaseTokens: DatabaseTokenOperations;
  public readonly userFiles: UserFileOperations;
  public readonly secureFiles: SecureFileOperations;
  public readonly jobs: JobOperations;
  public readonly licenses: LicenseOperations;
  public readonly notifications: NotificationOperations;
  public readonly roleAssignments: RoleAssignmentOperations;
  public readonly teams: TeamOperations;
  public readonly templates: TemplateOperations;
  public readonly trash: TrashOperations;
  public readonly user: UserOperations;
  public readonly sso: SsoOperations;

  constructor(config: BaserowClientConfig) {
    if (!config.url) throw new Error("Baserow API URL is required.");
    if (!config.token) throw new Error("Baserow API token is required.");

    // Remove trailing slash from URL if present
    this.baseUrl = config.url.endsWith("/")
      ? config.url.slice(0, -1)
      : config.url;
    this.token = config.token;
    this.tokenType = config.tokenType || "Token";
    this.defaultHeaders = config.defaultHeaders || {};

    // Initialize namespaces
    this.health = new HealthOperations(this);
    this.admin = new AdminOperations(this);
    this.workspace = new WorkspaceOperations(this);
    this.applications = new ApplicationOperations(this);
    this.integrations = new IntegrationOperations(this);
    this.userSources = new UserSourceOperations(this);
    this.builder = new BuilderOperations(this);
    this.dashboard = new DashboardOperations(this);
    this.databaseTables = new DatabaseTableOperations(this);
    this.databaseFields = new DatabaseFieldOperations(this);
    this.databaseViews = new DatabaseViewOperations(this);
    this.databaseRows = new DatabaseRowOperations(this);
    this.databaseWebhooks = new DatabaseWebhookOperations(this);
    this.databaseTokens = new DatabaseTokenOperations(this);
    this.userFiles = new UserFileOperations(this);
    this.secureFiles = new SecureFileOperations(this);
    this.jobs = new JobOperations(this);
    this.licenses = new LicenseOperations(this);
    this.notifications = new NotificationOperations(this);
    this.roleAssignments = new RoleAssignmentOperations(this);
    this.teams = new TeamOperations(this);
    this.templates = new TemplateOperations(this);
    this.trash = new TrashOperations(this);
    this.user = new UserOperations(this);
    this.sso = new SsoOperations(this);
  }

  /**
   * Internal method to make authenticated requests to the Baserow API.
   * @param method - HTTP method (GET, POST, PATCH, DELETE, PUT).
   * @param path - API endpoint path (e.g., /api/database/rows/table/1/).
   * @param queryParams - Optional object for URL query parameters.
   * @param body - Optional request body for POST/PATCH/PUT requests.
   * @param additionalHeaders - Optional additional headers.
   * @returns The parsed JSON response or raw response for non-JSON types.
   * @throws {BaserowApiError} If the API returns an error status.
   */
  async _request<T = any>(
    method: "GET" | "POST" | "PATCH" | "DELETE" | "PUT",
    path: string,
    queryParams?: Record<
      string,
      string | number | boolean | string[] | undefined | null
    >,
    body?: any,
    additionalHeaders?: Record<string, string>
  ): Promise<T> {
    const url = new URL(path.startsWith("/") ? path : `/${path}`, this.baseUrl);

    // Append query parameters
    if (queryParams) {
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            // Handle array query parameters by appending multiple times
            value.forEach((item) => url.searchParams.append(key, String(item)));
          } else {
            url.searchParams.set(key, String(value));
          }
        }
      });
    }

    const headers: HeadersInit = {
      Authorization: `${this.tokenType} ${this.token}`,
      ...this.defaultHeaders,
      ...additionalHeaders,
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body) {
      // Handle FormData separately for file uploads
      if (body instanceof FormData) {
        // Let fetch set the Content-Type for FormData
        options.body = body;
      } else {
        headers["Content-Type"] = "application/json";
        options.body = JSON.stringify(body);
      }
    }

    try {
      const response = await fetch(url.toString(), options);

      if (!response.ok) {
        let errorData: any = null;
        let errorMessage = `API Error: ${response.status} ${response.statusText}`;
        try {
          // Try to parse JSON error response from Baserow
          errorData = await response.json();
          errorMessage = `Baserow API Error (${response.status}): ${
            errorData?.error || response.statusText
          }`;
        } catch (e) {
          // If response is not JSON, use the status text
        }
        throw new BaserowApiError(
          errorMessage,
          response.status,
          errorData?.error,
          errorData?.detail
        );
      }

      // Handle different response types
      const contentType = response.headers.get("content-type");
      if (response.status === 204) {
        // No Content
        return undefined as T;
      } else if (contentType?.includes("application/json")) {
        return (await response.json()) as T;
      } else if (contentType?.includes("text/calendar")) {
        return (await response.text()) as T; // For iCal feeds
      } else if (contentType?.includes("application/octet-stream")) {
        // For file downloads, return the response object directly
        // so the consumer can handle the stream/blob
        return response as T;
      } else {
        // For other text-based types or unknown types, return text
        return (await response.text()) as T;
      }
    } catch (error) {
      if (error instanceof BaserowApiError) {
        throw error;
      }
      // Network errors or other fetch issues
      console.error("Network or fetch error:", error);
      throw new Error(
        `Network request failed: ${
          error instanceof Error ? error.message : String(error)
        }`
      );
    }
  }
} 