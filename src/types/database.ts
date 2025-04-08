// database.ts
import type {
  PaginationParams,
  SearchParams,
  FilterGroup,
  FilterType,
} from "./common"; // Assuming common types are in this path

// --- General ---
export type BaserowJobState =
  | "pending"
  | "exporting" // Or other job-specific states like 'importing', 'duplicating', 'syncing'
  | "cancelled"
  | "finished"
  | "failed"
  | "expired";

export interface BaserowJob {
  id: number;
  type: string;
  progress_percentage: number;
  state: BaserowJobState;
  human_readable_error?: string;
}

// --- Database Table Types ---
export interface Table {
  id: number;
  name: string;
  order: number;
  database_id: number;
  data_sync?: DataSync | null;
}

// Schema used for listing, might differ slightly if needed
export type ListTablesResponse = Table[];

export interface TableCreate {
  name: string;
  data?: any[][]; // Array of arrays representing rows and columns
  first_row_header?: boolean;
}

export interface PatchedTableUpdate {
  name?: string;
}

export interface OrderTablesPayload {
  table_ids: number[];
}

// --- Table Import/Export ---
export interface TableImportConfiguration {
  upsert_fields?: number[] | null;
  upsert_values?: any[][] | null;
}

export interface TableImportPayload {
  data: any[][]; // Array of arrays representing rows and columns
  configuration?: TableImportConfiguration;
}

export interface FileImportJobResponse extends BaserowJob {
  database_id: number;
  name?: string; // Name of new table if creating
  table_id?: number; // ID of existing table if importing into
  first_row_header?: boolean;
  report: {
    failing_rows: Record<string, Record<string, string[]>>; // row_index -> { field_name -> [errors] }
  };
}

export interface DuplicateTableJobResponse extends BaserowJob {
  original_table: Table;
  duplicated_table: Table;
}

// Base interface for exporter options
interface BaseExportOptions {
  view_id?: number | null;
  export_charset?: ExportCharset;
  filters?: PublicViewFilters | null;
  order_by?: string | null;
  fields?: number[] | null;
}

export type ExportCharset =
  | "utf-8"
  | "iso-8859-6"
  | "windows-1256"
  | "iso-8859-4"
  | "windows-1257"
  | "iso-8859-14"
  | "iso-8859-2"
  | "windows-1250"
  | "gbk"
  | "gb18030"
  | "big5"
  | "koi8-r"
  | "koi8-u"
  | "iso-8859-5"
  | "windows-1251"
  | "x-mac-cyrillic"
  | "iso-8859-7"
  | "windows-1253"
  | "iso-8859-8"
  | "windows-1255"
  | "euc-jp"
  | "iso-2022-jp"
  | "shift-jis"
  | "euc-kr"
  | "macintosh"
  | "iso-8859-10"
  | "iso-8859-16"
  | "windows-874"
  | "windows-1254"
  | "windows-1258"
  | "iso-8859-1"
  | "windows-1252"
  | "iso-8859-3";

export type ExporterType = "csv" | "json" | "xml" | "excel" | "file";

export interface CsvExporterOptions extends BaseExportOptions {
  exporter_type: "csv";
  csv_column_separator?: "," | ";" | "|" | "tab" | "record_separator" | "unit_separator";
  csv_include_header?: boolean;
}

export interface ExcelExporterOptions extends BaseExportOptions {
  exporter_type: "excel";
  excel_include_header?: boolean;
}

export interface FileExporterOptions extends BaseExportOptions {
  exporter_type: "file";
  organize_files?: boolean;
}

export interface JsonExporterOptions extends BaseExportOptions {
  exporter_type: "json";
}
export interface XmlExporterOptions extends BaseExportOptions {
    exporter_type: "xml";
  }

export type ExportOptions =
  | CsvExporterOptions
  | ExcelExporterOptions
  | FileExporterOptions
  | JsonExporterOptions
  | XmlExporterOptions;


export interface ExportJob extends BaserowJob {
  table?: number | null;
  view?: number | null;
  exporter_type: string;
  exported_file_name?: string | null;
  created_at: string; // ISO DateTime
  url: string;
}

// --- Data Sync ---
export interface DataSyncSyncedProperty {
  field_id: number;
  key: string;
  unique_primary?: boolean;
}

export interface BaseDataSync {
  id: number;
  type: string; // Readonly
  synced_properties: DataSyncSyncedProperty[];
  last_sync?: string | null; // ISO DateTime
  last_error?: string | null;
}

// Specific DataSync types based on discriminator
export interface ICalCalendarDataSync extends BaseDataSync {
  type: "ical_calendar";
  ical_url: string;
}
export interface PostgreSQLDataSync extends BaseDataSync {
  type: "postgresql";
  postgresql_host: string;
  postgresql_username: string;
  postgresql_port?: number;
  postgresql_database: string;
  postgresql_schema?: string;
  postgresql_table: string;
  postgresql_sslmode?: string; // Consider enum if specific modes are known/needed
}
export interface LocalBaserowTableDataSync extends BaseDataSync {
  type: "local_baserow_table";
  source_table_id: number;
  source_table_view_id?: number | null;
}
export interface JiraIssuesDataSync extends BaseDataSync {
  type: "jira_issues";
  jira_url: string;
  jira_project_key?: string;
  jira_username: string;
}
export interface GitHubIssuesDataSync extends BaseDataSync {
  type: "github_issues";
  github_issues_owner: string;
  github_issues_repo: string;
}
export interface GitLabIssuesDataSync extends BaseDataSync {
  type: "gitlab_issues";
  gitlab_url?: string;
  gitlab_project_id: string;
}
export interface HubSpotContactsDataSync extends BaseDataSync {
  type: "hubspot_contacts";
  // No specific properties mentioned in spec snippet
}

// Union type for DataSync response
export type DataSync =
  | ICalCalendarDataSync
  | PostgreSQLDataSync
  | LocalBaserowTableDataSync
  | JiraIssuesDataSync
  | GitHubIssuesDataSync
  | GitLabIssuesDataSync
  | HubSpotContactsDataSync;


// Base interface for DataSync creation
interface BaseDataSyncCreate {
    synced_properties: string[];
    table_name: string;
  }

export interface ICalCalendarDataSyncCreate extends BaseDataSyncCreate {
    type: "ical_calendar";
    ical_url: string;
}
export interface PostgreSQLDataSyncCreate extends BaseDataSyncCreate {
    type: "postgresql";
    postgresql_host: string;
    postgresql_username: string;
    postgresql_port?: number;
    postgresql_database: string;
    postgresql_schema?: string;
    postgresql_table: string;
    postgresql_sslmode?: string; // Consider enum
}
export interface LocalBaserowTableDataSyncCreate extends BaseDataSyncCreate {
    type: "local_baserow_table";
    source_table_id: number;
    source_table_view_id?: number | null;
}
export interface JiraIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "jira_issues";
    jira_url: string;
    jira_project_key?: string;
    jira_username: string;
}
export interface GitHubIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "github_issues";
    github_issues_owner: string;
    github_issues_repo: string;
}
export interface GitLabIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "gitlab_issues";
    gitlab_url?: string;
    gitlab_project_id: string;
}
export interface HubSpotContactsDataSyncCreate extends BaseDataSyncCreate {
    type: "hubspot_contacts";
}

export type DataSyncCreatePayload =
  | ICalCalendarDataSyncCreate
  | PostgreSQLDataSyncCreate
  | LocalBaserowTableDataSyncCreate
  | JiraIssuesDataSyncCreate
  | GitHubIssuesDataSyncCreate
  | GitLabIssuesDataSyncCreate
  | HubSpotContactsDataSyncCreate;

// Base interface for DataSync update
interface BaseDataSyncUpdate {
    synced_properties?: string[];
}

export interface ICalCalendarDataSyncUpdate extends BaseDataSyncUpdate {
    ical_url?: string;
}
export interface PostgreSQLDataSyncUpdate extends BaseDataSyncUpdate {
    postgresql_host?: string;
    postgresql_username?: string;
    postgresql_port?: number;
    postgresql_database?: string;
    postgresql_schema?: string;
    postgresql_table?: string;
    postgresql_sslmode?: string; // Consider enum
}
export interface LocalBaserowTableDataSyncUpdate extends BaseDataSyncUpdate {
    source_table_id?: number;
    source_table_view_id?: number | null;
}
export interface JiraIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    jira_url?: string;
    jira_project_key?: string;
    jira_username?: string;
}
export interface GitHubIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    github_issues_owner?: string;
    github_issues_repo?: string;
}
export interface GitLabIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    gitlab_url?: string;
    gitlab_project_id?: string;
}
export interface HubSpotContactsDataSyncUpdate extends BaseDataSyncUpdate {
    // No specific properties
}

export type DataSyncUpdatePayload =
  | ICalCalendarDataSyncUpdate
  | PostgreSQLDataSyncUpdate
  | LocalBaserowTableDataSyncUpdate
  | JiraIssuesDataSyncUpdate
  | GitHubIssuesDataSyncUpdate
  | GitLabIssuesDataSyncUpdate
  | HubSpotContactsDataSyncUpdate;


export interface ListDataSyncProperty {
  unique_primary: boolean;
  key: string;
  name: string;
  field_type: string; // Readonly
  initially_selected: boolean;
}

export type ListDataSyncPropertiesResponse = ListDataSyncProperty[];

// Base interface for listing properties request
interface BaseListDataSyncPropertiesRequest {
    type: string; // Discriminator
}

export interface ICalCalendarListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "ical_calendar";
    ical_url: string;
}
export interface PostgreSQLListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "postgresql";
    postgresql_host: string;
    postgresql_username: string;
    postgresql_port?: number;
    postgresql_database: string;
    postgresql_schema?: string;
    postgresql_table: string;
    postgresql_sslmode?: string; // Consider enum
}
export interface LocalBaserowTableListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "local_baserow_table";
    source_table_id: number;
    source_table_view_id?: number | null;
}
export interface JiraIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "jira_issues";
    jira_url: string;
    jira_project_key?: string;
    jira_username: string;
}
export interface GitHubIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "github_issues";
    github_issues_owner: string;
    github_issues_repo: string;
}
export interface GitLabIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "gitlab_issues";
    gitlab_url?: string;
    gitlab_project_id: string;
}
export interface HubSpotContactsListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "hubspot_contacts";
}

export type ListDataSyncPropertiesRequest =
  | ICalCalendarListDataSyncPropertiesRequest
  | PostgreSQLListDataSyncPropertiesRequest
  | LocalBaserowTableListDataSyncPropertiesRequest
  | JiraIssuesListDataSyncPropertiesRequest
  | GitHubIssuesListDataSyncPropertiesRequest
  | GitLabIssuesListDataSyncPropertiesRequest
  | HubSpotContactsListDataSyncPropertiesRequest;

export interface SyncDataSyncTableJobResponse extends BaserowJob {
  data_sync: DataSync;
}

// --- Database Row Types (Copied/Merged from Original) ---

// Base structure, actual fields depend on the table
export interface BaserowRow {
  id: number;
  order: string; // Usually a decimal string
  [key: `field_${number}`]: any; // Standard field keys
  [key: string]: any; // For user_field_names=true
}

export interface RowMetadata {
  row_comment_count?: number;
  row_comments_notification_mode?: "all" | "mentions";
}

export interface BaserowRowWithMetadata extends BaserowRow {
  metadata?: RowMetadata;
}

export interface ListRowsParams extends PaginationParams, SearchParams {
  /** Comma-separated list of field IDs/names to include */
  include?: string;
  /** Comma-separated list of field IDs/names to exclude */
  exclude?: string;
  /** Comma-separated list of fields to order by (prepend '-' for descending) */
  order_by?: string;
  /** Apply filters and sorts from this view ID */
  view_id?: number;
  /** Use user field names instead of field_X keys */
  user_field_names?: boolean;
  /** Structured filter object */
  filters?: FilterGroup | null;
  /** How filters are combined if using filter__field__type params */
  filter_type?: FilterType;
  /** Dynamic filters using filter__field__type=value syntax */
  [filterKey: `filter__${string | number}__${string}`]:
    | string
    | number
    | boolean
    | null
    | undefined;
  /** Row lookups via link row fields */
  [lookupKey: string]: any; // More specific typing is complex, use RowLookup for better structure if possible
}

export interface ListRowsResponse<T extends BaserowRow = BaserowRow>
  extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateRowParams {
  /** If provided, the new row will be positioned before the row with this ID */
  before?: number;
  /** Whether to trigger webhooks */
  send_webhook_events?: boolean;
  /** Use user field names instead of field_X keys */
  user_field_names?: boolean;
}

export interface UpdateRowParams {
  /** Whether to trigger webhooks */
  send_webhook_events?: boolean;
  /** Use user field names instead of field_X keys */
  user_field_names?: boolean;
}

export interface DeleteRowParams {
  /** Whether to trigger webhooks */
  send_webhook_events?: boolean;
}

export interface MoveRowParams {
  /** ID of the row to move the current row before. If null/undefined, move to the end. */
  before_id?: number | null;
  /** Use user field names instead of field_X keys */
  user_field_names?: boolean;
}

export interface BatchCreateRowsPayload<T = Record<string, any>> {
  items: T[];
}

export interface BatchUpdateRowsPayload<T extends { id: number }> {
  items: T[];
}

export interface BatchDeleteRowsPayload {
  items: number[]; // Array of row IDs
}

export interface GetAdjacentRowParams extends SearchParams {
  previous?: boolean;
  view_id?: number;
  user_field_names?: boolean;
}

export interface RowHistoryEntry {
  id: number;
  action_type: string;
  user: { id: number; name: string };
  timestamp: string; // ISO DateTime
  before: Record<string, any>; // Field ID -> Value
  after: Record<string, any>; // Field ID -> Value
  fields_metadata: Record<string, any>; // Define more strictly if needed
}

export interface ListRowHistoryParams extends PaginationParams {
  // No additional specific params mentioned in spec snippet
}

export interface ListRowHistoryResponse extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: RowHistoryEntry[];
}

// For listNames, the query param is dynamic like `table__<id>=rowId1,rowId2`
export interface ListRowNamesParams {
  [tableParam: `table__${number}`]: string; // Comma-separated row IDs
}

// Response type is nested objects: { [tableId: string]: { [rowId: string]: string } }
export interface ListRowNamesResponse {
  [tableId: string]: {
    [rowId: string]: string;
  };
}

// Row Comments (Copied/Merged from Original)
export interface RowComment {
  id: number;
  user_id: number | null;
  first_name?: string; // Optional in case user is deleted? Check API behavior
  table_id: number;
  row_id: number;
  message: any; // Rich text structure, define more strictly if needed
  created_on: string; // ISO DateTime
  updated_on: string; // ISO DateTime
  edited: boolean;
  trashed: boolean;
}

export interface ListRowCommentsParams extends PaginationParams {
  // No additional specific params mentioned in spec snippet
}

export interface ListRowCommentsResponse extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: RowComment[];
}

export interface CreateRowCommentPayload {
  message: any; // Rich text structure
}

export interface UpdateRowCommentPayload {
  message?: any; // Rich text structure
  // Other fields if editable, spec implies only message but PATCH usually allows partial
}

export interface UpdateRowCommentNotificationModePayload {
  mode: 'all' | 'mentions';
}

// --- Other Utility Types (if needed from spec) ---

export interface PublicViewFilters {
  filter_type: 'AND' | 'OR';
  filters?: PublicViewFilter[];
  // groups?: PublicViewFilterGroup[]; // Add if groups structure is needed for exports/filters
}

export interface PublicViewFilter {
  field: number;
  type: string; // Consider enum if all filter types are consistently available
  value: string;
}

// --- Database Fields Types ---
export interface BaseField {
  id: number;
  table_id: number;
  name: string;
  order: number;
  type: string;
  primary: boolean;
  read_only: boolean;
  immutable_type: boolean | null;
  immutable_properties: boolean | null;
  description: string | null;
}

// Union type for all field types
export type Field = BaseField & {
  // Field-specific properties would be added here in a real implementation
  // For simplicity, we're using a generic type that can hold any properties
  [key: string]: any;
};

export interface FieldCreateRequest {
  name: string;
  type: string;
  // Type-specific properties would be defined here
  [key: string]: any;
}

export interface FieldUpdateRequest {
  name?: string;
  // Other updatable properties would be defined here
  [key: string]: any;
}

export interface RelatedFields {
  related_fields: Field[];
}

export interface UniqueRowValues {
  values: string[];
}

export interface UniqueRowValuesParams {
  limit?: number;
  split_comma_separated?: boolean;
}

export interface DuplicateFieldJobResponse extends BaserowJob {
  original_field: Field;
  duplicated_field: Field & RelatedFields;
}

export interface DuplicateFieldParams {
  duplicate_data?: boolean;
  clientSessionId?: string;
  clientUndoRedoActionGroupId?: string;
}

export interface GenerateAIFieldValuesRequest {
  row_ids: number[];
}