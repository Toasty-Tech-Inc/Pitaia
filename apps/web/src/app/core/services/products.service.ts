import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Product, Category } from '../models/product.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    establishmentId?: string;
    categoryId?: string;
    search?: string;
    isActive?: boolean;
    isAvailable?: boolean;
  }): Observable<PaginatedResponse<Product>> {
    return this.api.getPaginated<Product>('/products', params);
  }

  getById(id: string): Observable<Product> {
    return this.api.getData<Product>(`/products/${id}`);
  }

  getFeatured(establishmentId: string): Observable<Product[]> {
    return this.api.getData<Product[]>(`/products/featured/${establishmentId}`);
  }
}

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    establishmentId?: string;
    parentId?: string;
    search?: string;
    isActive?: boolean;
  }): Observable<PaginatedResponse<Category>> {
    return this.api.getPaginated<Category>('/categories', params);
  }

  getById(id: string): Observable<Category> {
    return this.api.getData<Category>(`/categories/${id}`);
  }

  getByEstablishment(establishmentId: string): Observable<Category[]> {
    return this.api.getData<Category[]>(`/categories/establishment/${establishmentId}`);
  }

  getRootCategories(establishmentId: string): Observable<Category[]> {
    return this.api.getData<Category[]>(`/categories/establishment/${establishmentId}/root`);
  }
}
