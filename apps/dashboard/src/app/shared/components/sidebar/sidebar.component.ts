import { ChangeDetectionStrategy, Component, signal, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import {
  TuiBadge,
  TuiChevron,
} from '@taiga-ui/kit';
import { TuiIcon } from '@taiga-ui/core';
import { TuiNavigation } from '@taiga-ui/layout';

interface MenuItem {
  name: string;
  icon: string;
  route: string;
  badge?: number;
  children?: MenuItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    TuiBadge,
    TuiChevron,
    TuiIcon,
    TuiNavigation,
  ],
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SidebarComponent {
  expanded = input.required<boolean>();
  activeOrders = input<number>(0);

  protected readonly menuItems: MenuItem[] = [
    {
      name: 'Dashboard',
      icon: '@tui.layout-grid',
      route: '/dashboard',
    },
    {
      name: 'PDV',
      icon: '@tui.shopping-cart',
      route: '/pos',
      badge: this.activeOrders(),
    },
    {
      name: 'Pedidos',
      icon: '@tui.file-text',
      route: '/orders',
    },
    {
      name: 'Mesas',
      icon: '@tui.layers',
      route: '/tables',
    },
    {
      name: 'Entregas',
      icon: '@tui.truck',
      route: '/deliveries',
    },
    {
      name: 'Produtos',
      icon: '@tui.package',
      route: '/products',
      children: [
        { name: 'Cardápio', icon: '@tui.menu', route: '/products/menu' },
        { name: 'Estoque', icon: '@tui.archive', route: '/products/stock' },
        { name: 'Categorias', icon: '@tui.folder', route: '/products/categories' },
      ],
    },
    {
      name: 'Relatórios',
      icon: '@tui.bar-chart-2',
      route: '/reports',
      children: [
        { name: 'Vendas', icon: '@tui.trending-up', route: '/reports/sales' },
        { name: 'CMV', icon: '@tui.calculator', route: '/reports/cmv' },
        { name: 'Caixa', icon: '@tui.dollar-sign', route: '/reports/cashier' },
        { name: 'Clientes', icon: '@tui.users', route: '/reports/customers' },
      ],
    },
    {
      name: 'Clientes',
      icon: '@tui.users',
      route: '/customers',
    },
    {
      name: 'Promoções',
      icon: '@tui.gift',
      route: '/coupons',
    },
    {
      name: 'Pagamentos',
      icon: '@tui.credit-card',
      route: '/payments',
    },
    {
      name: 'Configurações',
      icon: '@tui.settings',
      route: '/settings',
    },
    {
      name: 'Caixa',
      icon: '@tui.dollar-sign',
      route: '/cashier',
    },
  ];
}

