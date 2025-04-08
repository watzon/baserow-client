/** Represents the possible Baserow permissions */
export type BaserowPermission =
  | "ADMIN"
  | "MEMBER"
  | "VIEWER"
  | "NO ACCESS"
  | "NO ROLE"; // Used for role assignments

/** Represents different filter conjunctions */
export type FilterType = "AND" | "OR";

/** Represents different sort directions */
export type SortDirection = "ASC" | "DESC";

/** Basic structure for a filter */
export interface Filter {
  field: string | number; // Field ID or name (if user_field_names is true)
  type: string; // Filter type (e.g., 'equal', 'contains', etc.)
  value: string | number | boolean | null | string[] | number[];
}

/** Structure for nested filters */
export interface FilterGroup {
  filter_type: FilterType;
  filters: (Filter | FilterGroup)[];
}

/** Basic structure for sorting */
export interface Sort {
  field: string | number; // Field ID or name (if user_field_names is true)
  order: SortDirection;
}

/** Structure for row lookup via link row fields */
export interface RowLookup {
  [linkRowFieldIdentifier: `link_row_field__${string | number}__join`]: string; // Comma-separated target field names/ids
}

/** Common pagination parameters */
export interface PaginationParams {
  page?: number;
  size?: number;
}

/** Common search parameters */
export interface SearchParams {
  search?: string;
  search_mode?: "SearchModes.MODE_FT_WITH_COUNT" | "SearchModes.MODE_COMPAT";
} 