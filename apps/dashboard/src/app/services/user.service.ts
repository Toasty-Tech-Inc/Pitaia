import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { User, AuthResponse } from '../core/models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);
  private router = inject(Router);
  private userInfo = signal<User | null>(this.loadUserFromLocalStorage());

  constructor() {
    effect(() => {
      this.syncUserInfoWithLocalStorage();
    });
  }

  private syncUserInfoWithLocalStorage(): void {
    if (this.userInfo()) {
      localStorage.setItem('UserData', JSON.stringify(this.userInfo()));
    } else {
      localStorage.removeItem('UserData');
    }
  }

  setCurrentUser(user: User | null): void {
    this.userInfo.set(user);
  }

  getUserInfo() {
    return this.userInfo.asReadonly();
  }

  isUserLogged(): boolean {
    return !!this.userInfo();
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  setToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  logout(): void {
    localStorage.removeItem('access_token');
    this.setCurrentUser(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromLocalStorage(): User | null {
    const storedUser = localStorage.getItem('UserData');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.postData<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((response) => {
        const { access_token, user } = response;
        this.setToken(access_token);
        this.setCurrentUser(user);
        this.router.navigate(['/dashboard']);
      })
    );
  }

  register(
    name: string,
    email: string,
    password: string,
    phone: string
  ): Observable<AuthResponse> {
    return this.api
      .postData<AuthResponse>('/auth/register', { name, email, password, phone })
      .pipe(
        tap((response) => {
          const { access_token, user } = response;
          this.setToken(access_token);
          this.setCurrentUser(user);
          this.router.navigate(['/dashboard']);
        })
      );
  }
}