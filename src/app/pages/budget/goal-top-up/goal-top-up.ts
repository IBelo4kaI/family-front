import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { MoneyPipe } from '@/pipes/money';
import { BudgetStore } from '@/stores/budget.store';
import { toKopecks } from '@/utils/money';

const MAX_AMOUNT = 999_999_999.99;
const BACK_URL = '/budget/planning';

@Component({
  selector: 'app-goal-top-up',
  imports: [PageHeader, FormField, FormRoot, MoneyPipe],
  templateUrl: './goal-top-up.html',
  styleUrl: '../../../assets/styles/form-page.css',
})
export class GoalTopUp {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly goalId = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';

  protected readonly goal = this.store.findGoal(this.goalId);
  protected readonly model = signal({ amount: null as number | null });

  protected readonly topUpForm = form(
    this.model,
    (path) => {
      required(path.amount, { message: 'Введите сумму' });
      min(path.amount, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.amount, MAX_AMOUNT, { message: 'Слишком большая сумма' });
    },
    {
      submission: {
        action: async () => {
          const { amount } = this.model();
          if (amount === null) return;
          await firstValueFrom(this.store.topUpGoal(this.goalId, toKopecks(amount)));
          await this.router.navigateByUrl(BACK_URL);
        },
      },
    },
  );

  constructor() {
    if (!this.goal) void this.router.navigateByUrl(BACK_URL);
  }
}
