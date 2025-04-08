import type {
  BaserowRow,
  ListRowsParams,
  ListRowsResponse,
  CreateRowParams,
  UpdateRowParams,
  DeleteRowParams,
  MoveRowParams,
  BatchCreateRowsPayload,
  BatchUpdateRowsPayload,
  BatchDeleteRowsPayload,
  GetAdjacentRowParams,
  ListRowHistoryParams,
  ListRowHistoryResponse,
  ListRowNamesParams,
  ListRowNamesResponse,
  ListRowCommentsParams,
  ListRowCommentsResponse,
  CreateRowCommentPayload,
  UpdateRowCommentPayload,
  RowComment,
  UpdateRowCommentNotificationModePayload
} from "../types/database";

import type { BaserowClient } from "./baserow-client";
import { BaserowApiError } from "../types/error";

export class DatabaseRowOperations {
    constructor(private client: BaserowClient) {}
  
    /**
     * Lists rows in a table, with support for pagination, filtering, sorting, and searching.
     * @param tableId - The ID of the table to list rows from.
     * @param params - Optional query parameters for pagination, filtering, sorting, etc.
     * @returns A paginated list of rows.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/list_database_table_rows
     */
    async list<T extends BaserowRow = BaserowRow>(
      tableId: number,
      params?: ListRowsParams
    ): Promise<ListRowsResponse<T>> {
      // Handle structured filters separately
      const { filters, ...otherParams } = params || {};
      const queryParams: Record<string, any> = { ...otherParams };
      if (filters) {
        queryParams["filters"] = JSON.stringify(filters);
        // Remove individual filter params if structured filters are provided
        Object.keys(queryParams).forEach((key) => {
          if (key.startsWith("filter__")) {
            delete queryParams[key];
          }
        });
        delete queryParams["filter_type"];
      }
  
      return this.client._request<ListRowsResponse<T>>(
        "GET",
        `/api/database/rows/table/${tableId}/`,
        queryParams
      );
    }
  
    /**
     * Fetches a single row from a table.
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the row to fetch.
     * @param params - Optional parameters like 'include' or 'user_field_names'.
     * @returns The requested row.
     * @throws {BaserowApiError} If the request fails or the row/table doesn't exist.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/get_database_table_row
     */
    async get<T extends BaserowRow = BaserowRow>(
      tableId: number,
      rowId: number,
      params?: { include?: "metadata"; user_field_names?: boolean }
    ): Promise<T> {
      return this.client._request<T>(
        "GET",
        `/api/database/rows/table/${tableId}/${rowId}/`,
        params
      );
    }
  
    /**
     * Creates a new row in a table.
     * @param tableId - The ID of the table to create the row in.
     * @param rowData - An object representing the row data. Keys should be `field_{id}` or field names if user_field_names is true.
     * @param params - Optional query parameters like 'before', 'send_webhook_events', 'user_field_names'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @returns The newly created row.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/create_database_table_row
     */
    async create<
      TRequest = Record<string, any>,
      TResponse extends BaserowRow = BaserowRow
    >(
      tableId: number,
      rowData: TRequest,
      params?: CreateRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<TResponse> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      return this.client._request<TResponse>(
        "POST",
        `/api/database/rows/table/${tableId}/`,
        queryParams, // Pass the potentially new object or undefined
        rowData,
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Updates an existing row in a table.
     * @param tableId - The ID of the table containing the row.
     * @param rowId - The ID of the row to update.
     * @param rowData - An object containing the fields to update. Keys should be `field_{id}` or field names if user_field_names is true.
     * @param params - Optional query parameters like 'send_webhook_events', 'user_field_names'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @returns The updated row.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/update_database_table_row
     */
    async update<
      TRequest = Record<string, any>,
      TResponse extends BaserowRow = BaserowRow
    >(
      tableId: number,
      rowId: number,
      rowData: Partial<TRequest>, // Use Partial as we only send fields to update
      params?: UpdateRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<TResponse> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      return this.client._request<TResponse>(
        "PATCH",
        `/api/database/rows/table/${tableId}/${rowId}/`,
        queryParams, // Pass the potentially new object or undefined
        rowData,
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Deletes a row from a table.
     * @param tableId - The ID of the table containing the row.
     * @param rowId - The ID of the row to delete.
     * @param params - Optional query parameters like 'send_webhook_events'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/delete_database_table_row
     */
    async delete(
      tableId: number,
      rowId: number,
      params?: DeleteRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<void> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      await this.client._request<void>(
        "DELETE",
        `/api/database/rows/table/${tableId}/${rowId}/`,
        queryParams, // Pass the potentially new object or undefined
        undefined,
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Moves a row within a table.
     * @param tableId - The ID of the table containing the row.
     * @param rowId - The ID of the row to move.
     * @param params - Query parameters specifying where to move the row ('before_id') and optionally 'user_field_names'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @returns The moved row with its potentially updated order.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/move_database_table_row
     */
    async move<TResponse extends BaserowRow = BaserowRow>(
      tableId: number,
      rowId: number,
      params?: MoveRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<TResponse> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      return this.client._request<TResponse>(
        "PATCH",
        `/api/database/rows/table/${tableId}/${rowId}/move/`,
        queryParams, // Pass the potentially new object or undefined
        {}, // Body is empty for move operation
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Creates multiple rows in a table in a single batch request.
     * @param tableId - The ID of the table to create rows in.
     * @param payload - An object containing an `items` array of row data objects.
     * @param params - Optional query parameters like 'before', 'send_webhook_events', 'user_field_names'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @returns An object containing an `items` array with the newly created rows.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/batch_create_database_table_rows
     */
    async batchCreate<
      TRequest = Record<string, any>,
      TResponse extends BaserowRow = BaserowRow
    >(
      tableId: number,
      payload: BatchCreateRowsPayload<TRequest>,
      params?: Omit<CreateRowParams, "before"> & { before?: number | null }, // before can be null for batch
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<{ items: TResponse[] }> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
      return this.client._request<{ items: TResponse[] }>(
        "POST",
        `/api/database/rows/table/${tableId}/batch/`,
        params,
        payload,
        headers
      );
    }
  
    /**
     * Updates multiple rows in a table in a single batch request.
     * @param tableId - The ID of the table containing the rows.
     * @param payload - An object containing an `items` array of row objects, each including its `id` and the fields to update.
     * @param params - Optional query parameters like 'send_webhook_events', 'user_field_names'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @returns An object containing an `items` array with the updated rows.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/batch_update_database_table_rows
     */
    async batchUpdate<
      TRequest extends { id: number } = { id: number } & Record<string, any>,
      TResponse extends BaserowRow = BaserowRow
    >(
      tableId: number,
      payload: BatchUpdateRowsPayload<Partial<TRequest> & { id: number }>, // Only need id and fields to update
      params?: UpdateRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<{ items: TResponse[] }> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      return this.client._request<{ items: TResponse[] }>(
        "PATCH",
        `/api/database/rows/table/${tableId}/batch/`,
        queryParams, // Pass the potentially new object or undefined
        payload,
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Deletes multiple rows from a table in a single batch request.
     * @param tableId - The ID of the table containing the rows.
     * @param rowIds - An array of row IDs to delete.
     * @param params - Optional query parameters like 'send_webhook_events'.
     * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/batch_delete_database_table_rows
     */
    async batchDelete(
      tableId: number,
      rowIds: number[],
      params?: DeleteRowParams,
      options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
    ): Promise<void> {
      const headers: Record<string, string> = {};
      if (options?.clientSessionId)
        headers["ClientSessionId"] = options.clientSessionId;
      if (options?.clientUndoRedoActionGroupId)
        headers["ClientUndoRedoActionGroupId"] =
          options.clientUndoRedoActionGroupId;
  
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      // Pass undefined for headers if the object is empty
      const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;
  
      const payload: BatchDeleteRowsPayload = { items: rowIds };
      await this.client._request<void>(
        "POST", // Note: The API uses POST for batch delete
        `/api/database/rows/table/${tableId}/batch-delete/`,
        queryParams, // Pass the potentially new object or undefined
        payload,
        finalHeaders // Pass the potentially empty object or undefined
      );
    }
  
    /**
     * Fetches the adjacent row (previous or next) to a given row within a table, optionally applying view filters/sorts.
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the reference row.
     * @param params - Optional parameters: 'previous' flag, 'view_id', 'search', 'user_field_names'.
     * @returns The adjacent row or null if no adjacent row exists matching the criteria.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/get_adjacent_database_table_row
     */
    async getAdjacent<TResponse extends BaserowRow = BaserowRow>(
      tableId: number,
      rowId: number,
      params?: GetAdjacentRowParams
    ): Promise<TResponse | null> {
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      try {
        // The API returns 204 No Content if no adjacent row is found
        const response = await this.client._request<TResponse | undefined>(
          "GET",
          `/api/database/rows/table/${tableId}/${rowId}/adjacent/`,
          queryParams
        );
        return response ?? null; // Convert undefined (from 204) to null
      } catch (error) {
        // Specifically handle 204 which might not be thrown as error by _request depending on its logic
        // However, our current _request throws for !response.ok, so 204 should be handled there.
        // If _request is modified later, this catch might need adjustment.
        if (error instanceof BaserowApiError && error.status === 204) {
          return null;
        }
        throw error; // Re-throw other errors
      }
    }
  
    /**
     * Fetches the change history for a specific row.
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the row.
     * @param params - Optional pagination parameters ('limit', 'offset').
     * @returns A paginated list of row history entries.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/get_database_table_row_history
     */
    async getHistory(
      tableId: number,
      rowId: number,
      params?: ListRowHistoryParams
    ): Promise<ListRowHistoryResponse> {
      // Use spread operator for query params if they exist
      const queryParams = params ? { ...params } : undefined;
      return this.client._request<ListRowHistoryResponse>(
        "GET",
        `/api/database/rows/table/${tableId}/${rowId}/history/`,
        queryParams
      );
    }
  
    /**
     * Fetches the primary field values (names) for specific rows across one or more tables.
     * @param params - An object where keys are `table__<id>` and values are comma-separated row IDs.
     * @returns An object mapping table IDs to row IDs to row names.
     * @throws {BaserowApiError} If the request fails.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/list_database_table_row_names
     */
    async listNames(params: ListRowNamesParams): Promise<ListRowNamesResponse> {
      // Query parameters are dynamic and structured, pass directly
      return this.client._request<ListRowNamesResponse>(
        "GET",
        `/api/database/rows/names/`,
        params as Record<string, string> // Cast needed due to dynamic keys
      );
    }
  
    // --- Row Comments ---
  
    /**
     * Lists comments for a specific row. (Premium feature)
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the row.
     * @param params - Optional pagination parameters.
     * @returns A paginated list of row comments.
     * @throws {BaserowApiError} If the request fails or feature is unavailable.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/get_row_comments
     */
    async listComments(
      tableId: number,
      rowId: number,
      params?: ListRowCommentsParams
    ): Promise<ListRowCommentsResponse> {
      const queryParams = params ? { ...params } : undefined;
      return this.client._request<ListRowCommentsResponse>(
        "GET",
        `/api/row_comments/${tableId}/${rowId}/`,
        queryParams
      );
    }
  
    /**
     * Creates a comment on a specific row. (Premium feature)
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the row to comment on.
     * @param payload - The comment content.
     * @returns The newly created comment.
     * @throws {BaserowApiError} If the request fails or feature is unavailable.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/create_row_comment
     */
    async createComment(
      tableId: number,
      rowId: number,
      payload: CreateRowCommentPayload
    ): Promise<RowComment> {
      return this.client._request<RowComment>(
        "POST",
        `/api/row_comments/${tableId}/${rowId}/`,
        undefined,
        payload
      );
    }
  
    /**
     * Updates an existing row comment. Only the author can update their comment. (Premium feature)
     * @param tableId - The ID of the table containing the comment's row.
     * @param commentId - The ID of the comment to update.
     * @param payload - The updated comment content.
     * @returns The updated comment.
     * @throws {BaserowApiError} If the request fails, feature is unavailable, or user is not the author.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/update_row_comment
     */
    async updateComment(
      tableId: number,
      commentId: number,
      payload: UpdateRowCommentPayload
    ): Promise<RowComment> {
      return this.client._request<RowComment>(
        "PATCH",
        `/api/row_comments/${tableId}/comment/${commentId}/`,
        undefined,
        payload
      );
    }
  
    /**
     * Deletes a row comment. Only the author can delete their comment. (Premium feature)
     * @param tableId - The ID of the table containing the comment's row.
     * @param commentId - The ID of the comment to delete.
     * @returns The deleted comment object (based on spec, confirm if it actually returns content or just 204).
     * @throws {BaserowApiError} If the request fails, feature is unavailable, or user is not the author.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/delete_row_comment
     */
    async deleteComment(tableId: number, commentId: number): Promise<RowComment> {
      // Spec shows 200 response with RowComment, but deletion often returns 204.
      // The client._request handles 204 correctly, but we type hint based on spec.
      return this.client._request<RowComment>(
        "DELETE",
        `/api/row_comments/${tableId}/comment/${commentId}/`
      );
    }
  
    /**
     * Updates the user's notification preferences for comments on a specific row. (Premium feature)
     * @param tableId - The ID of the table.
     * @param rowId - The ID of the row.
     * @param payload - The desired notification mode ('all' or 'mentions').
     * @throws {BaserowApiError} If the request fails or feature is unavailable.
     * @see https://api.baserow.io/api/redoc/#tag/Database-table-rows/operation/update_row_comment_notification_mode
     */
    async updateCommentNotificationMode(
      tableId: number,
      rowId: number,
      payload: UpdateRowCommentNotificationModePayload
    ): Promise<void> {
      await this.client._request<void>(
        "PUT",
        `/api/row_comments/${tableId}/${rowId}/notification-mode/`,
        undefined,
        payload
      );
    }
  }