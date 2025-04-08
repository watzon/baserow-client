import type { PaginationParams } from "./common";

// --- Admin Operation Types ---

// Admin - Audit Log
export interface AuditLog {
  id: number;
  action_type: string;
  user: string; // User email or representation
  workspace: string; // Workspace name or representation
  type: string; // More specific action type/category
  description: string;
  timestamp: string; // ISO DateTime
  ip_address: string | null;
  // Include other potential fields based on detailed usage if needed
}

export interface PaginationSerializerAuditLog extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLog[];
}

export interface ListAuditLogParams extends PaginationParams {
  action_type?: string;
  from_timestamp?: string; // ISO DateTime
  sorts?: string; // e.g., "-timestamp,+user"
  to_timestamp?: string; // ISO DateTime
  user_id?: number;
  workspace_id?: number;
}

export interface AuditLogActionType {
  id: string; // Enum string key
  value: string; // Human-readable value
}

export interface ListAuditLogActionTypesParams {
  search?: string;
  workspace_id?: number;
}

export interface SingleAuditLogExportJobRequest {
  export_charset?: string; // Define ExportCharsetEnum if needed
  csv_column_separator?: string; // Define CsvColumnSeparatorEnum if needed
  csv_first_row_header?: boolean;
  filter_user_id?: number;
  filter_workspace_id?: number;
  filter_action_type?: string; // Define FilterActionTypeEnum if needed
  filter_from_timestamp?: string; // ISO DateTime
  filter_to_timestamp?: string; // ISO DateTime
  exclude_columns?: string; // Comma-separated
}

export interface SingleAuditLogExportJobResponse {
  url: string; // Download URL
  export_charset?: string;
  csv_column_separator?: string;
  csv_first_row_header?: boolean;
  filter_user_id?: number;
  filter_workspace_id?: number;
  filter_action_type?: string;
  filter_from_timestamp?: string;
  filter_to_timestamp?: string;
  exclude_columns?: string;
  created_on: string; // ISO DateTime
  exported_file_name: string;
  // The job itself might be returned via a separate Job endpoint later
}

export interface AuditLogUser {
  id: number;
  value: string; // User email
}

export interface PaginationSerializerAuditLogUser extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogUser[];
}

export interface ListAuditLogUsersParams extends PaginationParams {
  search?: string;
  workspace_id?: number;
}

export interface AuditLogWorkspace {
  id: number;
  value: string; // Workspace name
}

export interface PaginationSerializerAuditLogWorkspace extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: AuditLogWorkspace[];
}

export interface ListAuditLogWorkspacesParams extends PaginationParams {
  search?: string;
}

// Admin - Auth Providers
export interface BaseAuthProviderPayload {
  type: string; // e.g., "google", "saml", "password", etc.
  domain?: string;
  enabled?: boolean;
  name?: string;
  // Add provider-specific fields (client_id, secret, metadata, base_url, etc.)
  [key: string]: any; // Allow additional properties
}

// Admin - Dashboard
export interface AdminDashboardPerDay {
  date: string; // Date string 'YYYY-MM-DD'
  count: number;
}

export interface AdminDashboard {
  total_users: number;
  total_workspaces: number;
  total_applications: number;
  new_users_last_24_hours: number;
  new_users_last_7_days: number;
  new_users_last_30_days: number;
  previous_new_users_last_24_hours: number;
  previous_new_users_last_7_days: number;
  previous_new_users_last_30_days: number;
  active_users_last_24_hours: number;
  active_users_last_7_days: number;
  active_users_last_30_days: number;
  previous_active_users_last_24_hours: number;
  previous_active_users_last_7_days: number;
  previous_active_users_last_30_days: number;
  new_users_per_day: AdminDashboardPerDay[];
  active_users_per_day: AdminDashboardPerDay[];
}

// Admin - Users
export interface UserAdminResponse {
  id: number;
  username: string; // email
  name: string;
  workspaces: { id: number; name: string; permissions: string; }[];
  last_login: string | null; // ISO DateTime
  date_joined: string; // ISO DateTime
  is_active: boolean;
  is_staff: boolean;
}

export interface PaginationSerializerUserAdminResponse extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: UserAdminResponse[];
}

export interface ListAdminUsersParams extends PaginationParams {
  search?: string;
  sorts?: string; // e.g., "-id,is_active"
}

export interface UserAdminCreate {
  username: string; // email
  name: string;
  is_active?: boolean;
  is_staff?: boolean;
  password?: string; // Required on create
}

export interface PatchedUserAdminUpdate {
  username?: string; // email
  name?: string;
  is_active?: boolean;
  is_staff?: boolean;
  password?: string; // Optional on update
}

export interface BaserowImpersonateAuthTokenPayload {
  user: number; // User ID to impersonate
}

export interface ImpersonateResponse {
  user: {
    first_name: string;
    username: string; // email
    language: string;
  };
  token?: string; // Deprecated
  access_token: string;
  refresh_token?: string; // Not explicitly in spec for impersonate, but often included
}

// Admin - Workspaces
export interface WorkspacesAdminResponse {
  id: number;
  name: string;
  users: { id: number; email: string; permissions: string }[];
  application_count: number;
  row_count: number;
  storage_usage: number | null;
  seats_taken: number;
  free_users: number;
  created_on: string; // ISO DateTime
}

export interface PaginationSerializerWorkspacesAdminResponse extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: WorkspacesAdminResponse[];
}

export interface ListAdminWorkspacesParams extends PaginationParams {
  search?: string;
  sorts?: string; // e.g., "-id,name"
} 