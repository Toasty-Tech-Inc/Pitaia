import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ApiService } from './api.service';
import { Table, TableStatus } from '../models/table.model';
import { PaginatedResponse, PaginationParams } from '../models/api-response.model';

@Injectable({
  providedIn: 'root',
})
export class TablesService {
  private api = inject(ApiService);

  getAll(params?: PaginationParams & {
    establishmentId?: string;
    status?: TableStatus;
    location?: string;
    isActive?: boolean;
  }): Observable<PaginatedResponse<Table>> {
    return this.api.getPaginated<Table>('/tables', params);
  }

  getById(id: string): Observable<Table> {
    return this.api.getData<Table>(`/tables/${id}`);
  }

  getByEstablishment(establishmentId: string): Observable<Table[]> {
    return this.api.getData<Table[]>(`/tables/establishment/${establishmentId}`);
  }

  getByQrCode(qrCode: string): Observable<Table> {
    return this.api.getData<Table>(`/tables/qr-code/${qrCode}`);
  }

  create(table: Partial<Table>): Observable<Table> {
    return this.api.postData<Table>('/tables', table);
  }

  update(id: string, table: Partial<Table>): Observable<Table> {
    return this.api.patchData<Table>(`/tables/${id}`, table);
  }

  updateStatus(id: string, status: TableStatus): Observable<Table> {
    return this.api.patchData<Table>(`/tables/${id}/status`, { status });
  }

  toggleActive(id: string): Observable<Table> {
    return this.api.patchData<Table>(`/tables/${id}/toggle-active`, {});
  }

  delete(id: string): Observable<void> {
    return this.api.deleteData<void>(`/tables/${id}`);
  }
}

