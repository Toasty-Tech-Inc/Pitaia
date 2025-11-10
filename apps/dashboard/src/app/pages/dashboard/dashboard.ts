import { CdkDragDrop, DragDropModule, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { KeyValuePipe, NgClass, NgForOf, NgIf } from '@angular/common';
import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { tuiAsPortal, TuiPortals, TuiRepeatTimes } from '@taiga-ui/cdk';
import {
    TuiAppearance,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiDropdownService,
    TuiIcon,
    TuiLink,
    TuiTextfield,
    TuiTitle,
} from '@taiga-ui/core';
import {
    TuiAvatar,
    TuiBadge,
    TuiBadgeNotification,
    TuiBreadcrumbs,
    TuiChevron,
    TuiDataListDropdownManager,
    TuiFade,
    TuiSwitch,
    TuiTabs,
} from '@taiga-ui/kit';
import { TuiCardLarge, TuiForm, TuiHeader, TuiNavigation } from '@taiga-ui/layout';

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
        NgClass,
        NgForOf,
        NgIf,
        RouterLink,
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
        TuiDataListDropdownManager,
        TuiDropdown,
        TuiFade,
        TuiForm,
        TuiHeader,
        TuiIcon,
        TuiLink,
        TuiNavigation,
        TuiRepeatTimes,
        TuiSwitch,
        TuiTabs,
        TuiTextfield,
        TuiTitle,
    ],
    template: `
        <div class="custom-portal">
            <ng-container #viewContainer />
        </div>

        <header tuiNavigationHeader class="pitaia-header">
            <button
                title="Menu"
                tuiIconButton
                tuiNavigationDrawer
                type="button"
                [(open)]="open"
            >
                <tui-data-list>
                    <tui-opt-group
                        *ngFor="let group of drawer | keyvalue"
                        [label]="group.key"
                    >
                        <button
                            *ngFor="let item of group.value"
                            tuiOption
                            type="button"
                            (click)="open = false"
                        >
                            <tui-icon [icon]="item.icon" />
                            {{ item.name }}
                        </button>
                    </tui-opt-group>
                    <tui-opt-group>
                        <label tuiOption>
                            <input
                                size="s"
                                tuiSwitch
                                type="checkbox"
                                [(ngModel)]="darkMode"
                            />
                            Modo Escuro
                        </label>
                    </tui-opt-group>
                </tui-data-list>
            </button>

            <span tuiNavigationLogo>
                <tui-icon icon="@tui.home" />
                <span tuiFade>Pitaia - Sistema de Gestão</span>
            </span>

            <span tuiNavigationSegments>
                <button
                    appearance="secondary-grayscale"
                    tuiButton
                    type="button"
                >
                    PDV
                </button>
                <button
                    appearance="secondary-grayscale"
                    tuiButton
                    type="button"
                >
                    Pedidos
                </button>
                <button
                    appearance="secondary-grayscale"
                    tuiButton
                    type="button"
                >
                    Relatórios
                </button>
            </span>

            <hr />

            <button
                class="pitaia-primary-btn"
                iconStart="@tui.plus"
                tuiButton
                type="button"
            >
                Novo Pedido
            </button>

            <button
                iconStart="@tui.bell"
                tuiIconButton
                type="button"
            >
                Notificações
                <tui-badge-notification *ngIf="notifications() > 0" />
            </button>

            <button
                iconStart="@tui.printer"
                tuiIconButton
                type="button"
                title="Imprimir Pedidos"
            >
                Impressão
            </button>

            <tui-avatar text="Admin" />
        </header>

        <div [style.display]="'flex'">
            <aside
                [style.height]="'calc(100vh - 64px)'"
                [tuiNavigationAside]="expanded()"
            >
                <header>
                    <button
                        iconStart="@tui.layout-grid"
                        tuiAsideItem
                        type="button"
                    >
                        <span tuiFade>Dashboard</span>
                    </button>
                </header>

                <button
                    iconStart="@tui.shopping-cart"
                    tuiAsideItem
                    type="button"
                >
                    PDV
                    <ng-container *ngIf="expanded()">
                        <tui-badge appearance="accent">{{ activeOrders() }}</tui-badge>
                    </ng-container>
                </button>

                <button
                    iconStart="@tui.file-text"
                    tuiAsideItem
                    type="button"
                >
                    Pedidos
                </button>

                <button
                    iconStart="@tui.layers"
                    tuiAsideItem
                    type="button"
                >
                    Mesas
                </button>

                <button
                    iconStart="@tui.truck"
                    tuiAsideItem
                    type="button"
                >
                    Entregas
                </button>

                <tui-aside-group>
                    <button
                        iconStart="@tui.package"
                        tuiAsideItem
                        tuiChevron
                        type="button"
                    >
                        Produtos
                        <ng-template>
                            <button tuiAsideItem type="button">Cardápio</button>
                            <button tuiAsideItem type="button">Estoque</button>
                            <button tuiAsideItem type="button">Categorias</button>
                        </ng-template>
                    </button>
                </tui-aside-group>

                <tui-aside-group>
                    <button
                        iconStart="@tui.bar-chart-2"
                        tuiAsideItem
                        tuiChevron
                        type="button"
                    >
                        Relatórios
                        <ng-template>
                            <button tuiAsideItem type="button">Vendas</button>
                            <button tuiAsideItem type="button">CMV</button>
                            <button tuiAsideItem type="button">Caixa</button>
                            <button tuiAsideItem type="button">Clientes</button>
                        </ng-template>
                    </button>
                </tui-aside-group>

                <button
                    iconStart="@tui.users"
                    tuiAsideItem
                    type="button"
                >
                    Clientes
                </button>

                <button
                    iconStart="@tui.gift"
                    tuiAsideItem
                    type="button"
                >
                    Promoções
                </button>

                <button
                    iconStart="@tui.credit-card"
                    tuiAsideItem
                    type="button"
                >
                    Pagamentos
                </button>

                <hr />

                <button
                    iconStart="@tui.settings"
                    tuiAsideItem
                    type="button"
                >
                    Configurações
                </button>

                <footer>
                    <button
                        iconStart="@tui.dollar-sign"
                        tuiAsideItem
                        type="button"
                    >
                        Caixa
                    </button>
                    <button
                        tuiAsideItem
                        type="button"
                        [iconStart]="expanded() ? '@tui.chevron-left' : '@tui.chevron-right'"
                        (click)="handleToggle()"
                    >
                        {{ expanded() ? 'Recolher' : 'Expandir' }}
                    </button>
                </footer>
            </aside>

            <main tuiNavigationMain class="pitaia-main">
                <nav compact tuiSubheader [style.position]="'sticky'">
                    <tui-breadcrumbs [itemsLimit]="10">
                        <ng-container *ngFor="let item of breadcrumbs; let last = last">
                            <ng-container *ngIf="last">
                                <strong *tuiItem tuiFade>{{ item }}</strong>
                            </ng-container>
                            <ng-container *ngIf="!last">
                                <button *tuiItem tuiLink type="button">{{ item }}</button>
                            </ng-container>
                        </ng-container>
                    </tui-breadcrumbs>

                    <tui-tabs tuiFade>
                        <button tuiTab type="button">Kanban</button>
                        <button tuiTab type="button">Lista</button>
                        <button tuiTab type="button">Estatísticas</button>
                    </tui-tabs>

                    <button
                        appearance="secondary"
                        iconStart="@tui.filter"
                        tuiButton
                        type="button"
                    >
                        Filtrar
                    </button>

                    <button
                        class="pitaia-primary-btn"
                        iconStart="@tui.refresh-cw"
                        tuiButton
                        type="button"
                    >
                        Atualizar
                    </button>
                </nav>

                <!-- Kanban Board -->
                <div class="kanban-container" cdkDropListGroup>
                    <div
                        *ngFor="let column of kanbanColumns"
                        class="kanban-column"
                        cdkDropList
                        [cdkDropListData]="column.orders"
                        (cdkDropListDropped)="onDrop($event)"
                    >
                        <div class="column-header" [style.border-left-color]="column.color">
                            <h3 class="column-title">
                                {{ column.title }}
                                <tui-badge [style.background-color]="column.color">
                                    {{ column.orders.length }}
                                </tui-badge>
                            </h3>
                        </div>

                        <div class="column-content">
                            <div
                                *ngFor="let order of column.orders"
                                class="order-card"
                                cdkDrag
                                tuiAppearance="floating"
                                tuiCardLarge
                            >
                                <div class="order-card-header">
                                    <span class="order-id">#{{ order.id }}</span>
                                    <tui-badge
                                        *ngIf="order.deliveryType === 'delivery'"
                                        appearance="accent"
                                    >
                                        <tui-icon icon="@tui.truck" />
                                    </tui-badge>
                                    <tui-badge
                                        *ngIf="order.deliveryType === 'local'"
                                        appearance="info"
                                    >
                                        Mesa {{ order.table }}
                                    </tui-badge>
                                </div>

                                <div class="order-card-body">
                                    <p class="customer-name">
                                        <tui-icon icon="@tui.user" />
                                        {{ order.customer }}
                                    </p>

                                    <ul class="order-items">
                                        <li *ngFor="let item of order.items.slice(0, 3)">
                                            {{ item }}
                                        </li>
                                        <li *ngIf="order.items.length > 3" class="more-items">
                                            +{{ order.items.length - 3 }} itens
                                        </li>
                                    </ul>

                                    <div class="order-meta">
                                        <span class="order-time">
                                            <tui-icon icon="@tui.clock" />
                                            {{ formatTime(order.timestamp) }}
                                        </span>
                                        <span class="order-waiter" *ngIf="order.waiter">
                                            <tui-icon icon="@tui.user-check" />
                                            {{ order.waiter }}
                                        </span>
                                    </div>
                                </div>

                                <div class="order-card-footer">
                                    <strong class="order-total">R$ {{ order.total.toFixed(2) }}</strong>
                                    <div class="order-actions">
                                        <button
                                            size="xs"
                                            iconStart="@tui.eye"
                                            tuiIconButton
                                            type="button"
                                            title="Ver detalhes"
                                        ></button>
                                        <button
                                            size="xs"
                                            iconStart="@tui.printer"
                                            tuiIconButton
                                            type="button"
                                            title="Imprimir"
                                        ></button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    `,
    styles: [`
        :host {
            --pitaia-primary: #FE3867;
            --pitaia-primary-hover: #E5305C;
            --pitaia-success: #38D9A9;
            --pitaia-success-hover: #2FC598;
            --pitaia-warning: #FFC107;
            --pitaia-info: #03A9F4;
            --pitaia-dark: #1A1A1A;
            --pitaia-light: #F5F5F5;
        }

        .pitaia-header {
            background: var(--pitaia-dark);
            color: white;
        }

        .pitaia-primary-btn {
            background-color: var(--pitaia-primary) !important;
            color: white !important;

            &:hover {
                background-color: var(--pitaia-primary-hover) !important;
            }
        }

        .pitaia-main {
            background: var(--pitaia-light);
            padding: 0;
        }

        .kanban-container {
            display: flex;
            gap: 1rem;
            padding: 1.5rem;
            overflow-x: auto;
            min-height: calc(100vh - 180px);
        }

        .kanban-column {
            min-width: 320px;
            max-width: 380px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
            display: flex;
            flex-direction: column;
        }

        .column-header {
            padding: 1rem 1.25rem;
            border-bottom: 1px solid #e0e0e0;
            border-left: 4px solid transparent;
            border-radius: 12px 12px 0 0;
        }

        .column-title {
            margin: 0;
            font-size: 1rem;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            color: var(--pitaia-dark);
        }

        .column-content {
            flex: 1;
            padding: 1rem;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 0.75rem;
        }

        .order-card {
            padding: 1rem !important;
            cursor: move;
            transition: all 0.2s ease;
            border: 1px solid #e0e0e0;

            &:hover {
                box-shadow: 0 4px 12px rgba(254, 56, 103, 0.15) !important;
                border-color: var(--pitaia-primary);
            }
        }

        .order-card-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 0.75rem;
        }

        .order-id {
            font-weight: 700;
            font-size: 1.1rem;
            color: var(--pitaia-primary);
        }

        .order-card-body {
            margin-bottom: 0.75rem;
        }

        .customer-name {
            font-weight: 600;
            margin: 0 0 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 0.4rem;
            color: var(--pitaia-dark);
        }

        .order-items {
            list-style: none;
            padding: 0;
            margin: 0.5rem 0;
            font-size: 0.875rem;
            color: #666;

            li {
                padding: 0.25rem 0;
                border-bottom: 1px dashed #e0e0e0;

                &:last-child {
                    border-bottom: none;
                }
            }

            .more-items {
                font-style: italic;
                color: var(--pitaia-primary);
            }
        }

        .order-meta {
            display: flex;
            gap: 1rem;
            margin-top: 0.75rem;
            font-size: 0.8rem;
            color: #888;

            span {
                display: flex;
                align-items: center;
                gap: 0.3rem;
            }
        }

        .order-card-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 0.75rem;
            border-top: 1px solid #e0e0e0;
        }

        .order-total {
            font-size: 1.25rem;
            color: var(--pitaia-success);
        }

        .order-actions {
            display: flex;
            gap: 0.5rem;
        }

        .cdk-drag-preview {
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
            opacity: 0.9;
        }

        .cdk-drag-placeholder {
            opacity: 0.4;
            background: #f0f0f0;
            border: 2px dashed var(--pitaia-primary);
        }

        .cdk-drag-animating {
            transition: transform 250ms cubic-bezier(0, 0, 0.2, 1);
        }
    `],
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
