/**
 * Base Service response interface for backend readiness
 */
export interface ServiceResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export class BaseService {
  protected static createSuccess<T>(data: T, message?: string): ServiceResponse<T> {
    return {
      success: true,
      data,
      message
    };
  }

  protected static createError<T>(message: string, error?: any): ServiceResponse<T> {
    return {
      success: false,
      message,
      error
    };
  }
}
