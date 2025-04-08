// database-table-operations.ts
import type {
  Table,
  ListTablesResponse,
  TableCreate,
  PatchedTableUpdate,
  OrderTablesPayload,
  TableImportPayload,
  FileImportJobResponse,
  DuplicateTableJobResponse,
  ExportOptions,
  ExportJob,
  DataSync,
  DataSyncCreatePayload,
  DataSyncUpdatePayload,
  ListDataSyncProperty,
  ListDataSyncPropertiesResponse,
  ListDataSyncPropertiesRequest,
  SyncDataSyncTableJobResponse,
} from "../types/database"; // Adjust path as needed
import type { BaserowClient } from "./baserow-client";

export class DatabaseTableOperations {
  constructor(private client: BaserowClient) {}

  /**
   * Lists all tables in a database.
   * @param databaseId - The ID of the database to list tables from.
   * @returns A list of tables.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/list_database_tables
   */
  async list(databaseId: number): Promise<ListTablesResponse> {
    return this.client._request<ListTablesResponse>(
      "GET",
      `/api/database/tables/database/${databaseId}/`
    );
  }

  /**
   * Creates a new table synchronously within a database. Optionally initializes with data.
   * @param databaseId - The ID of the database to create the table in.
   * @param payload - The table creation details, including name and optional initial data.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The newly created table.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/create_database_table
   */
  async create(
    databaseId: number,
    payload: TableCreate,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Table> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<Table>(
      "POST",
      `/api/database/tables/database/${databaseId}/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Creates a job to asynchronously create a new table within a database. Optionally initializes with data.
   * @param databaseId - The ID of the database to create the table in.
   * @param payload - The table creation details, including name and optional initial data.
   * @param options - Optional request parameters like ClientSessionId.
   * @returns The job details for tracking the asynchronous creation.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/create_database_table_async
   */
  async createAsync(
    databaseId: number,
    payload: TableCreate,
    options?: { clientSessionId?: string } // Only ClientSessionId mentioned in spec
  ): Promise<FileImportJobResponse> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<FileImportJobResponse>(
      "POST",
      `/api/database/tables/database/${databaseId}/async/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Fetches a specific table by its ID.
   * @param tableId - The ID of the table to fetch.
   * @returns The requested table.
   * @throws {BaserowApiError} If the request fails or the table doesn't exist.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/get_database_table
   */
  async get(tableId: number): Promise<Table> {
    return this.client._request<Table>(
      "GET",
      `/api/database/tables/${tableId}/`
    );
  }

  /**
   * Updates an existing table. Currently, only the name can be updated.
   * @param tableId - The ID of the table to update.
   * @param payload - The updated table details (e.g., { name: 'New Name' }).
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The updated table.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/update_database_table
   */
  async update(
    tableId: number,
    payload: PatchedTableUpdate,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Table> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<Table>(
      "PATCH",
      `/api/database/tables/${tableId}/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Deletes a table.
   * @param tableId - The ID of the table to delete.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/delete_database_table
   */
  async delete(
    tableId: number,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    await this.client._request<void>(
      "DELETE",
      `/api/database/tables/${tableId}/`,
      undefined,
      undefined,
      finalHeaders
    );
  }

  /**
   * Starts a job to duplicate a table asynchronously.
   * @param tableId - The ID of the table to duplicate.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The job details for tracking the duplication process.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/duplicate_database_table_async
   */
  async duplicateAsync(
    tableId: number,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<DuplicateTableJobResponse> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<DuplicateTableJobResponse>(
      "POST",
      `/api/database/tables/${tableId}/duplicate/async/`,
      undefined,
      {}, // No body needed for duplicate
      finalHeaders
    );
  }

  /**
   * Changes the order of tables within a database.
   * @param databaseId - The ID of the database containing the tables.
   * @param payload - An object containing the `table_ids` array in the desired order.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/order_database_tables
   */
  async order(
    databaseId: number,
    payload: OrderTablesPayload,
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<void> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    await this.client._request<void>(
      "POST",
      `/api/database/tables/database/${databaseId}/order/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Starts a job to import data into an existing table asynchronously.
   * @param tableId - The ID of the table to import data into.
   * @param payload - The data and optional configuration for the import.
   * @returns The job details for tracking the import process.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/import_data_database_table_async
   */
  async importDataAsync(
    tableId: number,
    payload: TableImportPayload
  ): Promise<FileImportJobResponse> {
    // Note: No specific headers mentioned for this endpoint in the provided spec snippet
    return this.client._request<FileImportJobResponse>(
      "POST",
      `/api/database/tables/${tableId}/import/async/`,
      undefined,
      payload
    );
  }

  // --- Data Sync Operations ---

  /**
   * Retrieves a specific data sync configuration.
   * @param dataSyncId - The ID of the data sync configuration.
   * @returns The data sync configuration details.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/get_table_data_sync
   */
  async getDataSync(dataSyncId: number): Promise<DataSync> {
    return this.client._request<DataSync>(
      "GET",
      `/api/database/data-sync/${dataSyncId}/`
    );
  }

  /**
   * Updates a data sync configuration.
   * @param dataSyncId - The ID of the data sync configuration to update.
   * @param payload - The partial data sync configuration with updated values.
   * @returns The updated data sync configuration.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/update_table_data_sync
   */
  async updateDataSync(
    dataSyncId: number,
    payload: DataSyncUpdatePayload // Using the discriminated union type
  ): Promise<DataSync> {
    // Note: No specific headers mentioned for this endpoint in the provided spec snippet
    return this.client._request<DataSync>(
      "PATCH",
      `/api/database/data-sync/${dataSyncId}/`,
      undefined,
      payload
    );
  }

  /**
   * Lists the available properties (potential fields) for a specific data sync configuration.
   * @param dataSyncId - The ID of the data sync configuration.
   * @param options - Optional request parameters like ClientSessionId.
   * @returns A list of available properties.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/get_table_data_sync_properties
   */
  async listDataSyncProperties(
    dataSyncId: number,
    options?: { clientSessionId?: string } // Only ClientSessionId mentioned
  ): Promise<ListDataSyncPropertiesResponse> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<ListDataSyncPropertiesResponse>(
      "GET",
      `/api/database/data-sync/${dataSyncId}/properties/`,
      undefined,
      undefined,
      finalHeaders
    );
  }

  /**
   * Starts an asynchronous job to sync data for a specific data sync configuration.
   * @param dataSyncId - The ID of the data sync configuration to sync.
   * @returns The job details for tracking the sync process.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/sync_data_sync_table_async
   */
  async syncDataSyncAsync(
    dataSyncId: number
  ): Promise<SyncDataSyncTableJobResponse> {
    // Note: No specific headers mentioned for this endpoint in the provided spec snippet
    return this.client._request<SyncDataSyncTableJobResponse>(
      "POST",
      `/api/database/data-sync/${dataSyncId}/sync/async/`
    );
  }

  /**
   * Creates a new table that is synchronized with an external data source.
   * @param databaseId - The ID of the database to create the data sync table in.
   * @param payload - The configuration for the data sync source.
   * @param options - Optional request parameters like ClientSessionId or ClientUndoRedoActionGroupId.
   * @returns The newly created table.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/create_database_data_sync_table
   */
  async createDataSyncTable(
    databaseId: number,
    payload: DataSyncCreatePayload, // Using the discriminated union type
    options?: { clientSessionId?: string; clientUndoRedoActionGroupId?: string }
  ): Promise<Table> {
    const headers: Record<string, string> = {};
    if (options?.clientSessionId)
      headers["ClientSessionId"] = options.clientSessionId;
    if (options?.clientUndoRedoActionGroupId)
      headers["ClientUndoRedoActionGroupId"] =
        options.clientUndoRedoActionGroupId;
    const finalHeaders = Object.keys(headers).length > 0 ? headers : undefined;

    return this.client._request<Table>(
      "POST",
      `/api/database/data-sync/database/${databaseId}/`,
      undefined,
      payload,
      finalHeaders
    );
  }

  /**
   * Fetches the potential properties (fields) for a given data sync type configuration *before* creating the data sync table.
   * @param payload - The configuration details of the potential data sync source.
   * @returns A list of available properties.
   * @throws {BaserowApiError} If the request fails or the configuration is invalid.
   * @see https://api.baserow.io/api/redoc/#tag/Database-tables/operation/get_table_data_sync_type_properties
   */
  async getDataSyncTypeProperties(
    payload: ListDataSyncPropertiesRequest // Using the discriminated union type
  ): Promise<ListDataSyncPropertiesResponse> {
    // Note: No specific headers mentioned for this endpoint in the provided spec snippet
    return this.client._request<ListDataSyncPropertiesResponse>(
      "POST",
      `/api/database/data-sync/properties/`,
      undefined,
      payload
    );
  }

  // --- Export Operations --- (Belongs more logically with Tables)

  /**
   * Retrieves the status and details of a specific export job.
   * @param jobId - The ID of the export job.
   * @returns The export job details.
   * @throws {BaserowApiError} If the request fails or the job doesn't exist.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-export/operation/get_export_job
   */
  async getExportJob(jobId: number): Promise<ExportJob> {
    return this.client._request<ExportJob>(
      "GET",
      `/api/database/export/${jobId}/`
    );
  }

  /**
   * Creates and starts a new export job for a specific table.
   * @param tableId - The ID of the table to export.
   * @param payload - The export options, including type and format-specific settings.
   * @returns The details of the newly created export job.
   * @throws {BaserowApiError} If the request fails.
   * @see https://api.baserow.io/api/redoc/#tag/Database-table-export/operation/export_table
   */
  async exportTable(
    tableId: number,
    payload: ExportOptions // Using the discriminated union type
  ): Promise<ExportJob> {
    // Note: No specific headers mentioned for this endpoint in the provided spec snippet
    return this.client._request<ExportJob>(
      "POST",
      `/api/database/export/table/${tableId}/`,
      undefined,
      payload
    );
  }
}