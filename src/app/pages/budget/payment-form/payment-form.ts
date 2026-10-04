import { Component, inject, signal } from '@angular/core';
import { CategoryField } from '@/components/category-field';
import { PageHeader } from '@/components/Layout/page-header';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { todayIso } from '@/utils/iso-date';
import { toKopecks, toRubles } from '@/utils/money';
import { BudgetScope, RecurringPayment } from '@/models/budget.model';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetStore } from '@/stores/budget.store';

const MAX_AMOUNT = 999_999_999.99;
const MAX_NOTIFY_DAYS = 30;

@Component({
  selector: 'app-payment-form',
  imports: [PageHeader, CategoryField, FormField, FormRoot],
  templateUrl: './payment-form.html',
  styleUrl: '../../../assets/styles/form-page.css',
})
export class PaymentForm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly existing = this.editId ? this.store.findPayment(this.editId) : undefined;

  protected readonly isEdit = this.editId !== null;

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly model = signal({
    kind: (this.existing?.kind ?? 'subscription') as RecurringPayment['kind'],
    name: this.existing?.name ?? '',
    amount: (this.existing ? toRubles(this.existing.amount) : null) as number | null,
    period: (this.existing?.period ?? 'month') as RecurringPayment['period'],
    nextDate: this.existing?.nextDate ?? todayIso(),
    categoryId: this.existing?.categoryId ?? 'payments',
    notifyDaysBefore: (this.existing?.notifyDaysBefore ?? 3) as number | null,
    scope: (this.existing?.scope ?? this.store.scope()) as BudgetScope,
    totalAmount: (this.existing?.totalAmount === undefined ? null : toRubles(this.existing.totalAmount)) as
      | number
      | null,
    endDate: this.existing?.endDate ?? '',
  });

  protected readonly paymentForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Введите название' });
      required(path.amount, { message: 'Введите сумму' });
      min(path.amount, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.amount, MAX_AMOUNT, { message: 'Слишком большая сумма' });
      required(path.nextDate, { message: 'Выберите дату' });
      required(path.categoryId, { message: 'Выберите категорию' });
      required(path.notifyDaysBefore, { message: 'Укажите, за сколько дней напомнить' });
      min(path.notifyDaysBefore, 0, { message: 'Не меньше нуля' });
      max(path.notifyDaysBefore, MAX_NOTIFY_DAYS, { message: `Не больше ${MAX_NOTIFY_DAYS} дней` });
      min(path.totalAmount, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.totalAmount, MAX_AMOUNT, { message: 'Слишком большая сумма' });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          if (value.amount === null || value.notifyDaysBefore === null) return;
          const loan =
            value.kind === 'loan'
              ? {
                  totalAmount: value.totalAmount === null ? undefined : toKopecks(value.totalAmount),
                  endDate: value.endDate || undefined,
                }
              : {};
          const draft = {
            name: value.name.trim(),
            kind: value.kind,
            amount: toKopecks(value.amount),
            period: value.period,
            nextDate: value.nextDate,
            categoryId: value.categoryId,
            notifyDaysBefore: value.notifyDaysBefore,
            scope: value.scope,
            ...loan,
          };
          await firstValueFrom(
            this.editId ? this.store.updatePayment(this.editId, draft) : this.store.addPayment(draft),
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
