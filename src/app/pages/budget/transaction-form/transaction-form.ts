import { Component, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { CategoryField } from '@/components/category-field';
import { PageHeader } from '@/components/Layout/page-header';
import { firstValueFrom } from 'rxjs';
import { todayIso } from '@/utils/iso-date';
import { toKopecks, toRubles } from '@/utils/money';
import { BudgetScope, TransactionType } from '@/models/budget.model';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetStore } from '@/stores/budget.store';

const MAX_AMOUNT = 999_999_999.99;

@Component({
  selector: 'app-transaction-form',
  imports: [PageHeader, CategoryField, FormField, FormRoot],
  templateUrl: './transaction-form.html',
  styleUrl: '../../../assets/styles/form-page.css',
})
export class TransactionForm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly existing = this.editId ? this.store.findTransaction(this.editId) : undefined;

  protected readonly isEdit = this.editId !== null;

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly model = signal({
    type: (this.existing?.type ?? 'expense') as TransactionType,
    amount: (this.existing ? toRubles(this.existing.amount) : null) as number | null,
    date: this.existing?.date ?? todayIso(),
    categoryId: this.existing?.categoryId ?? '',
    scope: (this.existing?.scope ?? this.store.scope()) as BudgetScope,
  });

  protected readonly transactionForm = form(
    this.model,
    (path) => {
      required(path.amount, { message: 'Введите сумму' });
      min(path.amount, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.amount, MAX_AMOUNT, { message: 'Слишком большая сумма' });
      required(path.date, { message: 'Выберите дату' });
      required(path.categoryId, { message: 'Выберите категорию' });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          if (value.amount === null) return;
          const draft = { ...value, amount: toKopecks(value.amount) };
          await firstValueFrom(
            this.editId ? this.store.updateTransaction(this.editId, draft) : this.store.addTransaction(draft),
          );
          this.store.scope.set(value.scope);
          await this.router.navigateByUrl(this.isEdit ? '/budget/transactions' : '/budget');
        },
      },
    },
  );


  constructor() {
    if (this.editId && !this.existing) void this.router.navigateByUrl('/budget/transactions');
  }

  protected resetCategory(): void {
    this.transactionForm.categoryId().reset('');
  }
}
