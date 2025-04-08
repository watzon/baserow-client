import { BaserowClient } from "./baserow-client";
import type {
  Field,
  FieldCreateRequest, 
  FieldUpdateRequest,
  RelatedFields,
  UniqueRowValues,
  UniqueRowValuesParams,
  DuplicateFieldJobResponse,
  DuplicateFieldParams,
  GenerateAIFieldValuesRequest
} from "../types/database";

/**
 * Operations for managing Baserow database fields.
 */
export class DatabaseFieldOperations {
  constructor(private client: BaserowClient) {}
  
  /**
   * Retrieves a specific field by its ID.
   * @param fieldId - The ID of the field to retrieve.
   * @returns The field object.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/get_database_table_field
   */
  async get(fieldId: number): Promise<Field> {
    return this.client._request<Field>(
      "GET",
      `/api/database/fields/${fieldId}/`
    );
  }

  /**
   * Lists all fields in a specific table.
   * @param tableId - The ID of the table to list fields from.
   * @returns An array of field objects.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/list_database_table_fields
   */
  async list(tableId: number): Promise<Field[]> {
    return this.client._request<Field[]>(
      "GET",
      `/api/database/fields/table/${tableId}/`
    );
  }

  /**
   * Creates a new field in a table.
   * @param tableId - The ID of the table to create the field in.
   * @param payload - The field creation details.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The newly created field.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/create_database_table_field
   */
  async create(
    tableId: number,
    payload: FieldCreateRequest,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Field> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<Field>(
      "POST",
      `/api/database/fields/table/${tableId}/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Updates an existing field.
   * @param fieldId - The ID of the field to update.
   * @param payload - The field update details.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The updated field.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/update_database_table_field
   */
  async update(
    fieldId: number,
    payload: FieldUpdateRequest,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Field> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<Field>(
      "PATCH",
      `/api/database/fields/${fieldId}/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Deletes a field.
   * @param fieldId - The ID of the field to delete.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns Related fields that changed as a result of this operation.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/delete_database_table_field
   */
  async delete(
    fieldId: number,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<RelatedFields> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<RelatedFields>(
      "DELETE",
      `/api/database/fields/${fieldId}/`,
      undefined,
      undefined,
      finalHeaders
    );
  }

  /**
   * Retrieves unique row values for a specific field.
   * @param fieldId - The ID of the field to get unique values from.
   * @param params - Optional parameters like limit and whether to split comma-separated values.
   * @returns An object containing an array of unique values.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/get_database_field_unique_row_values
   */
  async getUniqueRowValues(
    fieldId: number,
    params?: UniqueRowValuesParams
  ): Promise<UniqueRowValues> {
    return this.client._request<UniqueRowValues>(
      "GET",
      `/api/database/fields/${fieldId}/unique_row_values/`,
      params as Record<string, string | number | boolean | string[] | null | undefined>
    );
  }

  /**
   * Starts a job to duplicate a field asynchronously.
   * @param fieldId - The ID of the field to duplicate.
   * @param params - Optional parameters for the duplication process.
   * @returns The job details for tracking the duplication process.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/duplicate_table_field
   */
  async duplicateAsync(
    fieldId: number,
    params?: DuplicateFieldParams
  ): Promise<DuplicateFieldJobResponse> {
    const headers: Record<string, string> = {};
    if (params?.clientSessionId)
      headers["ClientSessionId"] = params.clientSessionId;
    if (params?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        params.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<DuplicateFieldJobResponse>(
      "POST",
      `/api/database/fields/${fieldId}/duplicate/async/`,
      undefined,
      { duplicate_data: params?.duplicate_data || false },
      finalHeaders
    );
  }

  /**
   * Generates AI field values for specified rows using a configured AI field.
   * This is a premium feature.
   * @param fieldId - The ID of the AI field to generate values for.
   * @param payload - The request payload containing row IDs.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns A string response (job ID or confirmation).
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-fields/operation/generate_table_ai_field_value
   */
  async generateAIFieldValues(
    fieldId: number,
    payload: GenerateAIFieldValuesRequest,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<string> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<string>(
      "POST",
      `/api/database/fields/${fieldId}/generate-ai-field-values/`,
      undefined,
      payload,
      finalHeaders
    );
  }
} 