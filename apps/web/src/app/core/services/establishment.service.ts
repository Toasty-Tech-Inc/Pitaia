import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { ApiService } from './api.service';

export interface Establishment {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  logo?: string;
  coverImage?: string;
  phone?: string;
  email?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  openingHours?: OpeningHours[];
  deliverySettings?: DeliverySettings;
  isActive: boolean;
  isOpen: boolean;
}

export interface OpeningHours {
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  isOpen: boolean;
}

export interface DeliverySettings {
  deliveryEnabled: boolean;
  takeoutEnabled: boolean;
  dineInEnabled: boolean;
  minDeliveryOrder?: number;
  deliveryFee?: number;
  deliveryRadius?: number;
  estimatedDeliveryTime?: number;
}

const ESTABLISHMENT_KEY = 'pitaia_establishment';

@Injectable({
  providedIn: 'root',
})
export class EstablishmentService {
  private api = inject(ApiService);
  
  private establishmentSignal = signal<Establishment | null>(null);
  
  readonly establishment = this.establishmentSignal.asReadonly();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(ESTABLISHMENT_KEY);
      if (stored) {
        this.establishmentSignal.set(JSON.parse(stored) as Establishment);
      }
    } catch {
      localStorage.removeItem(ESTABLISHMENT_KEY);
    }
  }

  private saveToStorage(establishment: Establishment): void {
    localStorage.setItem(ESTABLISHMENT_KEY, JSON.stringify(establishment));
  }

  getEstablishmentId(): string | null {
    return this.establishmentSignal()?.id ?? null;
  }

  loadEstablishment(idOrSlug: string): Observable<Establishment> {
    return this.api.getData<Establishment>(`/establishments/${idOrSlug}`).pipe(
      tap((establishment) => {
        this.establishmentSignal.set(establishment);
        this.saveToStorage(establishment);
      })
    );
  }

  loadEstablishmentBySlug(slug: string): Observable<Establishment> {
    return this.api.getData<Establishment>(`/public/establishments/slug/${slug}`).pipe(
      tap((establishment) => {
        this.establishmentSignal.set(establishment);
        this.saveToStorage(establishment);
      })
    );
  }

  isEstablishmentOpen(): boolean {
    const establishment = this.establishmentSignal();
    return establishment?.isOpen ?? false;
  }

  getDeliverySettings(): DeliverySettings | null {
    return this.establishmentSignal()?.deliverySettings ?? null;
  }
}
