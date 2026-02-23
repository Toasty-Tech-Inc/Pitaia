import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ApiResponse, PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private http = inject(HttpClient);
  private baseUrl = `${environment.urlApi}/api`;

  private get<T>(endpoint: string, params?: any): Observable<ApiResponse<T>> {
    let httpParams = new HttpParams();
    if (params) {
      Object.keys(params).forEach((key) => {
        if (params[key] !== null && params[key] !== undefined) {
          httpParams = httpParams.set(key, params[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, { params: httpParams });
  }

  private post<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.post<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  private patch<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.patch<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  private put<T>(endpoint: string, body: any): Observable<ApiResponse<T>> {
    return this.http.put<ApiResponse<T>>(`${this.baseUrl}${endpoint}`, body);
  }

  private deleteRequest<T>(endpoint: string): Observable<ApiResponse<T>> {
    return this.http.delete<ApiResponse<T>>(`${this.baseUrl}${endpoint}`);
  }

  // Public methods that extract .data from response
  getData<T>(endpoint: string, params?: any): Observable<T> {
    return this.get<T>(endpoint, params).pipe(map((response) => response.data));
  }

  postData<T>(endpoint: string, body: any): Observable<T> {
    return this.post<T>(endpoint, body).pipe(map((response) => response.data));
  }

  patchData<T>(endpoint: string, body: any): Observable<T> {
    return this.patch<T>(endpoint, body).pipe(map((response) => response.data));
  }

  putData<T>(endpoint: string, body: any): Observable<T> {
    return this.put<T>(endpoint, body).pipe(map((response) => response.data));
  }

  deleteData<T>(endpoint: string): Observable<void> {
    return this.deleteRequest<T>(endpoint).pipe(map(() => undefined));
  }

  getPaginated<T>(
    endpoint: string,
    params?: PaginationParams & any
  ): Observable<PaginatedResponse<T>> {
    return this.get<PaginatedResponse<T>>(endpoint, params).pipe(
      map((response) => response.data)
    );
  }
}

