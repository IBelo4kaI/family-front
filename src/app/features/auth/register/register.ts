import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/core/layout/page-header';
import { FormField, FormRoot, email, form, minLength, required } from '@angular/forms/signals';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ColorPicker } from '@/shared/ui/color-picker';
import { AuthService } from '@/core/auth/auth.service';
import { errorMessage } from '@/shared/utils/http-error';

const MIN_PASSWORD = 8;

@Component({
  selector: 'app-register',
  imports: [PageHeader, FormField, FormRoot, RouterLink, ColorPicker],
  templateUrl: './register.html',
  styles: `
    :host {
      padding: 1rem;
    }
  `,
  styleUrl: '../../../shared/styles/form-page.css',
})
export class Register {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitError = signal('');
  protected readonly model = signal({
    familyName: '',
    name: '',
    email: '',
    password: '',
    color: '210 70% 50%',
  });

  protected readonly registerForm = form(
    this.model,
    (path) => {
      required(path.familyName, { message: 'Введите название семьи' });
      required(path.name, { message: 'Введите имя' });
      required(path.email, { message: 'Введите email' });
      email(path.email, { message: 'Некорректный email' });
      required(path.password, { message: 'Введите пароль' });
      minLength(path.password, MIN_PASSWORD, {
        message: `Пароль не короче ${MIN_PASSWORD} символов`,
      });
    },
    {
      submission: {
        action: async () => {
          this.submitError.set('');
          try {
            await firstValueFrom(this.auth.register(this.model()));
            await this.router.navigateByUrl('/');
          } catch (error) {
            this.submitError.set(errorMessage(error));
          }
        },
      },
    },
  );

  protected setColor(color: string): void {
    this.model.update((value) => ({ ...value, color }));
  }
}
