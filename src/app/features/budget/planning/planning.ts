import { HeaderActions } from '@/core/layout/header-actions';
import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScopeSwitch } from '@/features/budget/ui/scope-switch';
import { MoneyPipe } from '@/shared/pipes/money';
import { ShortDatePipe } from '@/shared/pipes/short-date';
import { LimitProgress, SavingsGoal } from '@/features/budget/data/budget.model';
import { BudgetStore } from '@/features/budget/data/budget.store';

@Component({
  selector: 'app-planning',
  imports: [HeaderActions, RouterLink, ScopeSwitch, MoneyPipe, ShortDatePipe],
  templateUrl: './planning.html',
  styleUrl: './planning.css',
})
export class Planning {
  protected readonly store = inject(BudgetStore);

  protected removeLimit(limit: LimitProgress): void {
    if (confirm(`Удалить лимит «${limit.name}»?`)) this.store.deleteLimit(limit.id).subscribe();
  }

  protected removeGoal(goal: SavingsGoal): void {
    if (confirm(`Удалить цель «${goal.name}»?`)) this.store.deleteGoal(goal.id).subscribe();
  }
}
