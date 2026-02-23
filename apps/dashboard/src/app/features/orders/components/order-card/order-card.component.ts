import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DragDropModule } from '@angular/cdk/drag-drop';
import {
  TuiAppearance,
  TuiIcon,
  TuiButton,
} from '@taiga-ui/core';
import { TuiBadge } from '@taiga-ui/kit';
import { TuiCardLarge } from '@taiga-ui/layout';
import { Order, OrderType } from '../../../../core/models/order.model';

@Component({
  selector: 'app-order-card',
  standalone: true,
  imports: [
    CommonModule,
    DragDropModule,
    TuiAppearance,
    TuiBadge,
    TuiButton,
    TuiCardLarge,
    TuiIcon,
  ],
  templateUrl: './order-card.component.html',
  styleUrls: ['./order-card.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OrderCardComponent {
  order = input.required<Order>();
  onView = output<Order>();
  onPrint = output<Order>();
  onStatusChange = output<{ order: Order; status: string }>();

  protected formatTime(date: Date): string {
    const minutes = Math.floor((Date.now() - new Date(date).getTime()) / 60000);
    if (minutes < 1) return 'Agora';
    if (minutes === 1) return '1 min';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h ${minutes % 60}min`;
  }

  protected getDeliveryTypeIcon(type?: OrderType): string {
    switch (type) {
      case OrderType.DELIVERY:
        return '@tui.truck';
      case OrderType.DINE_IN:
        return '@tui.grid';
      case OrderType.TAKEOUT:
        return '@tui.shopping-bag';
      default:
        return '@tui.shopping-cart';
    }
  }

  protected handleView(): void {
    this.onView.emit(this.order());
  }

  protected handlePrint(): void {
    this.onPrint.emit(this.order());
  }
}

