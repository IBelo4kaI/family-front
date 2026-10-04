import { Component, inject, signal } from '@angular/core';
import { CategoryField } from '@/features/budget/ui/category-field';
import { PageHeader } from '@/shared/ui/page-header';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { todayIso } from '@/shared/utils/iso-date';
import { toKopecks, toRubles } from '@/shared/utils/money';
import { BudgetScope } from '@/features/budget/data/budget.model';
import { PERSONAL_MODE_ENABLED } from '@/features/budget/data/budget.constants';
import { BudgetStore } from '@/features/budget/data/budget.store';

const MAX_AMOUNT = 999_999_999.99;
const MAX_NOTIFY_DAYS = 30;

@Component({
  selector: 'app-card-form',
  imports: [PageHeader, CategoryField, FormField, FormRoot],
  templateUrl: './card-form.html',
  styleUrl: '../../../shared/styles/form-page.css',
})
export class CardForm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly existing = this.editId ? this.store.findCard(this.editId) : undefined;

  protected readonly isEdit = this.editId !== null;

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly model = signal({
    bank: this.existing?.bank ?? '',
    amountDue: (this.existing ? toRubles(this.existing.amountDue) : null) as number | null,
    dueDate: this.existing?.dueDate ?? todayIso(),
    categoryId: this.existing?.categoryId ?? 'payments',
    notifyDaysBefore: (this.existing?.notifyDaysBefore ?? 3) as number | null,
    scope: (this.existing?.scope ?? this.store.scope()) as BudgetScope,
    creditLimit: (this.existing?.creditLimit === undefined ? null : toRubles(this.existing.creditLimit)) as
      | number
      | null,
  });

  protected readonly cardForm = form(
    this.model,
    (path) => {
      required(path.bank, { message: 'Введите название или банк' });
      required(path.amountDue, { message: 'Введите сумму' });
      min(path.amountDue, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.amountDue, MAX_AMOUNT, { message: 'Слишком большая сумма' });
      required(path.dueDate, { message: 'Выберите дату' });
      required(path.categoryId, { message: 'Выберите категорию' });
      required(path.notifyDaysBefore, { message: 'Укажите, за сколько дней напомнить' });
      min(path.notifyDaysBefore, 0, { message: 'Не меньше нуля' });
      max(path.notifyDaysBefore, MAX_NOTIFY_DAYS, { message: `Не больше ${MAX_NOTIFY_DAYS} дней` });
      min(path.creditLimit, 0.01, { message: 'Лимит должен быть больше нуля' });
      max(path.creditLimit, MAX_AMOUNT, { message: 'Слишком большая сумма' });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          if (value.amountDue === null || value.notifyDaysBefore === null) return;
          const draft = {
            bank: value.bank.trim(),
            amountDue: toKopecks(value.amountDue),
            dueDate: value.dueDate,
            categoryId: value.categoryId,
            notifyDaysBefore: value.notifyDaysBefore,
            scope: value.scope,
            creditLimit: value.creditLimit === null ? undefined : toKopecks(value.creditLimit),
          };
          await firstValueFrom(
            this.editId ? this.store.updateCard(this.editId, draft) : this.store.addCard(draft),
          );
          this.store.scope.set(value.scope);
          await this.router.navigateByUrl('/budget/payments');
        },
      },
    },
  );


  constructor() {
    if (this.editId && !this.existing) void this.router.navigateByUrl('/budget/payments');
  }
}
