// Common/shared types for the Agrolink platform

export type ID = string | number;

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
}
