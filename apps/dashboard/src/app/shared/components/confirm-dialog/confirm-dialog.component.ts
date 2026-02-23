import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TuiButton } from '@taiga-ui/core';
import { POLYMORPHEUS_CONTEXT } from '@taiga-ui/polymorpheus';
import { TuiDialogContext } from '@taiga-ui/core';

export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmAppearance?: string;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TuiButton],
  template: `
    <div class="confirm-dialog">
      <h3 class="title">{{ context.data.title }}</h3>
      <p class="message">{{ context.data.message }}</p>
      
      <div class="actions">
        <button
          tuiButton
          appearance="secondary"
          (click)="context.completeWith(false)"
        >
          {{ context.data.cancelLabel || 'Cancelar' }}
        </button>
        <button
          tuiButton
          [appearance]="context.data.confirmAppearance || 'primary'"
          (click)="context.completeWith(true)"
        >
          {{ context.data.confirmLabel || 'Confirmar' }}
        </button>
      </div>
    </div>
  `,
  styles: [`
    .confirm-dialog {
      padding: 1.5rem;
      max-width: 400px;
    }

    .title {
      margin: 0 0 1rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .message {
      margin: 0 0 1.5rem;
      color: var(--tui-text-secondary);
      line-height: 1.5;
    }

    .actions {
      display: flex;
      gap: 0.75rem;
      justify-content: flex-end;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmDialogComponent {
  readonly context = inject<TuiDialogContext<boolean, ConfirmDialogData>>(POLYMORPHEUS_CONTEXT);
}
