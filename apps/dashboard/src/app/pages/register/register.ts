import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { TuiButton, TuiTextfield, TuiTitle } from '@taiga-ui/core';
import { TuiForm, TuiHeader } from '@taiga-ui/layout';
import {TuiInputPhone} from '@taiga-ui/kit';
import { UserService } from '../../services/user.service';

@Component({
    standalone: true,
    selector: 'app-user-register',
    imports: [
        FormsModule,
        TuiButton,
        TuiTextfield,
        TuiTitle,
        TuiForm,
        TuiHeader,
        TuiInputPhone
    ],
    template: `
        <div class="register-container">
            <form tuiForm="m" #form="ngForm" (ngSubmit)="onSubmit(form)">
                <header tuiHeader>
                    <h2 tuiTitle>
                        Criar Conta
                        <span tuiSubtitle>Seja bem-vindo ao Pitaia!</span>
                    </h2>
                </header>

                <div class="form-field">
                    <tui-textfield>
                        <label tuiLabel for="name">Nome</label>
                        <input
                            tuiTextfield
                            id="name"
                            name="name"
                            required
                            [(ngModel)]="name"
                            autocomplete="name"
                            [style.borderColor]="primaryColor"
                        />
                    </tui-textfield>
                </div>

                <div class="form-field">
                    <tui-textfield>
                        <label tuiLabel for="email">Email</label>
                        <input
                            tuiTextfield
                            id="email"
                            name="email"
                            type="email"
                            required
                            [(ngModel)]="email"
                            autocomplete="email"
                            [style.borderColor]="primaryColor"
                        />
                    </tui-textfield>
                </div>
                <div class="form-field">
                <tui-textfield>

                    <label tuiLabel for="phone">Telefone</label>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        tuiInputPhone
                        mask="+55 (##) #####-####"
                        required
                        [(ngModel)]="phone"
                        autocomplete="tel"
                        [style.borderColor]="primaryColor"
                    />
                </tui-textfield>
                </div>

                <div class="form-field">
                    <tui-textfield>
                        <label tuiLabel for="password">Senha</label>
                        <input
                            tuiTextfield
                            id="password"
                            name="password"
                            type="password"
                            required
                            [(ngModel)]="password"
                            autocomplete="new-password"
                            [style.borderColor]="primaryColor"
                        />
                    </tui-textfield>
                </div>

                <footer>
                    <button
                        tuiButton
                        class="pitaia-primary-btn"
                        [style.backgroundColor]="primaryColor"
                        [style.color]="lightColor"
                        type="submit"
                    >
                        Criar Conta
                    </button>
                </footer>
            </form>
        </div>
    `,
    styles: [`
        :host {
            --pitaia-primary: #FE3867;
            --pitaia-success: #38D9A9;
            --pitaia-warning: #FFC107;
            --pitaia-deg: linear-gradient(45deg, #FE3867 0%, #38D9A9 100%);
        }

        .register-container {
            max-width: 440px;
            margin: 3.2rem auto;
            padding: 2.5rem 2rem 2rem 2rem;
            background: white;
            border-radius: 20px;
            border-top: 6px solid var(--pitaia-primary);
            box-shadow: 0 6px 30px rgba(254, 56, 103, 0.13), 0 2px 18px #38d9a914;
        }

        .header-gradient {
            background: var(--pitaia-deg);
            color: white;
            border-radius: 15px 15px 0 0;
            margin: -2.5rem -2rem 2.5rem -2rem;
            padding: 1.3rem 2rem 1.1rem 2rem;
            box-shadow: 0 4px 20px #fe386754;
        }

        .form-field {
            margin-bottom: 1.27rem;
            display: flex;
            flex-direction: column;
        }

        .input-animated:focus-within, .input-animated.ng-valid:not(.ng-pristine) {
            box-shadow: 0 2px 0 0 var(--pitaia-success);
            background: linear-gradient(90deg, #FE38671A 30%, #38D9A90A 100%);
            border-radius: 7px;
        }

        .input-animated.ng-invalid.ng-touched {
            animation: shake 0.15s 2;
            border-left: 3px solid var(--pitaia-primary);
        }

        .pitaia-primary-btn {
            background: var(--pitaia-primary);
            color: white;
            font-weight: 700;
            padding: 0.85rem 2.0rem 0.85rem 1.3rem;
            border-radius: 8px;
            border: none;
            font-size: 1.08rem;
            margin-top: 0.7rem;
            display: flex; gap: 0.53rem; align-items: center; justify-content: center;
            box-shadow: 0px 2px 8px #fe386750;
            transition: background 0.16s, filter 0.16s;
        }
        .pitaia-primary-btn:disabled { filter: grayscale(.4) brightness(1.12); cursor: not-allowed; opacity: 0.7; }
        .pitaia-primary-btn:hover:not(:disabled) { background: var(--pitaia-success); filter: brightness(1.05); }

        .btn-icon { font-size: 1.25em; transition: color 0.25s, box-shadow 0.25s; vertical-align: middle;}
        .btn-icon.glow-green { color: var(--pitaia-success); text-shadow: 0px 0px 5px #38d9a9bb; }

        /* Animations */
        .animate-fade-in { animation: fadeIn 0.7s cubic-bezier(.14,.79,.24,1.1) both; }
        .animate-shake   { animation: shake 0.19s 2; background: #FE386725; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: none; } }
        @keyframes shake { 10%, 90% { transform: translateX(-3px); } 20%, 80% { transform: translateX(3px); } 30%,50%,70% { transform: translateX(-6px); } 40%, 60% { transform: translateX(6px); } }

        tui-error { font-size: .93em; color: var(--pitaia-primary); margin: 0.05rem 0 0 0.1rem; }

        @media (max-width: 600px) {
            .register-container { margin: 0.2rem; padding: 1rem; }
            .header-gradient { margin: -1rem -1rem 1.2rem -1rem; padding: 0.95rem 1.1rem; }
        }
    `],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Register {
    private userService = inject(UserService);
    primaryColor = '#FE3867';
    lightColor = '#F5F5F5';

    name = '';
    email = '';
    phone = '';
    password = '';

    onSubmit(form: NgForm): void {
        if (form.valid) {
            // Troque por chamada à API de cadastro conforme sua necessidade
            console.log('Cadastro realizado:', { name: this.name, email: this.email, phone: this.phone });
            this.userService.register(this.name, this.email, this.password, this.phone);
        }
    }
}
