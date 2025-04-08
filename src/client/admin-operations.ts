import { BaserowClient } from "./baserow-client";
import type {
    AuditLogActionType,
    SingleAuditLogExportJobRequest,
    SingleAuditLogExportJobResponse,
    PatchedUserAdminUpdate,
    UserAdminResponse,
    BaserowImpersonateAuthTokenPayload,
    ImpersonateResponse,
    PaginationSerializerWorkspacesAdminResponse,
    ListAdminWorkspacesParams,
    ListAuditLogActionTypesParams,
    ListAuditLogParams,
    ListAuditLogUsersParams,
    ListAuditLogWorkspacesParams,
    PaginationSerializerAuditLog,
    PaginationSerializerAuditLogUser,
    PaginationSerializerAuditLogWorkspace,
    BaseAuthProviderPayload,
    AdminDashboard,
    ListAdminUsersParams,
    PaginationSerializerUserAdminResponse,
    UserAdminCreate,
    WorkspacesAdminResponse,
} from '../types/admin'
    
/**
 * Operations for Baserow administration.
 */
export class AdminOperations {
    constructor(private client: BaserowClient) {}

    // --- Audit Log ---

    /**
     * Lists audit log entries. (Enterprise feature)
     * @param params - Optional parameters for filtering, sorting, and pagination.
     * @returns Paginated list of audit log entries.
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_list
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_list_2
     */
    async listAuditLog(params?: ListAuditLogParams): Promise<PaginationSerializerAuditLog> {
        const queryParams = params ? { ...params } : undefined;
        // Using the non-admin path as default
        return this.client._request<PaginationSerializerAuditLog>(
            'GET', // Added Method
            '/api/audit-log/',
            queryParams
        );
    }

    /**
     * Lists distinct action types found in the audit log. (Enterprise feature)
     * @param params - Optional parameters for searching and filtering by workspace.
     * @returns Array of distinct audit log action types.
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_action_types
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_action_types_2
     */
    async listAuditLogActionTypes(params?: ListAuditLogActionTypesParams): Promise<AuditLogActionType[]> {
        const queryParams = params ? { ...params } : undefined;
         // Using the non-admin path as default
        return this.client._request<AuditLogActionType[]>(
            'GET', // Added Method
            '/api/audit-log/action-types/',
            queryParams
        );
    }

    /**
     * Starts an asynchronous job to export audit log entries to a CSV file. (Enterprise feature)
     * @param payload - Export options and filters.
     * @param options - Optional request parameters like ClientSessionId.
     * @returns Details of the created export job.
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/async_audit_log_export
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/async_audit_log_export_2
     */
    async exportAuditLog(payload: SingleAuditLogExportJobRequest, options?: { clientSessionId?: string }): Promise<SingleAuditLogExportJobResponse> {
        const headers: Record<string, string> | undefined = options?.clientSessionId
            ? { 'ClientSessionId': options.clientSessionId }
            : undefined;
         // Using the non-admin path as default
        return this.client._request<SingleAuditLogExportJobResponse>(
            'POST', // Added Method
            '/api/audit-log/export/',
            undefined,
            payload,
            headers
        );
    }

    /**
     * Lists users who have entries in the audit log. (Enterprise feature)
     * @param params - Optional parameters for searching, pagination, and filtering by workspace.
     * @returns Paginated list of users from the audit log.
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_users
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_users_2
     */
    async listAuditLogUsers(params?: ListAuditLogUsersParams): Promise<PaginationSerializerAuditLogUser> {
        const queryParams = params ? { ...params } : undefined;
         // Using the non-admin path as default
        return this.client._request<PaginationSerializerAuditLogUser>(
            'GET', // Added Method
            '/api/audit-log/users/',
            queryParams
        );
    }

    /**
     * Lists distinct workspaces found in the audit log. (Enterprise feature)
     * @param params - Optional parameters for searching and pagination.
     * @returns Paginated list of workspaces from the audit log.
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_workspaces
     * @see https://api.baserow.io/api/redoc/#tag/Audit-log/operation/audit_log_workspaces_2
     */
    async listAuditLogWorkspaces(params?: ListAuditLogWorkspacesParams): Promise<PaginationSerializerAuditLogWorkspace> {
        const queryParams = params ? { ...params } : undefined;
         // Using the non-admin path as default
        return this.client._request<PaginationSerializerAuditLogWorkspace>(
            'GET', // Added Method
            '/api/audit-log/workspaces/',
            queryParams
        );
    }

    // --- Auth Providers ---

    /**
     * Lists all available authentication providers configured in the admin panel.
     * @returns An array of authentication provider configurations.
     * @see https://api.baserow.io/api/redoc/#tag/Auth/operation/list_auth_providers
     */
    async listAuthProviders(): Promise<any[]> { // Replace 'any' with specific Authentication_ProviderAuthProvider if fully defined
        return this.client._request<any[]>(
            'GET', // Added Method
            '/api/admin/auth-provider/'
        );
    }

    /**
     * Creates a new authentication provider. Requires staff/admin privileges.
     * @param payload - The configuration for the new auth provider.
     * @returns The created authentication provider configuration.
     * @see https://api.baserow.io/api/redoc/#tag/Auth/operation/create_auth_provider
     */
    async createAuthProvider(payload: BaseAuthProviderPayload): Promise<any> { // Replace 'any' with specific Authentication_ProviderAuthProvider
        return this.client._request<any>(
            'POST', // Added Method
            '/api/admin/auth-provider/',
            undefined,
            payload
        );
    }

    /**
     * Retrieves a specific authentication provider by its ID.
     * @param authProviderId - The ID of the authentication provider.
     * @returns The authentication provider configuration.
     * @see https://api.baserow.io/api/redoc/#tag/Auth/operation/get_auth_provider
     */
    async getAuthProvider(authProviderId: number): Promise<any> { // Replace 'any' with specific Authentication_ProviderAuthProvider
        return this.client._request<any>(
            'GET', // Added Method
            `/api/admin/auth-provider/${authProviderId}/`
        );
    }

    /**
     * Updates an existing authentication provider. Requires staff/admin privileges.
     * @param authProviderId - The ID of the provider to update.
     * @param payload - The partial configuration updates.
     * @returns The updated authentication provider configuration.
     * @see https://api.baserow.io/api/redoc/#tag/Auth/operation/update_auth_provider
     */
    async updateAuthProvider(authProviderId: number, payload: Partial<BaseAuthProviderPayload>): Promise<any> { // Replace 'any' with specific Authentication_ProviderAuthProvider
        return this.client._request<any>(
            'PATCH', // Added Method
            `/api/admin/auth-provider/${authProviderId}/`,
            undefined,
            payload
        );
    }

     /**
      * Deletes an authentication provider. Requires staff/admin privileges.
      * @param authProviderId - The ID of the provider to delete.
      * @see https://api.baserow.io/api/redoc/#tag/Auth/operation/delete_auth_provider
      */
     async deleteAuthProvider(authProviderId: number): Promise<void> {
        await this.client._request<void>(
            'DELETE', // Added Method
            `/api/admin/auth-provider/${authProviderId}/`
        );
     }

    // --- Dashboard ---

    /**
     * Gets statistics for the admin dashboard. Requires staff/admin privileges.
     * @returns Dashboard statistics object.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_dashboard
     */
    async getDashboardStats(): Promise<AdminDashboard> {
        return this.client._request<AdminDashboard>(
            'GET', // Added Method
            '/api/admin/dashboard/'
        );
    }

    // --- Users ---

    /**
     * Lists all users in the Baserow instance. Requires staff/admin privileges.
     * @param params - Optional parameters for pagination, searching, and sorting.
     * @returns Paginated list of admin user representations.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_list_users
     */
    async listUsers(params?: ListAdminUsersParams): Promise<PaginationSerializerUserAdminResponse> {
        const queryParams = params ? { ...params } : undefined;
        return this.client._request<PaginationSerializerUserAdminResponse>(
            'GET', // Added Method
            '/api/admin/users/',
            queryParams
        );
    }

    /**
     * Creates a new user. Requires staff/admin privileges.
     * @param payload - User details (name, email, password, active/staff status).
     * @returns The created user details.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_create_user
     */
    async createUser(payload: UserAdminCreate): Promise<UserAdminResponse> {
        return this.client._request<UserAdminResponse>(
            'POST', // Added Method
            '/api/admin/users/',
            undefined,
            payload
        );
    }

    /**
     * Updates an existing user. Requires staff/admin privileges.
     * @param userId - The ID of the user to update.
     * @param payload - The user attributes to update.
     * @returns The updated user details.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_edit_user
     */
    async updateUser(userId: number, payload: PatchedUserAdminUpdate): Promise<UserAdminResponse> {
        return this.client._request<UserAdminResponse>(
            'PATCH', // Added Method
            `/api/admin/users/${userId}/`,
            undefined,
            payload
        );
    }

    /**
     * Deletes a user. Requires staff/admin privileges. Cannot delete self.
     * @param userId - The ID of the user to delete.
     * @returns void - Returns 200 OK on success (spec says 200, not 204).
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_delete_user
     */
    async deleteUser(userId: number): Promise<void> {
        // Spec indicates 200 OK response, adjust _request if it strictly expects 204 for deletes
        await this.client._request<void>(
            'DELETE', // Added Method
            `/api/admin/users/${userId}/`
        );
    }

    /**
     * Allows a staff user to impersonate another non-staff/non-superuser.
     * @param payload - Object containing the user ID to impersonate.
     * @returns Authentication tokens and user details for the impersonated session.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_impersonate_user
     */
    async impersonateUser(payload: BaserowImpersonateAuthTokenPayload): Promise<ImpersonateResponse> {
        return this.client._request<ImpersonateResponse>(
            'POST', // Added Method
            '/api/admin/users/impersonate/',
            undefined,
            payload
        );
    }

    // --- Workspaces (Admin-specific) ---

    /**
     * Lists all workspaces in the instance. Requires staff/admin privileges.
     * @param params - Optional parameters for pagination, searching, and sorting.
     * @returns Paginated list of admin workspace representations.
     * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_list_workspaces
     */
    async listWorkspaces(params?: ListAdminWorkspacesParams): Promise<PaginationSerializerWorkspacesAdminResponse> {
        const queryParams = params ? { ...params } : undefined;
        return this.client._request<PaginationSerializerWorkspacesAdminResponse>(
            'GET', // Added Method
            '/api/admin/workspaces/',
            queryParams
        );
    }

     /**
      * Deletes a workspace as an admin. Requires staff/admin privileges.
      * @param workspaceId - The ID of the workspace to delete.
      * @see https://api.baserow.io/api/redoc/#tag/Admin/operation/admin_delete_workspace
      */
     async deleteWorkspace(workspaceId: number): Promise<void> {
        await this.client._request<void>(
            'DELETE', // Added Method
            `/api/admin/workspaces/${workspaceId}/`
        );
     }
}
