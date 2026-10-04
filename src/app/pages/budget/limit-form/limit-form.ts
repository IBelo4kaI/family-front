import { Component, computed, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BudgetScope } from '@/models/budget.model';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetStore } from '@/stores/budget.store';
import { toKopecks, toRubles } from '@/utils/money';

const MAX_AMOUNT = 999_999_999.99;
const BACK_URL = '/budget/planning';

@Component({
  selector: 'app-limit-form',
  imports: [PageHeader, FormField, FormRoot],
  templateUrl: './limit-form.html',
  styleUrl: '../../../assets/styles/form-page.css',
})
export class LimitForm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly existing = this.editId ? this.store.findLimit(this.editId) : undefined;

  protected readonly isEdit = this.editId !== null;
  protected readonly duplicateError = signal(false);

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly model = signal({
    categoryId: this.existing?.categoryId ?? '',
    amount: (this.existing ? toRubles(this.existing.limit) : null) as number | null,
    scope: (this.existing?.scope ?? this.store.scope()) as BudgetScope,
  });

  protected readonly limitForm = form(
    this.model,
    (path) => {
      required(path.categoryId, { message: 'Выберите категорию' });
      required(path.amount, { message: 'Введите сумму' });
      min(path.amount, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.amount, MAX_AMOUNT, { message: 'Слишком большая сумма' });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          if (value.amount === null) return;
          if (this.store.hasLimit(value.categoryId, value.scope, this.editId ?? undefined)) {
            this.duplicateError.set(true);
            return;
          }
          const draft = { categoryId: value.categoryId, limit: toKopecks(value.amount), scope: value.scope };
          await firstValueFrom(
            this.editId ? this.store.updateLimit(this.editId, draft) : this.store.addLimit(draft),
          );
          this.store.scope.set(value.scope);
          await this.router.navigateByUrl(BACK_URL);
        },
      },
    },
  );

  protected readonly categories = computed(() =>
    this.store.categories().filter((c) => c.kind === 'expense'),
  );

  constructor() {
    if (this.editId && !this.existing) void this.router.navigateByUrl(BACK_URL);
  }
}
