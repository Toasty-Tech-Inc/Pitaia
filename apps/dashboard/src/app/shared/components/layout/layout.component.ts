import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiNavigation } from '@taiga-ui/layout';
import { HeaderComponent } from '../header/header.component';
import { SidebarComponent } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [
    CommonModule,
    TuiNavigation,
    HeaderComponent,
    SidebarComponent,
  ],
  template: `
    <header tuiNavigationHeader>
      <app-header (menuToggle)="toggleSidebar()" />
    </header>

    <div class="layout-container">
      <!-- Mobile Overlay -->
      @if (sidebarOpen() && isMobile()) {
        <div 
          class="sidebar-overlay" 
          (click)="closeSidebar()"
          role="button"
          tabindex="0"
          aria-label="Fechar menu"
          (keydown.enter)="closeSidebar()"
          (keydown.escape)="closeSidebar()"
        ></div>
      }

      <app-sidebar 
        [expanded]="expanded()" 
        [activeOrders]="0"
        [isOpen]="sidebarOpen()"
        [isMobile]="isMobile()"
        (closeSidebar)="closeSidebar()"
      />

      <main tuiNavigationMain class="pitaia-main" [class.sidebar-open]="sidebarOpen() && !isMobile()">
        <ng-content />
      </main>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
    }

    .layout-container {
      display: flex;
      position: relative;
    }

    .sidebar-overlay {
      position: fixed;
      inset: 0;
      top: 64px;
      background: rgba(0, 0, 0, 0.5);
      z-index: 99;
      cursor: pointer;
    }
    
    .pitaia-main {
      flex: 1;
      padding: 1.5rem;
      background: var(--tui-background-base);
      min-height: calc(100vh - 64px);
      width: 100%;
      transition: margin-left 0.3s ease;
    }

    @media (max-width: 768px) {
      .pitaia-main {
        padding: 1rem;
        margin-left: 0 !important;
      }
    }

    @media (max-width: 480px) {
      .pitaia-main {
        padding: 0.75rem;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '(window:resize)': 'onResize()',
  },
})
export class LayoutComponent {
  protected expanded = signal(false);
  protected sidebarOpen = signal(false);
  protected isMobile = signal(false);

  constructor() {
    this.checkScreenSize();
  }

  protected onResize(): void {
    this.checkScreenSize();
  }

  private checkScreenSize(): void {
    if (typeof window !== 'undefined') {
      this.isMobile.set(window.innerWidth < 769);
      if (this.isMobile()) {
        this.sidebarOpen.set(false);
      }
    }
  }

  toggleSidebar(): void {
    this.sidebarOpen.update(v => !v);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }
}
