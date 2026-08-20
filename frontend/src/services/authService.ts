import { BaseService, ServiceResponse } from './baseService';
import { UserSession } from '../types';
import { saveUserSession, clearUserSession, getStoredToken } from '../utils/storage';

interface LoginRequest {
  nipOrEmail: string;
  password: string;
}

interface LoginResponseData {
  token: string;
  user: {
    id: string;
    nip: string;
    name: string;
    title: string;
    role: string;
    email: string;
    avatar?: string;
  };
}

export class AuthService extends BaseService {
  public static async login(nipOrEmail: string, password: string): Promise<ServiceResponse<UserSession>> {
    try {
      const response = await this.apiClient.post<{ success: boolean; data: LoginResponseData }>('/auth/login', {
        nipOrEmail,
        password,
      }, true);

      if (!response.success || !response.data) {
        return this.createError('Login failed');
      }

      const { token, user } = response.data;
      const userSession: UserSession = {
        id: user.id,
        nip: user.nip,
        name: user.name,
        title: user.title,
        role: user.role,
        email: user.email,
        avatar: user.avatar,
        token,
        loginTime: new Date().toISOString(),
      };

      saveUserSession(userSession);

      return this.createSuccess(userSession, 'Login berhasil');
    } catch (err: any) {
      return this.createError(err.message || 'Gagal masuk. Periksa NIP/Email dan kata sandi Anda.', err);
    }
  }

  public static async logout(): Promise<ServiceResponse<void>> {
    try {
      clearUserSession();
      return this.createSuccess(undefined, 'Logout berhasil');
    } catch (err) {
      return this.createError('Gagal logout', err);
    }
  }

  public static async checkAuth(): Promise<ServiceResponse<UserSession | null>> {
    try {
      const response = await this.apiClient.get<{ success: boolean; data: any }>('/auth/me');
      if (response.success && response.data) {
        const user = response.data;
        const userSession: UserSession = {
          id: user.id,
          nip: user.nip,
          name: user.name,
          title: user.title,
          role: user.role,
          email: user.email,
          avatar: user.avatar,
          token: getStoredToken() || undefined,
          loginTime: new Date().toISOString(),
        };
        saveUserSession(userSession);
        return this.createSuccess(userSession);
      }
      return this.createSuccess(null);
    } catch (err) {
      clearUserSession();
      return this.createError('Sesi login tidak valid', err);
    }
  }
}
