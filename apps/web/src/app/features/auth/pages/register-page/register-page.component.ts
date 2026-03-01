import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield, TuiLoader, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register-page',
  imports: [
    RouterLink,
    ReactiveFormsModule,
    LayoutComponent,
    TuiButton,
    TuiIcon,
    TuiTextfield,
    TuiLoader,
    TuiLink,
    TuiPassword,
    TuiCardLarge,
    TuiHeader,
  ],
  template: `
    <app-layout>
      <div class="auth-container">
        <form 
          tuiCardLarge 
          class="auth-card"
          [formGroup]="form"
          (ngSubmit)="onSubmit()"
        >
          <header tuiHeader>
            <h1 class="auth-title">
              Crie sua conta
              <span class="auth-subtitle">Cadastre-se para fazer pedidos e acompanhar entregas</span>
            </h1>
          </header>

          <div class="form-fields">
            <tui-textfield>
              <label tuiLabel for="name">Nome completo</label>
              <input
                id="name"
                tuiTextfield
                formControlName="name"
                autocomplete="name"
              />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="phone">Telefone</label>
              <input
                id="phone"
                tuiTextfield
                formControlName="phone"
                type="tel"
                autocomplete="tel"
                placeholder="(11) 99999-9999"
              />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="email">E-mail (opcional)</label>
              <input
                id="email"
                tuiTextfield
                formControlName="email"
                type="email"
                autocomplete="email"
              />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="cpf">CPF (opcional)</label>
              <input
                id="cpf"
                tuiTextfield
                formControlName="cpf"
                placeholder="000.000.000-00"
              />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="password">Senha</label>
              <input
                id="password"
                tuiTextfield
                formControlName="password"
                type="password"
                autocomplete="new-password"
              />
              <tui-icon tuiPassword />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="confirmPassword">Confirmar senha</label>
              <input
                id="confirmPassword"
                tuiTextfield
                formControlName="confirmPassword"
                type="password"
                autocomplete="new-password"
              />
              <tui-icon tuiPassword />
            </tui-textfield>
          </div>

          @if (passwordMismatch()) {
            <p class="error-message" role="alert">
              As senhas não coincidem
            </p>
          }

          <button
            tuiButton
            appearance="primary"
            size="l"
            type="submit"
            class="submit-button"
            [disabled]="form.invalid || loading() || passwordMismatch()"
          >
            @if (loading()) {
              <tui-loader size="s" />
            } @else {
              Criar conta
            }
          </button>

          <div class="auth-footer">
            <span>Já tem uma conta?</span>
            <a tuiLink routerLink="/login">Fazer login</a>
          </div>
        </form>
      </div>
    </app-layout>
  `,
  styles: [`
    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: calc(100vh - 200px);
      padding: 2rem 1rem;
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2rem;
    }

    .auth-title {
      font-size: 1.5rem;
      font-weight: 700;
      margin: 0;
      color: var(--tui-text-primary);
    }

    .auth-subtitle {
      display: block;
      font-size: 0.875rem;
      font-weight: 400;
      color: var(--tui-text-secondary);
      margin-top: 0.25rem;
    }

    .form-fields {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin: 1.5rem 0;
    }

    .error-message {
      color: var(--tui-status-negative);
      font-size: 0.875rem;
      margin: 0 0 1rem;
      text-align: center;
    }

    .submit-button {
      width: 100%;
      margin-bottom: 1.5rem;
    }

    .auth-footer {
      display: flex;
      justify-content: center;
      gap: 0.5rem;
      color: var(--tui-text-secondary);
      font-size: 0.875rem;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPageComponent {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  protected loading = signal(false);

  protected form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(3)]],
    phone: ['', [Validators.required]],
    email: ['', [Validators.email]],
    cpf: [''],
    password: ['', [Validators.required, Validators.minLength(6)]],
    confirmPassword: ['', [Validators.required]],
  });

  protected passwordMismatch = () => {
    const { password, confirmPassword } = this.form.value;
    return password && confirmPassword && password !== confirmPassword;
  };

  protected onSubmit(): void {
    if (this.form.invalid || this.passwordMismatch()) return;

    this.loading.set(true);
    const { name, phone, email, cpf, password } = this.form.value;

    if (!name || !phone) {
      this.notificationService.error('Nome e telefone são obrigatórios');
      this.loading.set(false);
      return;
    }

    this.authService.register({
      name,
      phone,
      email: email || undefined,
      cpf: cpf || undefined,
      password: password || undefined,
    }).subscribe({
      next: () => {
        this.notificationService.success('Conta criada com sucesso!');
        this.router.navigate(['/login']);
      },
      error: (err) => {
        if (err.status === 409) {
          this.notificationService.error('Telefone ou e-mail já cadastrado');
        } else {
          this.notificationService.error('Erro ao criar conta. Tente novamente.');
        }
        this.loading.set(false);
        console.error('Register error:', err);
      },
    });
  }
}
