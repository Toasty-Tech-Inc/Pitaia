import { inject, Injectable } from '@angular/core';
import { TuiAlertService } from '@taiga-ui/core';

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private alerts = inject(TuiAlertService);

  success(message: string, label = 'Sucesso'): void {
    this.alerts.open(message, { label, appearance: 'success', autoClose: 4000 }).subscribe();
  }

  error(message: string, label = 'Erro'): void {
    this.alerts.open(message, { label, appearance: 'error', autoClose: 6000 }).subscribe();
  }

  warning(message: string, label = 'Atenção'): void {
    this.alerts.open(message, { label, appearance: 'warning', autoClose: 5000 }).subscribe();
  }

  info(message: string, label = 'Info'): void {
    this.alerts.open(message, { label, appearance: 'info', autoClose: 4000 }).subscribe();
  }
}
