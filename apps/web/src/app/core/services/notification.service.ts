import { inject, Injectable } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private alertService = inject(TuiAlertService);

  success(message: string, title?: string): void {
    this.alertService.open(message, {
      label: title ?? 'Sucesso',
      appearance: 'success',
    }).subscribe();
  }

  error(message: string, title?: string): void {
    this.alertService.open(message, {
      label: title ?? 'Erro',
      appearance: 'error',
    }).subscribe();
  }

  warning(message: string, title?: string): void {
    this.alertService.open(message, {
      label: title ?? 'Atenção',
      appearance: 'warning',
    }).subscribe();
  }

  info(message: string, title?: string): void {
    this.alertService.open(message, {
      label: title ?? 'Informação',
      appearance: 'info',
    }).subscribe();
  }
}
