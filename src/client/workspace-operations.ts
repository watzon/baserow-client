import type { 
  Workspace, 
  WorkspaceUserWorkspace, 
  WorkspaceUser,
  CreateWorkspacePayload,
  UpdateWorkspacePayload,
  OrderWorkspacesPayload,
  ListWorkspaceUsersParams,
  UpdateWorkspaceUserPayload,
  WorkspaceInvitation,
  CreateWorkspaceInvitationPayload,
  UpdateWorkspaceInvitationPayload,
  GenerativeAISettings,
  ListExportWorkspaceApplicationsResponse,
  ExportApplicationsJobTypeResponse,
  ImportResource,
  ImportWorkspaceApplicationsPayload,
  ImportApplicationsJobTypeResponse,
  PermissionObject
} from "../types/workspace";

import type { BaserowClient } from "./baserow-client";

export class WorkspaceOperations {
  constructor(private client: BaserowClient) {}

  /**
   * Lists all the workspaces of the authorized user.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/list_workspaces
   */
  async list(): Promise<WorkspaceUserWorkspace[]> {
    // No headers needed for list, original code is fine
    return this.client._request<WorkspaceUserWorkspace[]>(
      "GET",
      "/api/workspaces/"
    );
  }

  /**
   * Creates a new workspace.
   * @param data - The data for the new workspace.
   * @param options - Optional request parameters like ClientSessionId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/create_workspace
   */
  async create(
    data: CreateWorkspacePayload,
    options?: { clientSessionId?: string }
  ): Promise<WorkspaceUserWorkspace> {
    // Corrected header handling
    const headers: Record<string, string> | undefined = options?.clientSessionId
      ? { ClientSessionId: options.clientSessionId }
      : undefined;
    return this.client._request<WorkspaceUserWorkspace>(
      "POST",
      "/api/workspaces/",
      undefined,
      data,
      headers
    );
  }

  /**
   * Updates an existing workspace.
   * @param workspaceId - The ID of the workspace to update.
   * @param data - The data to update the workspace with.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/update_workspace
   */
  async update(
    workspaceId: number,
    data: UpdateWorkspacePayload,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Workspace> {
    // Corrected header handling
    const headers: Record<string, string> | undefined = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    // Pass undefined if no headers were added
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
    return this.client._request<Workspace>(
      "PATCH",
      `/api/workspaces/${workspaceId}/`,
      undefined,
      data,
      finalHeaders
    );
  }

  /**
   * Deletes a workspace.
   * @param workspaceId - The ID of the workspace to delete.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/delete_workspace
   */
  async delete(
    workspaceId: number,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<void> {
    // Corrected header handling
    const headers: Record<string, string> | undefined = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
    await this.client._request<void>(
      "DELETE",
      `/api/workspaces/${workspaceId}/`,
      undefined,
      undefined,
      finalHeaders
    );
  }

  /**
   * Changes the order of workspaces for the user.
   * @param workspaceIds - An array of workspace IDs in the desired order.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/order_workspaces
   */
  async order(
    workspaceIds: number[],
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<void> {
    // Corrected header handling
    const headers: Record<string, string> | undefined = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
    const payload: OrderWorkspacesPayload = { workspaces: workspaceIds };
    await this.client._request<void>(
      "POST",
      "/api/workspaces/order/",
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Leaves a workspace.
   * @param workspaceId - The ID of the workspace to leave.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/leave_workspace
   */
  async leave(workspaceId: number): Promise<void> {
    // No headers needed for leave, original code is fine
    await this.client._request<void>(
      "POST",
      `/api/workspaces/${workspaceId}/leave/`
    );
  }

  /**
   * Lists all users within a specific workspace. Requires admin permissions.
   * @param workspaceId - The ID of the workspace.
   * @param params - Optional search and sort parameters.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/list_workspace_users
   */
  async listUsers(
    workspaceId: number,
    params?: ListWorkspaceUsersParams
  ): Promise<WorkspaceUser[]> {
    // Use spread operator to create a new object literal if params exist
    const queryParams = params ? { ...params } : undefined;
    return this.client._request<WorkspaceUser[]>(
      "GET",
      `/api/workspaces/users/workspace/${workspaceId}/`,
      queryParams // Pass the potentially new object or undefined
    );
  }

  /**
   * Updates a user's permissions within a workspace. Requires admin permissions.
   * @param workspaceUserId - The ID of the workspace-user relation (not the user ID itself).
   * @param payload - The permissions to update.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/update_workspace_user
   */
  async updateUserPermissions(
    workspaceUserId: number,
    payload: UpdateWorkspaceUserPayload
  ): Promise<WorkspaceUser> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    return this.client._request<WorkspaceUser>(
      "PATCH",
      `/api/workspaces/users/${workspaceUserId}/`,
      undefined,
      payload
    );
  }

  /**
   * Removes a user from a workspace. Requires admin permissions.
   * @param workspaceUserId - The ID of the workspace-user relation to delete.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/delete_workspace_user
   */
  async deleteUser(workspaceUserId: number): Promise<void> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    await this.client._request<void>(
      "DELETE",
      `/api/workspaces/users/${workspaceUserId}/`
    );
  }

  /**
   * Lists pending invitations for a workspace. Requires admin permissions.
   * @param workspaceId - The ID of the workspace.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/list_workspace_invitations
   */
  async listInvitations(workspaceId: number): Promise<WorkspaceInvitation[]> {
    return this.client._request<WorkspaceInvitation[]>(
      "GET",
      `/api/workspaces/invitations/workspace/${workspaceId}/`
    );
  }

  /**
   * Creates a new invitation for a user to join a workspace. Requires admin permissions.
   * @param workspaceId - The ID of the workspace to invite the user to.
   * @param payload - Details of the invitation (email, permissions, etc.).
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/create_workspace_invitation
   */
  async createInvitation(
    workspaceId: number,
    payload: CreateWorkspaceInvitationPayload
  ): Promise<WorkspaceInvitation> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    return this.client._request<WorkspaceInvitation>(
      "POST",
      `/api/workspaces/invitations/workspace/${workspaceId}/`,
      undefined,
      payload
    );
  }

  /**
   * Retrieves details of a specific workspace invitation. Requires admin permissions.
   * @param workspaceInvitationId - The ID of the invitation.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/get_workspace_invitation
   */
  async getInvitation(
    workspaceInvitationId: number
  ): Promise<WorkspaceInvitation> {
    return this.client._request<WorkspaceInvitation>(
      "GET",
      `/api/workspaces/invitations/${workspaceInvitationId}/`
    );
  }

  /**
   * Updates an existing workspace invitation. Requires admin permissions.
   * @param workspaceInvitationId - The ID of the invitation to update.
   * @param payload - The permissions to update.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/update_workspace_invitation
   */
  async updateInvitation(
    workspaceInvitationId: number,
    payload: UpdateWorkspaceInvitationPayload
  ): Promise<WorkspaceInvitation> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    return this.client._request<WorkspaceInvitation>(
      "PATCH",
      `/api/workspaces/invitations/${workspaceInvitationId}/`,
      undefined,
      payload
    );
  }

  /**
   * Deletes/revokes a pending workspace invitation. Requires admin permissions.
   * @param workspaceInvitationId - The ID of the invitation to delete.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/delete_workspace_invitation
   */
  async deleteInvitation(workspaceInvitationId: number): Promise<void> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    await this.client._request<void>(
      "DELETE",
      `/api/workspaces/invitations/${workspaceInvitationId}/`
    );
  }

  /**
   * Accepts a workspace invitation. This is typically called by the invited user.
   * @param workspaceInvitationId - The ID of the invitation to accept.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/accept_workspace_invitation
   */
  async acceptInvitation(
    workspaceInvitationId: number
  ): Promise<WorkspaceUserWorkspace> {
    return this.client._request<WorkspaceUserWorkspace>(
      "POST",
      `/api/workspaces/invitations/${workspaceInvitationId}/accept/`
    );
  }

  /**
   * Rejects a workspace invitation. This is typically called by the invited user.
   * @param workspaceInvitationId - The ID of the invitation to reject.
   * @see https://api.baserow.io/api/redoc/#tag/Workspace-invitations/operation/reject_workspace_invitation
   */
  async rejectInvitation(workspaceInvitationId: number): Promise<void> {
    await this.client._request<void>(
      "POST",
      `/api/workspaces/invitations/${workspaceInvitationId}/reject/`
    );
  }

  /**
   * Gets the generative AI model settings for a workspace. Requires admin permissions.
   * @param workspaceId - The ID of the workspace.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/get_workspace_generative_ai_models_settings
   */
  async getGenerativeAiSettings(
    workspaceId: number
  ): Promise<GenerativeAISettings> {
    return this.client._request<GenerativeAISettings>(
      "GET",
      `/api/workspaces/${workspaceId}/settings/generative-ai/`
    );
  }

  /**
   * Updates the generative AI model settings for a workspace. Requires admin permissions.
   * @param workspaceId - The ID of the workspace.
   * @param settings - The settings to update.
   * @param options - Optional request parameters like ClientSessionId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/update_workspace_generative_ai_models_settings
   */
  async updateGenerativeAiSettings(
    workspaceId: number,
    settings: Partial<GenerativeAISettings>,
    options?: { clientSessionId?: string }
  ): Promise<Workspace> {
    // Spec says returns Workspace, confirm if needed
    const headers: Record<string, string> | undefined = options?.clientSessionId
      ? { ClientSessionId: options.clientSessionId }
      : undefined;
    return this.client._request<Workspace>(
      "PATCH",
      `/api/workspaces/${workspaceId}/settings/generative-ai/`,
      undefined,
      settings,
      headers
    );
  }

  /**
   * Lists previously created exports for a workspace.
   * @param workspaceId - The ID of the workspace.
   * @param options - Optional request parameters like ClientSessionId.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/list_workspace_exports
   */
  async listExports(
    workspaceId: number,
    options?: { clientSessionId?: string }
  ): Promise<ListExportWorkspaceApplicationsResponse> {
    const headers: Record<string, string> | undefined = options?.clientSessionId
      ? { ClientSessionId: options.clientSessionId }
      : undefined;
    return this.client._request<ListExportWorkspaceApplicationsResponse>(
      "GET",
      `/api/workspaces/${workspaceId}/export/`,
      undefined,
      undefined,
      headers
    );
  }

  /**
   * Starts an asynchronous job to export applications from a workspace.
   * @param workspaceId - The ID of the workspace to export from.
   * @param payload - Optional: Specify application IDs to export, or export only structure.
   * @param options - Optional request parameters like ClientSessionId.
   * @returns The job details for the export task.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/export_workspace_applications_async
   */
  async exportApplications(
    workspaceId: number,
    payload?: { application_ids?: number[]; only_structure?: boolean },
    options?: { clientSessionId?: string }
  ): Promise<ExportApplicationsJobTypeResponse> {
    const headers: Record<string, string> | undefined = options?.clientSessionId
      ? { ClientSessionId: options.clientSessionId }
      : undefined;
    return this.client._request<ExportApplicationsJobTypeResponse>(
      "POST",
      `/api/workspaces/${workspaceId}/export/async/`,
      undefined,
      payload, // Body might be optional if exporting all
      headers
    );
  }

  /**
   * Uploads a file (previously exported .zip) to be imported into a workspace.
   * @param workspaceId - The ID of the workspace to import into.
   * @param file - The File object or Blob representing the .zip file.
   * @param options - Optional request parameters like ClientSessionId.
   * @returns Information about the uploaded resource.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/import_resource_upload_file
   */
  async uploadImportFile(
    workspaceId: number,
    file: File | Blob,
    options?: { clientSessionId?: string }
  ): Promise<ImportResource> {
    const headers: Record<string, string> = {}; // Don't set Content-Type for FormData
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;

    const formData = new FormData();
    formData.append(
      "file",
      file,
      file instanceof File ? file.name : "import.zip"
    );

    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<ImportResource>(
      "POST",
      `/api/workspaces/${workspaceId}/import/upload-file/`,
      undefined,
      formData,
      finalHeaders // Pass undefined or the headers object
    );
  }

  /**
   * Starts an asynchronous job to import applications from an uploaded resource.
   * @param workspaceId - The ID of the workspace to import into.
   * @param payload - Contains the ID of the uploaded resource.
   * @param options - Optional request parameters like ClientSessionId.
   * @returns The job details for the import task.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/import_workspace_applications_async
   */
  async importApplications(
    workspaceId: number,
    payload: ImportWorkspaceApplicationsPayload,
    options?: { clientSessionId?: string }
  ): Promise<ImportApplicationsJobTypeResponse> {
    const headers: Record<string, string> | undefined = options?.clientSessionId
      ? { ClientSessionId: options.clientSessionId }
      : undefined;
    return this.client._request<ImportApplicationsJobTypeResponse>(
      "POST",
      `/api/workspaces/${workspaceId}/import/async/`,
      undefined,
      payload,
      headers
    );
  }

  /**
   * Deletes an uploaded import/export resource file.
   * @param workspaceId - The ID of the workspace the resource belongs to.
   * @param resourceId - The ID of the resource (obtained from upload) to delete.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/import_export_resource
   */
  async deleteImportResource(
    workspaceId: number,
    resourceId: number
  ): Promise<void> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    await this.client._request<void>(
      "DELETE",
      `/api/workspaces/${workspaceId}/import/${resourceId}/`
    );
  }

  /**
   * Gets the permission object for the current user within a specific workspace.
   * @param workspaceId - The ID of the workspace.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/workspace_permissions
   */
  async getPermissions(workspaceId: number): Promise<PermissionObject[]> {
    return this.client._request<PermissionObject[]>(
      "GET",
      `/api/workspaces/${workspaceId}/permissions/`
    );
  }

  /**
   * Creates an initial workspace with example data. Typically used after signup if onboarding is skipped.
   * @see https://api.baserow.io/api/redoc/#tag/Workspaces/operation/create_initial_workspace
   */
  async createInitialWorkspace(): Promise<WorkspaceUserWorkspace> {
    // Note: ClientSessionId/UndoRedo headers are not listed in the spec for this endpoint
    return this.client._request<WorkspaceUserWorkspace>(
      "POST",
      "/api/workspaces/create-initial-workspace/"
    );
  }
} 