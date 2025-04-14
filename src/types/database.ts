// database.ts
import type {
  PaginationParams,
  SearchParams,
  FilterGroup,
  FilterType,
  Filter,
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
  progressPercentage: number;
  state: BaserowJobState;
  humanReadableError?: string;
}

// --- Database Table Types ---
export interface Table {
  id: number;
  name: string;
  order: number;
  database_id: number;
  dataSync?: DataSync | null;
}

// Schema used for listing, might differ slightly if needed
export type ListTablesResponse = Table[];

export interface TableCreate {
  name: string;
  data?: any[][]; // Array of arrays representing rows and columns
  firstRowHeader?: boolean;
}

export interface PatchedTableUpdate {
  name?: string;
}

export interface OrderTablesPayload {
  tableIds: number[];
}

// --- Table Import/Export ---
export interface TableImportConfiguration {
  upsertFields?: number[] | null;
  upsertValues?: any[][] | null;
}

export interface TableImportPayload {
  data: any[][]; // Array of arrays representing rows and columns
  configuration?: TableImportConfiguration;
}

export interface FileImportJobResponse extends BaserowJob {
  databaseId: number;
  name?: string; // Name of new table if creating
  tableId?: number; // ID of existing table if importing into
  firstRowHeader?: boolean;
  report: {
    failingRows: Record<string, Record<string, string[]>>; // rowIndex -> { fieldName -> [errors] }
  };
}

export interface DuplicateTableJobResponse extends BaserowJob {
  originalTable: Table;
  duplicatedTable: Table;
}

// Base interface for exporter options
interface BaseExportOptions {
  viewId?: number | null;
  exportCharset?: ExportCharset;
  filters?: PublicViewFilters | null;
  orderBy?: string | null;
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
  exporterType: "csv";
  csvColumnSeparator?: "," | ";" | "|" | "tab" | "recordSeparator" | "unitSeparator";
  csvIncludeHeader?: boolean;
}

export interface ExcelExporterOptions extends BaseExportOptions {
  exporterType: "excel";
  excelIncludeHeader?: boolean;
}

export interface FileExporterOptions extends BaseExportOptions {
  exporterType: "file";
  organizeFiles?: boolean;
}

export interface JsonExporterOptions extends BaseExportOptions {
  exporterType: "json";
}
export interface XmlExporterOptions extends BaseExportOptions {
    exporterType: "xml";
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
  exporterType: string;
  exportedFileName?: string | null;
  createdAt: string; // ISO DateTime
  url: string;
}

// --- Data Sync ---
export interface DataSyncSyncedProperty {
  fieldId: number;
  key: string;
  uniquePrimary?: boolean;
}

export interface BaseDataSync {
  id: number;
  type: string; // Readonly
  syncedProperties: DataSyncSyncedProperty[];
  lastSync?: string | null; // ISO DateTime
  lastError?: string | null;
}

// Specific DataSync types based on discriminator
export interface ICalCalendarDataSync extends BaseDataSync {
  type: "ical_calendar";
  icalUrl: string;
}
export interface PostgreSQLDataSync extends BaseDataSync {
  type: "postgresql";
  postgresqlHost: string;
  postgresqlUsername: string;
  postgresqlPort?: number;
  postgresqlDatabase: string;
  postgresqlSchema?: string;
  postgresqlTable: string;
  postgresqlSslmode?: string; // Consider enum if specific modes are known/needed
}
export interface LocalBaserowTableDataSync extends BaseDataSync {
  type: "local_baserow_table";
  sourceTableId: number;
  sourceTableViewId?: number | null;
}
export interface JiraIssuesDataSync extends BaseDataSync {
  type: "jira_issues";
  jiraUrl: string;
  jiraProjectKey?: string;
  jiraUsername: string;
}
export interface GitHubIssuesDataSync extends BaseDataSync {
  type: "github_issues";
  githubIssuesOwner: string;
  githubIssuesRepo: string;
}
export interface GitLabIssuesDataSync extends BaseDataSync {
  type: "gitlab_issues";
  gitlabUrl?: string;
  gitlabProjectId: string;
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
    syncedProperties: string[];
    tableName: string;
  }

export interface ICalCalendarDataSyncCreate extends BaseDataSyncCreate {
    type: "ical_calendar";
    icalUrl: string;
}
export interface PostgreSQLDataSyncCreate extends BaseDataSyncCreate {
    type: "postgresql";
    postgresqlHost: string;
    postgresqlUsername: string;
    postgresqlPort?: number;
    postgresqlDatabase: string;
    postgresqlSchema?: string;
    postgresqlTable: string;
    postgresqlSslmode?: string; // Consider enum
}
export interface LocalBaserowTableDataSyncCreate extends BaseDataSyncCreate {
    type: "local_baserow_table";
    sourceTableId: number;
    sourceTableViewId?: number | null;
}
export interface JiraIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "jira_issues";
    jiraUrl: string;
    jiraProjectKey?: string;
    jiraUsername: string;
}
export interface GitHubIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "github_issues";
    githubIssuesOwner: string;
    githubIssuesRepo: string;
}
export interface GitLabIssuesDataSyncCreate extends BaseDataSyncCreate {
    type: "gitlab_issues";
    gitlabUrl?: string;
    gitlabProjectId: string;
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
    syncedProperties?: string[];
}

export interface ICalCalendarDataSyncUpdate extends BaseDataSyncUpdate {
    icalUrl?: string;
}
export interface PostgreSQLDataSyncUpdate extends BaseDataSyncUpdate {
    postgresqlHost?: string;
    postgresqlUsername?: string;
    postgresqlPort?: number;
    postgresqlDatabase?: string;
    postgresqlSchema?: string;
    postgresqlTable?: string;
    postgresqlSslmode?: string; // Consider enum
}
export interface LocalBaserowTableDataSyncUpdate extends BaseDataSyncUpdate {
    sourceTableId?: number;
    sourceTableViewId?: number | null;
}
export interface JiraIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    jiraUrl?: string;
    jiraProjectKey?: string;
    jiraUsername?: string;
}
export interface GitHubIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    githubIssuesOwner?: string;
    githubIssuesRepo?: string;
}
export interface GitLabIssuesDataSyncUpdate extends BaseDataSyncUpdate {
    gitlabUrl?: string;
    gitlabProjectId?: string;
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
  uniquePrimary: boolean;
  key: string;
  name: string;
  fieldType: string; // Readonly
  initiallySelected: boolean;
}

export type ListDataSyncPropertiesResponse = ListDataSyncProperty[];

// Base interface for listing properties request
interface BaseListDataSyncPropertiesRequest {
    type: string; // Discriminator
}

export interface ICalCalendarListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "ical_calendar";
    icalUrl: string;
}
export interface PostgreSQLListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "postgresql";
    postgresqlHost: string;
    postgresqlUsername: string;
    postgresqlPort?: number;
    postgresqlDatabase: string;
    postgresqlSchema?: string;
    postgresqlTable: string;
    postgresqlSslmode?: string; // Consider enum
}
export interface LocalBaserowTableListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "local_baserow_table";
    sourceTableId: number;
    sourceTableViewId?: number | null;
}
export interface JiraIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "jira_issues";
    jiraUrl: string;
    jiraProjectKey?: string;
    jiraUsername: string;
}
export interface GitHubIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "github_issues";
    githubIssuesOwner: string;
    githubIssuesRepo: string;
}
export interface GitLabIssuesListDataSyncPropertiesRequest extends BaseListDataSyncPropertiesRequest {
    type: "gitlab_issues";
    gitlabUrl?: string;
    gitlabProjectId: string;
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
  dataSync: DataSync;
}

// --- Database Row Types (Copied/Merged from Original) ---

// Base structure, actual fields depend on the table
export interface BaserowRow {
  id: number;
  order: string; // Usually a decimal string
  [key: string]: any; // For userFieldNames=true
}

export interface RowMetadata {
  rowCommentCount?: number;
  rowCommentsNotificationMode?: "all" | "mentions";
}

export interface BaserowRowWithMetadata extends BaserowRow {
  metadata?: RowMetadata;
}

export interface ListRowsParams {
  page?: number;
  size?: number;
  search?: string;
  viewId?: number | null;
  filters?: Filter[];
  filterType?: FilterType;
  [key: `filter__${number}`]: string;
  orderBy?: string;
  includeFields?: string;
  exclude?: string;
  sourceTableViewId?: number | null;
}

export interface ListRowsResponse<T extends BaserowRow = BaserowRow>
  extends PaginationParams {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface CreateRowParams {
  before?: number;
  sendWebhookEvents?: boolean;
  userFieldNames?: boolean;
}

export interface UpdateRowParams {
  sendWebhookEvents?: boolean;
  userFieldNames?: boolean;
}

export interface DeleteRowParams {
  sendWebhookEvents?: boolean;
}

export interface MoveRowParams {
  beforeId?: number | null;
  userFieldNames?: boolean;
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

export interface GetAdjacentRowParams {
  viewId?: number;
  search?: string;
  userFieldNames?: boolean;
}

export interface RowHistoryEntry {
  id: number;
  actionType: string;
  user: { id: number; name: string };
  timestamp: string; // ISO DateTime
  before: Record<string, any>; // Field ID -> Value
  after: Record<string, any>; // Field ID -> Value
  fieldsMetadata: Record<string, any>; // Define more strictly if needed
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
  userId: number | null;
  firstName?: string; // Optional in case user is deleted? Check API behavior
  tableId: number;
  rowId: number;
  message: any; // Rich text structure, define more strictly if needed
  createdOn: string; // ISO DateTime
  updatedOn: string; // ISO DateTime
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
  filterType: 'AND' | 'OR';
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
  tableId: number;
  name: string;
  order: number;
  type: string;
  primary: boolean;
  readOnly: boolean;
  immutableType: boolean | null;
  immutableProperties: boolean | null;
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
  relatedFields: Field[];
}

export interface UniqueRowValues {
  values: string[];
}

export interface UniqueRowValuesParams {
  limit?: number;
  splitCommaSeparated?: boolean;
}

export interface DuplicateFieldJobResponse extends BaserowJob {
  originalField: Field;
  duplicatedField: Field & RelatedFields;
}

export interface DuplicateFieldParams {
  duplicateData?: boolean;
  clientSessionId?: string;
  clientUndoRedoActionGroupId?: string;
}

export interface GenerateAIFieldValuesRequest {
  rowIds: number[];
}