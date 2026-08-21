import { getStoredToken } from '../utils/storage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';
const API_PREFIX = '/api/v1';
const REQUEST_TIMEOUT = 15000;

export class ApiClient {
  private static getAuthHeaders(): Record<string, string> {
    const token = getStoredToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private static async withTimeout<T>(promise: Promise<T>, ms = REQUEST_TIMEOUT): Promise<T> {
    const timeout = new Promise<never>((_, reject) => {
      const id = setTimeout(() => {
        clearTimeout(id);
        reject(new Error(`Request timeout after ${ms}ms`));
      }, ms);
    });
    return Promise.race([promise, timeout]);
  }

  private static async handleResponse<T>(response: Response): Promise<T> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;

      if (isJson) {
        try {
          const errorBody = await response.json();
          errorMessage = errorBody?.error || errorBody?.message || errorMessage;
        } catch {
          // keep default error message if JSON parsing fails
        }
      } else {
        const text = await response.text();
        if (text) errorMessage = text;
      }

      throw new Error(errorMessage);
    }

    if (isJson) {
      return response.json() as Promise<T>;
    }

    return undefined as T;
  }

  private static buildUrl(path: string, isPublic = false): string {
    const base = API_BASE_URL.replace(/\/$/, '');
    const prefix = isPublic ? '' : API_PREFIX;
    return `${base}${prefix}${path}`;
  }

  private static async request<T>(
    method: string,
    path: string,
    body?: any,
    isPublic = false
  ): Promise<T> {
    const url = this.buildUrl(path, isPublic);

    const fetchPromise = fetch(url, {
      method,
      headers: this.getAuthHeaders(),
      body: body ? JSON.stringify(body) : undefined,
    });

    const response = await this.withTimeout(fetchPromise);
    return this.handleResponse<T>(response);
  }

  static async get<T>(path: string): Promise<T> {
    return this.request<T>('GET', path);
  }

  static async post<T>(path: string, body?: any, isPublic = false): Promise<T> {
    return this.request<T>('POST', path, body, isPublic);
  }

  static async put<T>(path: string, body?: any): Promise<T> {
    return this.request<T>('PUT', path, body);
  }

  static async patch<T>(path: string, body?: any): Promise<T> {
    return this.request<T>('PATCH', path, body);
  }

  static async delete<T>(path: string): Promise<T> {
    return this.request<T>('DELETE', path);
  }
}
