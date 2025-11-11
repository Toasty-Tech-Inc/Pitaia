import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KeyValuePipe, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLinkActive } from '@angular/router';
import { tuiAsPortal, TuiPortals } from '@taiga-ui/cdk';
import {
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiIcon,
    TuiLink,
    TuiTextfield,
} from '@taiga-ui/core';
import {
    TuiAvatar,
    TuiBadge,
    TuiBadgeNotification,
    TuiBreadcrumbs,
    TuiChevron,
    TuiFade,
    TuiSwitch,
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiNavigation } from '@taiga-ui/layout';

interface Order {
    id: number;
    table?: string;
    customer: string;
    items: string[];
    total: number;
    paymentMethod?: string;
    timestamp: Date;
    waiter?: string;
    deliveryType?: 'local' | 'delivery' | 'takeout';
}

interface KanbanColumn {
    id: string;
    title: string;
    orders: Order[];
    color: string;
}

@Component({
    standalone: true,
    selector: 'app-pitaia-dashboard',
    imports: [
        DragDropModule,
        FormsModule,
        KeyValuePipe,
        NgForOf,
        NgIf,
        RouterLinkActive,
        TuiAppearance,
        TuiAvatar,
        TuiBadge,
        TuiBadgeNotification,
        TuiBreadcrumbs,
        TuiButton,
        TuiCardLarge,
        TuiChevron,
        TuiDataList,
        TuiDropdown,
        TuiFade,

        TuiIcon,
        TuiLink,
        TuiNavigation,
        TuiSwitch,
        TuiTabs,
        TuiTextfield,
    ],
    templateUrl: './dashboard.html',
    styleUrls: ['./dashboard.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class Dashboard extends TuiPortals {
    protected expanded = signal(false);
    protected open = false;
    protected darkMode = false;
    protected notifications = signal(3);
    protected activeOrders = signal(12);
    protected readonly breadcrumbs = ['Dashboard', 'Pedidos', 'Gestão'];

    protected readonly drawer = {
        'Operações': [
            { name: 'PDV', icon: '@tui.shopping-cart' },
            { name: 'Pedidos Online', icon: '@tui.globe' },
            { name: 'Mesas', icon: '@tui.grid' },
            { name: 'Entregas', icon: '@tui.truck' },
        ],
        'Gestão': [
            { name: 'Produtos', icon: '@tui.package' },
            { name: 'Estoque', icon: '@tui.archive' },
            { name: 'Relatórios', icon: '@tui.bar-chart' },
            { name: 'Caixa', icon: '@tui.dollar-sign' },
        ],
        'Configurações': [
            { name: 'Integrações', icon: '@tui.link' },
            { name: 'Notas Fiscais', icon: '@tui.file-text' },
            { name: 'Formas de Pagamento', icon: '@tui.credit-card' },
        ],
    };

    protected kanbanColumns: KanbanColumn[] = [
        {
            id: 'pending',
            title: 'Novos Pedidos',
            color: '#FFC107',
            orders: [
                {
                    id: 1523,
                    customer: 'João Silva',
                    table: '12',
                    items: ['Pizza Margherita', 'Refrigerante 2L', 'Batata Frita'],
                    total: 89.90,
                    timestamp: new Date(Date.now() - 5 * 60000),
                    waiter: 'Maria',
                    deliveryType: 'local',
                },
                {
                    id: 1524,
                    customer: 'Ana Costa',
                    items: ['Hambúrguer Artesanal', 'Suco Natural', 'Sobremesa'],
                    total: 65.50,
                    timestamp: new Date(Date.now() - 8 * 60000),
                    deliveryType: 'delivery',
                },
            ],
        },
        {
            id: 'preparing',
            title: 'Em Preparo',
            color: '#03A9F4',
            orders: [
                {
                    id: 1520,
                    customer: 'Carlos Mendes',
                    table: '5',
                    items: ['Espaguete Carbonara', 'Vinho Tinto', 'Entrada'],
                    total: 125.00,
                    timestamp: new Date(Date.now() - 15 * 60000),
                    waiter: 'Pedro',
                    deliveryType: 'local',
                },
            ],
        },
        {
            id: 'ready',
            title: 'Pronto',
            color: '#38D9A9',
            orders: [
                {
                    id: 1518,
                    customer: 'Marina Santos',
                    items: ['Salada Caesar', 'Água com Gás', 'Brownie'],
                    total: 45.00,
                    timestamp: new Date(Date.now() - 25 * 60000),
                    deliveryType: 'delivery',
                },
            ],
        },
        {
            id: 'delivering',
            title: 'Em Entrega',
            color: '#FE3867',
            orders: [
                {
                    id: 1515,
                    customer: 'Roberto Lima',
                    items: ['Pizza Portuguesa', 'Refrigerante', 'Borda Recheada'],
                    total: 78.90,
                    timestamp: new Date(Date.now() - 35 * 60000),
                    deliveryType: 'delivery',
                },
            ],
        },
    ];

    protected handleToggle(): void {
        this.expanded.update((e) => !e);
    }

    protected onDrop(event: CdkDragDrop<Order[]>): void {
        if (event.previousContainer === event.container) {
            moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
        } else {
            transferArrayItem(
                event.previousContainer.data,
                event.container.data,
                event.previousIndex,
                event.currentIndex,
            );
        }
    }

    protected formatTime(date: Date): string {
        const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
        if (minutes < 1) return 'Agora';
        if (minutes === 1) return '1 min';
        if (minutes < 60) return `${minutes} min`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h ${minutes % 60}min`;
    }
}
