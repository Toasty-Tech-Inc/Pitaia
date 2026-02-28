import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule, KeyValuePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
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
  TuiBadgeNotification,
} from '@taiga-ui/kit';
import { TuiNavigation } from '@taiga-ui/layout';
import { tuiAsPortal, TuiPortals, TuiActiveZone } from '@taiga-ui/cdk';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    CommonModule,
    KeyValuePipe,
    RouterLink,
    TuiActiveZone,
    TuiAppearance,
    TuiAvatar,
    TuiBadgeNotification,
    TuiButton,
    TuiDataList,
    TuiDropdown,
    TuiIcon,
    TuiLink,
    TuiNavigation,
    TuiTextfield,
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [TuiDropdownService, tuiAsPortal(TuiDropdownService)],
})
export class HeaderComponent extends TuiPortals {
  private userService = inject(UserService);
  protected open = false;
  protected dropdownOpen = false;
  protected notifications = signal(3);
  protected user = this.userService.getUserInfo();

  protected readonly drawer = {
    'Operações': [
      { name: 'PDV', icon: '@tui.shopping-cart', route: '/pos' },
      { name: 'Pedidos Online', icon: '@tui.globe', route: '/orders' },
      { name: 'Mesas', icon: '@tui.grid', route: '/tables' },
      { name: 'Entregas', icon: '@tui.truck', route: '/deliveries' },
    ],
    'Gestão': [
      { name: 'Produtos', icon: '@tui.package', route: '/products' },
      { name: 'Estoque', icon: '@tui.archive', route: '/stock' },
      { name: 'Relatórios', icon: '@tui.bar-chart', route: '/reports' },
      { name: 'Caixa', icon: '@tui.dollar-sign', route: '/cashier' },
    ],
    'Configurações': [
      { name: 'Integrações', icon: '@tui.link', route: '/integrations' },
      { name: 'Notas Fiscais', icon: '@tui.file-text', route: '/invoices' },
      { name: 'Formas de Pagamento', icon: '@tui.credit-card', route: '/payments' },
    ],
  };

  logout(): void {
    this.userService.logout();
  }
}

