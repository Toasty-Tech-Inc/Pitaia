import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Establishment } from '../models/establishment.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentsService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams): Observable<PaginatedResponse<Establishment>> {
    return this.api.getPaginated<Establishment>('/establishments', params);
  }

  getMine(): Observable<Establishment[]> {
    return this.api.getData<Establishment[]>('/establishments/mine');
  }

  getById(id: string): Observable<Establishment> {
    return this.api.getData<Establishment>(`/establishments/${id}`);
  }

  getBySlug(slug: string): Observable<Establishment> {
    return this.api.getData<Establishment>(`/establishments/slug/${slug}`);
  }

  create(establishment: Partial<Establishment>): Observable<Establishment> {
    return this.api.postData<Establishment>('/establishments', establishment);
  }

  update(id: string, establishment: Partial<Establishment>): Observable<Establishment> {
    return this.api.patchData<Establishment>(`/establishments/${id}`, establishment);
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/establishments/${id}`);
  }

  toggleOpen(id: string): Observable<Establishment> {
    return this.api.patchData<Establishment>(`/establishments/${id}/toggle-open`, {});
  }

  updateSettings(id: string, settings: Partial<Establishment['settings']>): Observable<Establishment> {
    return this.api.patchData<Establishment>(`/establishments/${id}/settings`, settings);
  }

  updateBusinessHours(id: string, businessHours: Establishment['businessHours']): Observable<Establishment> {
    return this.api.patchData<Establishment>(`/establishments/${id}/business-hours`, { businessHours });
  }
}
