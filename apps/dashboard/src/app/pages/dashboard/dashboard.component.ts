import { ChangeDetectionStrategy, Component, signal, inject, OnInit } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { CdkDragDrop, CdkDropListGroup, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import {
  TuiAppearance,
  TuiButton,
  TuiIcon,
  TuiLink,
  TuiTextfield,
} from '@taiga-ui/core';
import { TuiBadge, TuiBreadcrumbs, TuiTabs } from '@taiga-ui/kit';
import { TuiCardLarge, TuiNavigation } from '@taiga-ui/layout';
import { KanbanColumn, KanbanColumnComponent } from '../../features/orders/components/kanban-column/kanban-column.component';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { HeaderComponent } from '../../shared/components/header/header.component';
import { OrdersService } from '../../core/services';
import { Order, OrderStatus } from '../../core/models';
import { UserService } from '../../services/user.service';
import { PaginatedResponse } from '../../core/models/api-response.model';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    CdkDropListGroup,
    DragDropModule,
    FormsModule,
    TuiAppearance,
    TuiBreadcrumbs,
    TuiButton,
    TuiLink,
    TuiNavigation,
    TuiTabs,
    TuiTextfield,
    HeaderComponent,
    SidebarComponent,
    KanbanColumnComponent,
  ],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardComponent implements OnInit {
  private ordersService = inject(OrdersService);
  private userService = inject(UserService);
  
  protected expanded = signal(false);
  protected readonly breadcrumbs = ['Dashboard', 'Pedidos', 'Gestão'];
  protected activeTab = signal(0);
  protected kanbanColumns = signal<KanbanColumn[]>([]);
  protected loading = signal(false);
  protected error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadOrders();
  }

  protected loadOrders(): void {
    this.loading.set(true);
    this.error.set(null);

    const establishmentId = this.userService.getEstablishmentId();
    
    if (!establishmentId) {
      this.error.set('Nenhum estabelecimento selecionado');
      this.loading.set(false);
      return;
    }

    this.ordersService.getAll({ establishmentId, limit: 50 }).subscribe({
      next: (response: PaginatedResponse<Order>) => {
        this.organizeOrdersIntoColumns(response.data);
        this.loading.set(false);
      },
      error: (err: Error) => {
        this.error.set('Erro ao carregar pedidos');
        this.loading.set(false);
        console.error(err);
      },
    });
  }

  private organizeOrdersIntoColumns(orders: Order[]): void {
    const columns: KanbanColumn[] = [
      {
        id: 'pending',
        title: 'Novos Pedidos',
        color: '#FFC107',
        orders: orders.filter((o) => o.status === OrderStatus.PENDING),
      },
      {
        id: 'confirmed',
        title: 'Confirmados',
        color: '#03A9F4',
        orders: orders.filter((o) => o.status === OrderStatus.CONFIRMED),
      },
      {
        id: 'preparing',
        title: 'Em Preparo',
        color: '#2196F3',
        orders: orders.filter((o) => o.status === OrderStatus.PREPARING),
      },
      {
        id: 'ready',
        title: 'Pronto',
        color: '#38D9A9',
        orders: orders.filter((o) => o.status === OrderStatus.READY),
      },
      {
        id: 'delivering',
        title: 'Em Entrega',
        color: '#FE3867',
        orders: orders.filter((o) => o.status === OrderStatus.DELIVERING),
      },
    ];

    this.kanbanColumns.set(columns);
  }

  protected onDrop(event: CdkDragDrop<Order[]>): void {
    if (event.previousContainer === event.container) {
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
    } else {
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );

      // Update order status
      const order = event.container.data[event.currentIndex];
      const newStatus = this.getStatusFromColumnId(event.container.id);
      
      if (newStatus && order.id) {
        this.ordersService.updateStatus(order.id, newStatus).subscribe({
          next: () => {
            this.loadOrders(); // Reload to sync with backend
          },
          error: (err: Error) => {
            console.error('Error updating order status:', err);
            // Revert the change on error
            transferArrayItem(
              event.container.data,
              event.previousContainer.data,
              event.currentIndex,
              event.previousIndex
            );
          },
        });
      }
    }
  }

  private getStatusFromColumnId(columnId: string): OrderStatus | null {
    const statusMap: Record<string, OrderStatus> = {
      pending: OrderStatus.PENDING,
      confirmed: OrderStatus.CONFIRMED,
      preparing: OrderStatus.PREPARING,
      ready: OrderStatus.READY,
      delivering: OrderStatus.DELIVERING,
    };
    return statusMap[columnId] || null;
  }

  protected handleOrderView(order: Order): void {
    // TODO: Navigate to order details
    console.log('View order:', order);
  }

  protected handleOrderPrint(order: Order): void {
    // TODO: Implement print functionality
    console.log('Print order:', order);
  }

  protected handleToggle(): void {
    this.expanded.update((e) => !e);
  }

  protected refresh(): void {
    this.loadOrders();
  }
}

