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

  create(product: Partial<Product>): Observable<Product> {
    return this.api.postData<Product>('/products', product);
  }

  update(id: string, product: Partial<Product>): Observable<Product> {
    return this.api.patchData<Product>(`/products/${id}`, product);
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/products/${id}`);
  }

  toggleAvailability(id: string): Observable<Product> {
    return this.api.patchData<Product>(`/products/${id}/toggle-availability`, {});
  }

  getFeatured(establishmentId: string): Observable<Product[]> {
    return this.api.getData<Product[]>(`/products/featured/${establishmentId}`);
  }

  getLowStock(establishmentId: string): Observable<Product[]> {
    return this.api.getData<Product[]>(`/products/low-stock/${establishmentId}`);
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

  create(category: Partial<Category>): Observable<Category> {
    return this.api.postData<Category>('/categories', category);
  }

  update(id: string, category: Partial<Category>): Observable<Category> {
    return this.api.patchData<Category>(`/categories/${id}`, category);
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/categories/${id}`);
  }

  toggleActive(id: string): Observable<Category> {
    return this.api.patchData<Category>(`/categories/${id}/toggle-active`, {});
  }
}

