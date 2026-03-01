import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TuiIcon, TuiLink } from '@taiga-ui/core';
import { EstablishmentService } from '../../../core/services/establishment.service';

@Component({
  selector: 'app-footer',
  imports: [TuiIcon, TuiLink],
  template: `
    <footer class="footer" role="contentinfo">
      <div class="footer-content">
        <div class="footer-section">
          <h3 class="footer-title">{{ establishment()?.name ?? 'Pitaia' }}</h3>
          @if (establishment()?.description) {
            <p class="footer-description">{{ establishment()!.description }}</p>
          }
        </div>

        <div class="footer-section">
          <h4 class="footer-subtitle">Contato</h4>
          @if (establishment()?.phone) {
            <a [href]="'tel:' + establishment()!.phone" tuiLink class="footer-link">
              <tui-icon icon="@tui.phone" />
              {{ establishment()!.phone }}
            </a>
          }
          @if (establishment()?.email) {
            <a [href]="'mailto:' + establishment()!.email" tuiLink class="footer-link">
              <tui-icon icon="@tui.mail" />
              {{ establishment()!.email }}
            </a>
          }
        </div>

        @if (establishment()?.address) {
          <div class="footer-section">
            <h4 class="footer-subtitle">Endereço</h4>
            <address class="footer-address">
              {{ establishment()!.address!.street }}, {{ establishment()!.address!.number }}
              @if (establishment()!.address!.complement) {
                - {{ establishment()!.address!.complement }}
              }
              <br />
              {{ establishment()!.address!.neighborhood }} - {{ establishment()!.address!.city }}/{{ establishment()!.address!.state }}
              <br />
              CEP: {{ establishment()!.address!.zipCode }}
            </address>
          </div>
        }
      </div>

      <div class="footer-bottom">
        <p>Desenvolvido com ❤️ por <a href="https://pitaia.app" tuiLink target="_blank" rel="noopener">Pitaia</a></p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: var(--tui-background-neutral-1);
      border-top: 1px solid var(--tui-border-normal);
      margin-top: auto;
    }

    .footer-content {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem 1rem;
    }

    .footer-section {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .footer-title {
      font-size: 1.25rem;
      font-weight: 700;
      color: #FE3867;
      margin: 0;
    }

    .footer-subtitle {
      font-size: 1rem;
      font-weight: 600;
      color: var(--tui-text-primary);
      margin: 0;
    }

    .footer-description {
      color: var(--tui-text-secondary);
      margin: 0;
      line-height: 1.5;
    }

    .footer-link {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: var(--tui-text-secondary);
    }

    .footer-address {
      font-style: normal;
      color: var(--tui-text-secondary);
      line-height: 1.6;
    }

    .footer-bottom {
      text-align: center;
      padding: 1rem;
      border-top: 1px solid var(--tui-border-normal);
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
    }

    .footer-bottom p {
      margin: 0;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  private establishmentService = inject(EstablishmentService);
  protected establishment = this.establishmentService.establishment;
}
