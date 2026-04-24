// Common/shared types for the Agrolink platform

export type ID = string | number;

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
