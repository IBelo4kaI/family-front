import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/shared/ui/page-header';
import { FormField, FormRoot, email, form, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthService } from '@/core/auth/auth.service';
import { errorMessage } from '@/shared/utils/http-error';

@Component({
  selector: 'app-login',
  imports: [PageHeader, FormField, FormRoot, RouterLink],
  templateUrl: './login.html',
  styles: `
    :host {
      padding: 1rem;
    }
  `,
  styleUrl: '../../../shared/styles/form-page.css',
})
export class Login {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitError = signal('');
  protected readonly model = signal({ email: '', password: '' });

  protected readonly loginForm = form(
    this.model,
    (path) => {
      required(path.email, { message: 'Введите email' });
      email(path.email, { message: 'Некорректный email' });
      required(path.password, { message: 'Введите пароль' });
    },
    {
      submission: {
        action: async () => {
          this.submitError.set('');
          try {
            await firstValueFrom(this.auth.login(this.model()));
            await this.router.navigateByUrl('/');
          } catch (error) {
            this.submitError.set(errorMessage(error));
          }
        },
      },
    },
  );
}
