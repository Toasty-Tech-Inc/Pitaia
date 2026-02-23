import { ChangeDetectionStrategy, Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { TuiNavigation } from '@taiga-ui/layout';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    TuiNavigation,
    HeaderComponent,
    SidebarComponent,
  ],
  template: `
    <header tuiNavigationHeader>
      <app-header />
    </header>

    <div [style.display]="'flex'">
      <app-sidebar [expanded]="expanded()" [activeOrders]="0" />

      <main tuiNavigationMain class="pitaia-main">
        <router-outlet />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }
    
    .pitaia-main {
      flex: 1;
      padding: 1.5rem;
      background: var(--tui-background-base);
      min-height: calc(100vh - 64px);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LayoutComponent {
  protected expanded = signal(false);
}
