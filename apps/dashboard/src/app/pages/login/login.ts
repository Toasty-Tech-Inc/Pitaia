import {AsyncPipe, NgIf} from '@angular/common';
import {ChangeDetectionStrategy, Component, inject} from '@angular/core';
import {FormControl, FormGroup, ReactiveFormsModule, Validators} from '@angular/forms';
import {
    TuiAppearance,
    TuiButton,
    TuiError,
    TuiIcon,
    TuiNotification,
    TuiTextfield,
    TuiTitle,
} from '@taiga-ui/core';
import {TuiFieldErrorPipe, TuiSegmented, TuiSwitch, TuiTooltip} from '@taiga-ui/kit';
import {TuiCardLarge, TuiForm, TuiHeader} from '@taiga-ui/layout';
import { UserService } from '../../services/user.service';
import {RouterLink} from '@angular/router';
import {TuiLink} from '@taiga-ui/core';

@Component({
  selector: 'app-login',
  imports: [
           AsyncPipe,
        NgIf,
        ReactiveFormsModule,
        TuiAppearance,
        TuiButton,
        TuiCardLarge,
        TuiError,
        TuiFieldErrorPipe,
        TuiForm,
        TuiHeader,
        TuiIcon,
        TuiNotification,
        TuiSegmented,
        TuiSwitch,
        TuiTextfield,
        TuiTitle,
        TuiTooltip,
        TuiLink,
        RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Login {
  private userService = inject(UserService);

  protected readonly form = new FormGroup({
    email: new FormControl('', Validators.required),
    password: new FormControl('', Validators.required),
    subscribe: new FormControl(false),
    basic: new FormControl(true),
  });

  login(): void {
    if (this.form.invalid) return;
    
    const { email, password } = this.form.value;
    if (!email || !password) return;

    this.userService.login(email, password).subscribe({
      next: () => {
        console.log('Login bem sucedido!');
      },
      error: (err) => {
        console.error('Erro no login:', err);
      },
    });
  }
}
