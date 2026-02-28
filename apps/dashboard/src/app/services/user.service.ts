import { effect, inject, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, tap } from 'rxjs';
import { ApiService } from '../core/services/api.service';
import { User, AuthResponse } from '../core/models/user.model';
import { Establishment } from '../core/models/establishment.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private api = inject(ApiService);
  private router = inject(Router);
  private userInfo = signal<User | null>(this.loadUserFromLocalStorage());
  private currentEstablishment = signal<Establishment | null>(this.loadEstablishmentFromLocalStorage());

  constructor() {
    effect(() => {
      this.syncUserInfoWithLocalStorage();
      this.syncEstablishmentWithLocalStorage();
    });
  }

  private syncUserInfoWithLocalStorage(): void {
    if (this.userInfo()) {
      localStorage.setItem('UserData', JSON.stringify(this.userInfo()));
    } else {
      localStorage.removeItem('UserData');
    }
  }

  private syncEstablishmentWithLocalStorage(): void {
    if (this.currentEstablishment()) {
      localStorage.setItem('CurrentEstablishment', JSON.stringify(this.currentEstablishment()));
    } else {
      localStorage.removeItem('CurrentEstablishment');
    }
  }

  private loadEstablishmentFromLocalStorage(): Establishment | null {
    const stored = localStorage.getItem('CurrentEstablishment');
    return stored ? JSON.parse(stored) : null;
  }

  setCurrentUser(user: User | null): void {
    this.userInfo.set(user);
  }

  setCurrentEstablishment(establishment: Establishment | null): void {
    this.currentEstablishment.set(establishment);
  }

  getUserInfo() {
    return this.userInfo.asReadonly();
  }

  getEstablishment() {
    return this.currentEstablishment.asReadonly();
  }

  getEstablishmentId(): string | null {
    return this.currentEstablishment()?.id || null;
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
    localStorage.removeItem('CurrentEstablishment');
    this.setCurrentUser(null);
    this.setCurrentEstablishment(null);
    this.router.navigate(['/login']);
  }

  private loadUserFromLocalStorage(): User | null {
    const storedUser = localStorage.getItem('UserData');
    return storedUser ? JSON.parse(storedUser) : null;
  }

  login(email: string, password: string): Observable<AuthResponse> {
    return this.api.postData<AuthResponse>('/auth/login', { email, password }).pipe(
      tap((authData) => {
        const { access_token, user } = authData;
        this.setToken(access_token);
        this.setCurrentUser(user);
        
        // Define o primeiro estabelecimento como atual (se houver)
        if (user.establishments && user.establishments.length > 0) {
          this.setCurrentEstablishment(user.establishments[0].establishment);
        }
        
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
    // postData already extracts .data from ApiResponse, so we get AuthResponse directly
    return this.api
      .postData<AuthResponse>('/auth/register', { name, email, password, phone })
      .pipe(
        tap((authData) => {
          const { access_token, user } = authData;
          this.setToken(access_token);
          this.setCurrentUser(user);
          
          if (user.establishments && user.establishments.length > 0) {
            this.setCurrentEstablishment(user.establishments[0].establishment);
          }
          
          this.router.navigate(['/dashboard']);
        })
      );
  }
}