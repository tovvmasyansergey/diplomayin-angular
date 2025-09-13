export interface HttpResponse<T> {
  data: T;
  message: string;
  status: number;
  success: boolean;
}

export interface ErrorResponse {
  message: string;
  status: number;
  error: string;
  timestamp: string;
  path: string;
}

