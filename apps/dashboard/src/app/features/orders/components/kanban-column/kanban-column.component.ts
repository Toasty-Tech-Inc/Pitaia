import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CdkDropList, CdkDropListGroup, DragDropModule } from '@angular/cdk/drag-drop';
import { TuiBadge } from '@taiga-ui/kit';
import { Order } from '../../../../core/models/order.model';
import { OrderCardComponent } from '../order-card/order-card.component';

export interface KanbanColumn {
  id: string;
  title: string;
  orders: Order[];
  color: string;
}

@Component({
  selector: 'app-kanban-column',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropList,
    CdkDropListGroup,
    DragDropModule,
    TuiBadge,
    OrderCardComponent,
  ],
  templateUrl: './kanban-column.component.html',
  styleUrls: ['./kanban-column.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KanbanColumnComponent {
  column = input.required<KanbanColumn>();
  onDrop = output<any>();
  onOrderView = output<Order>();
  onOrderPrint = output<Order>();

  protected handleDrop(event: any): void {
    this.onDrop.emit(event);
  }

  protected handleOrderView(order: Order): void {
    this.onOrderView.emit(order);
  }

  protected handleOrderPrint(order: Order): void {
    this.onOrderPrint.emit(order);
  }
}

