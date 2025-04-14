import { BaserowClient } from "./baserow-client";

/**
 * Operations for managing Baserow users.
 */
export class UserOperations {
  constructor(private client: BaserowClient) {}
  
  /**
   * Authenticates a user with email and password.
   * Returns JWT tokens and user information that can be used for subsequent API calls.
   * @param email - User's email
   * @param password - User's password
   * @returns Object containing user information, access_token and refresh_token
   * @throws {BaserowApiError} If authentication fails
   */
  async login(email: string, password: string): Promise<{
    user: {
      first_name: string;
      username: string;
      language: string;
    };
    access_token: string;
    refresh_token: string;
  }> {
    return this.client._request<{
      user: {
        first_name: string;
        username: string;
        language: string;
      };
      access_token: string;
      refresh_token: string;
    }>(
      "POST",
      "/api/user/token-auth/",
      undefined,
      { email, password }
    );
  }

  /**
   * Refreshes an expired JWT token using a refresh token.
   * @param refreshToken - The refresh token obtained during login
   * @returns Object containing a new access_token and user information
   * @throws {BaserowApiError} If the refresh token is invalid or expired
   */
  async refreshToken(refreshToken: string): Promise<{
    user: {
      first_name: string;
      username: string;
      language: string;
    };
    access_token: string;
  }> {
    return this.client._request<{
      user: {
        first_name: string;
        username: string;
        language: string;
      };
      access_token: string;
    }>(
      "POST",
      "/api/user/token-refresh/",
      undefined,
      { refresh: refreshToken }
    );
  }

  /**
   * Verifies if a JWT token is valid and returns user information.
   * @param token - The JWT token to verify
   * @returns User information if token is valid
   * @throws {BaserowApiError} If the token is invalid
   */
  async verifyToken(token: string): Promise<{ user: { first_name: string; username: string; language: string } }> {
    return this.client._request<{ user: { first_name: string; username: string; language: string } }>(
      "POST",
      "/api/user/token-verify/",
      undefined,
      { token }
    );
  }

  /**
   * Logs out a user by blacklisting their refresh token.
   * @param refreshToken - The refresh token to blacklist
   * @throws {BaserowApiError} If the token blacklisting fails
   */
  async logout(refreshToken: string): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/token-blacklist/",
      undefined,
      { refresh: refreshToken }
    );
  }

  /**
   * Creates a new user based on the provided values.
   * @param options - Object containing user registration fields:
   *   - name: User's name
   *   - email: User's email
   *   - password: User's password
   *   - language: Optional ISO 639 language code (default: "en")
   *   - authenticate: Whether to generate authentication tokens (default: false)
   *   - workspaceInvitationToken: Optional workspace invitation token
   *   - templateId: Optional template ID to install after creating account
   * @returns Object containing user information and possibly tokens if authenticate is true
   * @throws {BaserowApiError} If user creation fails
   */
  async register(options: {
    name: string;
    email: string;
    password: string;
    language?: string;
    authenticate?: boolean;
    workspaceInvitationToken?: string;
    templateId?: number;
  }): Promise<{
    user: {
      first_name: string;
      username: string;
      language: string;
    };
    access_token?: string;
    refresh_token?: string;
  }> {
    return this.client._request<{
      user: {
        first_name: string;
        username: string;
        language: string;
      };
      access_token?: string;
      refresh_token?: string;
    }>(
      "POST",
      "/api/user/",
      undefined,
      {
        name: options.name,
        email: options.email,
        password: options.password,
        language: options.language,
        authenticate: options.authenticate,
        workspace_invitation_token: options.workspaceInvitationToken,
        template_id: options.templateId
      }
    );
  }

  /**
   * Updates the account information of the authenticated user.
   * @param options - Account fields to update
   * @returns Updated account information
   * @throws {BaserowApiError} If update fails
   */
  async updateAccount(options: {
    firstName?: string;
    language?: string;
    emailNotificationFrequency?: 'instant' | 'daily' | 'weekly' | 'never';
    completedOnboarding?: boolean;
    completedGuidedTours?: string[];
  }): Promise<{
    first_name: string;
    language: string;
    email_notification_frequency: string;
    completed_onboarding: boolean;
    completed_guided_tours: string[];
  }> {
    return this.client._request<{
      first_name: string;
      language: string;
      email_notification_frequency: string;
      completed_onboarding: boolean;
      completed_guided_tours: string[];
    }>(
      "PATCH",
      "/api/user/account/",
      undefined,
      {
        first_name: options.firstName,
        language: options.language,
        email_notification_frequency: options.emailNotificationFrequency,
        completed_onboarding: options.completedOnboarding,
        completed_guided_tours: options.completedGuidedTours
      }
    );
  }

  /**
   * Changes the password of an authenticated user.
   * @param oldPassword - Current password
   * @param newPassword - New password
   * @throws {BaserowApiError} If password change fails
   */
  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/change-password/",
      undefined,
      { old_password: oldPassword, new_password: newPassword }
    );
  }

  /**
   * Lists all the relevant user information that could be shown on a dashboard.
   * It will contain all the pending workspace invitations for that user.
   * @returns Dashboard information including workspace invitations
   * @throws {BaserowApiError} If request fails
   */
  async getDashboard(): Promise<{
    workspace_invitations: Array<{
      id: number;
      invited_by: string;
      workspace: string;
      email: string;
      message: string;
      created_on: string;
      email_exists: boolean;
    }>;
  }> {
    return this.client._request<{
      workspace_invitations: Array<{
        id: number;
        invited_by: string;
        workspace: string;
        email: string;
        message: string;
        created_on: string;
        email_exists: boolean;
      }>;
    }>(
      "GET",
      "/api/user/dashboard/",
      undefined,
      undefined
    );
  }

  /**
   * Changes the password of a user if the reset token is valid.
   * @param token - Password reset token
   * @param password - New password
   * @throws {BaserowApiError} If password reset fails
   */
  async resetPassword(token: string, password: string): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/reset-password/",
      undefined,
      { token, password }
    );
  }

  /**
   * Sends an email containing the password reset link to the user's email address.
   * @param email - User's email address
   * @param baseUrl - Base URL for the reset link
   * @throws {BaserowApiError} If sending email fails
   */
  async sendPasswordResetEmail(email: string, baseUrl: string): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/send-reset-password-email/",
      undefined,
      { email, base_url: baseUrl }
    );
  }

  /**
   * Schedules the account deletion of the authenticated user.
   * @throws {BaserowApiError} If scheduling deletion fails
   */
  async scheduleAccountDeletion(): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/schedule-account-deletion/",
      undefined,
      undefined
    );
  }

  /**
   * Sends an email to the user with an email verification link.
   * @throws {BaserowApiError} If sending verification email fails
   */
  async sendVerifyEmail(): Promise<void> {
    await this.client._request<void>(
      "POST",
      "/api/user/send-verify-email/",
      undefined,
      undefined
    );
  }

  /**
   * Verifies a user's email address with a verification token.
   * @param token - Email verification token
   * @returns User information and tokens if unauthenticated
   * @throws {BaserowApiError} If email verification fails
   */
  async verifyEmail(token: string): Promise<{
    user?: {
      first_name: string;
      username: string;
      language: string;
    };
    access_token?: string;
    refresh_token?: string;
  }> {
    return this.client._request<{
      user?: {
        first_name: string;
        username: string;
        language: string;
      };
      access_token?: string;
      refresh_token?: string;
    }>(
      "POST",
      "/api/user/verify-email/",
      undefined,
      { token }
    );
  }

  /**
   * Undoes the latest undoable action performed by the user.
   * @param clientSessionId - Client session ID header
   * @param scopes - Optional scopes to filter actions
   * @returns Result of the undo operation
   * @throws {BaserowApiError} If undo fails
   */
  async undo(clientSessionId: string, scopes?: {
    root?: boolean;
    workspace?: number;
    application?: number;
    table?: number;
    view?: number;
    teamsInWorkspace?: number;
  }): Promise<{
    actions: Array<{
      action_type: string | null;
      action_scope: string | null;
    }>;
    result_code: string;
  }> {
    return this.client._request<{
      actions: Array<{
        action_type: string | null;
        action_scope: string | null;
      }>;
      result_code: string;
    }>(
      "PATCH",
      "/api/user/undo/",
      { ClientSessionId: clientSessionId },
      { scopes }
    );
  }

  /**
   * Redoes the latest redoable action performed by the user.
   * @param clientSessionId - Client session ID header
   * @param scopes - Optional scopes to filter actions
   * @returns Result of the redo operation
   * @throws {BaserowApiError} If redo fails
   */
  async redo(clientSessionId: string, scopes?: {
    root?: boolean;
    workspace?: number;
    application?: number;
    table?: number;
    view?: number;
    teamsInWorkspace?: number;
  }): Promise<{
    actions: Array<{
      action_type: string | null;
      action_scope: string | null;
    }>;
    result_code: string;
  }> {
    return this.client._request<{
      actions: Array<{
        action_type: string | null;
        action_scope: string | null;
      }>;
      result_code: string;
    }>(
      "PATCH",
      "/api/user/redo/",
      { ClientSessionId: clientSessionId },
      { scopes }
    );
  }
} 