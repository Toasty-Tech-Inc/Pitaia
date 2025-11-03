export interface IAuthService {
  validateUser(email: string, password: string): Promise<any>;
  login(user: any): Promise<{ access_token: string; user: any }>;
  register(userData: any): Promise<{ access_token: string; user: any }>;
  refreshToken(token: string): Promise<{ access_token: string }>;
  validateToken(token: string): Promise<any>;
}