import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';

export type Role = 'SEEKER' | 'SPONSOR' | 'ADMIN';
export type UserDTO = { id: number; email: string; role: Role };
type LoginResponse = { accessToken: string; user: UserDTO };
type RegisterBody = { email: string; password: string; role: Role };

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'auth_user'; // cached user for convenience

  async login(email: string, password: string): Promise<UserDTO> {
    const res = await this.http
      .post<LoginResponse>('/api/auth/login', { email, password })
      .toPromise();
    if (!res?.accessToken) throw new Error('Invalid response');
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    return res.user;
  }

  async register(body: RegisterBody): Promise<UserDTO> {
    const res = await this.http
      .post<LoginResponse>('/api/auth/register', body)
      .toPromise();
    if (!res?.accessToken) throw new Error('Invalid response');
    localStorage.setItem(this.TOKEN_KEY, res.accessToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(res.user));
    return res.user;
  }

  logout(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  get token(): string | null { return localStorage.getItem(this.TOKEN_KEY); }
  get cachedUser(): UserDTO | null {
    const raw = localStorage.getItem(this.USER_KEY);
    return raw ? JSON.parse(raw) as UserDTO : null;
  }
}
