// Common shared types across the application

export type ID = string;

export type Timestamp = string; // ISO 8601

export type Status = "active" | "inactive";

export type SortOrder = "asc" | "desc";

export interface FilterParams {
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

export interface Timestamps {
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface SelectOption<T = string> {
  label: string;
  value: T;
}

export interface TableColumn<T = Record<string, unknown>> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (row: T) => React.ReactNode;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface BulkAction {
  label: string;
  action: (ids: string[]) => void;
  variant?: "primary" | "danger";
  requireConfirm?: boolean;
}
