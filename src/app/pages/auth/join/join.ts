import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { FormField, FormRoot, email, form, minLength, required } from '@angular/forms/signals';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { ColorPicker } from '@/components/color-picker';
import { AuthService } from '@/services/auth/auth.service';
import { errorMessage } from '@/utils/http-error';

const MIN_PASSWORD = 8;

@Component({
  selector: 'app-join',
  imports: [PageHeader, FormField, FormRoot, RouterLink, ColorPicker],
  templateUrl: './join.html',
  styles: `
    :host {
      padding: 1rem;
    }
  `,
  styleUrl: '../../../assets/styles/form-page.css',
})
export class Join {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly submitError = signal('');
  protected readonly model = signal({
    code: inject(ActivatedRoute).snapshot.queryParamMap.get('code') ?? '',
    name: '',
    email: '',
    password: '',
    color: '330 60% 58%',
  });

  protected readonly joinForm = form(
    this.model,
    (path) => {
      required(path.code, { message: 'Введите код приглашения' });
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
            await firstValueFrom(
              this.auth.join({ ...this.model(), code: this.model().code.trim() }),
            );
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
