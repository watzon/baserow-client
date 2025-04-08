import type { PaginationParams } from "./common";

// Workspace Types
export interface Workspace {
  id: number;
  name: string;
  generative_ai_models_enabled: string; // Adjust type if needed based on actual response
}

export interface WorkspaceUserWorkspace extends Workspace {
  users: WorkspaceUser[];
  order: number;
  permissions: string;
  unread_notifications_count: number;
}

export interface WorkspaceUser {
  id: number;
  name: string;
  email: string;
  workspace: number;
  permissions: string;
  created_on: string; // ISO DateTime
  user_id: number;
  to_be_deleted: boolean;
  teams?: WorkspaceUserEnterpriseTeam[];
  role_uid?: string | null;
  highest_role_uid?: string | null;
}

export interface WorkspaceUserEnterpriseTeam {
  id: number;
  name: string;
}

export interface CreateWorkspacePayload {
  name: string;
}

export interface UpdateWorkspacePayload {
  name?: string;
}

export interface OrderWorkspacesPayload {
  workspaces: number[];
}

// Workspace Users
export interface ListWorkspaceUsersParams {
  search?: string;
  sorts?: string; // e.g., "name", "-email", "role"
}

export interface UpdateWorkspaceUserPayload {
  permissions?: string; // e.g., "ADMIN", "MEMBER", "VIEWER"
  // According to spec, only permissions can be updated here.
  // Role assignments are handled via the RoleAssignmentsOperations.
}

// Workspace Invitations
export interface WorkspaceInvitation {
  id: number;
  workspace: number;
  email: string;
  permissions: string; // e.g., "ADMIN", "MEMBER", "VIEWER"
  message: string;
  created_on: string; // ISO DateTime string
  // Potentially add `invited_by` if needed based on detailed spec usage
}

export interface UserWorkspaceInvitation {
  // As seen by the invited user
  id: number;
  invited_by: string;
  workspace: string; // Name of the workspace
  email: string;
  message: string;
  created_on: string; // ISO DateTime string
  email_exists: boolean;
}

export interface CreateWorkspaceInvitationPayload {
  email: string;
  permissions: string; // e.g., "ADMIN", "MEMBER", "VIEWER"
  message?: string;
  base_url: string; // URL for the accept link base
}

export interface UpdateWorkspaceInvitationPayload {
  permissions?: string; // e.g., "ADMIN", "MEMBER", "VIEWER"
  // According to spec, only permissions can be updated here.
}

// Workspace Settings (GenAI example)
export interface OpenAISettings {
  models?: string[];
  api_key?: string;
  organization?: string;
}

export interface AnthropicSettings {
  models?: string[];
  api_key?: string;
}

export interface MistralSettings {
  models?: string[];
  api_key?: string;
}

export interface OllamaSettings {
  models?: string[];
  host?: string; // Ollama typically uses a host URL
}

export interface OpenRouterSettings {
  models?: string[];
  api_key?: string;
}

export interface GenerativeAISettings {
  openai?: OpenAISettings;
  anthropic?: AnthropicSettings;
  mistral?: MistralSettings;
  ollama?: OllamaSettings;
  openrouter?: OpenRouterSettings;
}

// Workspace Export/Import
// Response structure for list_workspace_exports
export interface ListExportWorkspaceApplicationsResponse {
  results: ExportApplicationsJobTypeResponse[];
}

// Response structure for export_workspace_applications_async
export interface ExportApplicationsJobTypeResponse {
  id: number;
  type: string; // "export_applications"
  progress_percentage: number;
  state: string;
  human_readable_error?: string | null;
  exported_file_name: string;
  url: string; // Download URL
  created_on: string; // ISO DateTime
  workspace_id: number | null;
  // Note: application_ids might be part of the request, not response usually
}

// Response structure for import_resource_upload_file
export interface ImportResource {
  id: number;
  name: string;
  size?: number; // Optional as per spec
}

// Request structure for import_workspace_applications_async
export interface ImportWorkspaceApplicationsPayload {
  resource_id: number;
}

// Response structure for import_workspace_applications_async
export interface ImportApplicationsJobTypeResponse {
  id: number;
  type: string; // "import_applications"
  progress_percentage: number;
  state: string;
  human_readable_error?: string | null;
  installed_applications: any; // Define more specifically if possible
  workspace_id: number;
  resource: ImportResource;
}

// Workspace Permissions
export interface PermissionObject {
  name: string;
  permissions: any; // Define more specifically based on usage
} 