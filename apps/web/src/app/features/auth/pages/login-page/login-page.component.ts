import { ChangeDetectionStrategy, Component, inject, signal, OnInit } from '@angular/core';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TuiButton, TuiIcon, TuiTextfield, TuiLoader, TuiLink } from '@taiga-ui/core';
import { TuiPassword } from '@taiga-ui/kit';
import { TuiCardLarge, TuiHeader } from '@taiga-ui/layout';
import { LayoutComponent } from '../../../../shared/components/layout/layout.component';
import { AuthService } from '../../../../core/services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login-page',
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
              Bem-vindo de volta!
              <span class="auth-subtitle">Faça login para acompanhar seus pedidos</span>
            </h1>
          </header>

          <div class="form-fields">
            <tui-textfield>
              <label tuiLabel for="email">E-mail ou telefone</label>
              <input
                id="email"
                tuiTextfield
                formControlName="email"
                type="email"
                autocomplete="email"
              />
            </tui-textfield>

            <tui-textfield>
              <label tuiLabel for="password">Senha</label>
              <input
                id="password"
                tuiTextfield
                formControlName="password"
                type="password"
                autocomplete="current-password"
              />
              <tui-icon tuiPassword />
            </tui-textfield>
          </div>

          <button
            tuiButton
            appearance="primary"
            size="l"
            type="submit"
            class="submit-button"
            [disabled]="form.invalid || loading()"
          >
            @if (loading()) {
              <tui-loader size="s" />
            } @else {
              Entrar
            }
          </button>

          <div class="auth-footer">
            <span>Não tem uma conta?</span>
            <a tuiLink routerLink="/register">Cadastre-se</a>
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
export class LoginPageComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private authService = inject(AuthService);
  private notificationService = inject(NotificationService);

  protected loading = signal(false);
  private returnUrl = '/menu';

  protected form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  ngOnInit(): void {
    // Captura a URL de retorno dos query params
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] ?? '/menu';
    
    // Se já estiver autenticado, redireciona
    if (this.authService.isAuthenticated()) {
      this.router.navigate([this.returnUrl]);
    }
  }

  protected onSubmit(): void {
    if (this.form.invalid) return;

    this.loading.set(true);
    const { email, password } = this.form.value;

    if (!email || !password) return;

    this.authService.login({ email, password }).subscribe({
      next: () => {
        this.notificationService.success('Login realizado com sucesso!');
        this.router.navigate([this.returnUrl]);
      },
      error: (err) => {
        this.notificationService.error('E-mail ou senha incorretos');
        this.loading.set(false);
        console.error('Login error:', err);
      },
    });
  }
}
