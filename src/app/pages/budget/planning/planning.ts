import { Component, inject } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { RouterLink } from '@angular/router';
import { ScopeSwitch } from '@/components/scope-switch';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { LimitProgress, SavingsGoal } from '@/models/budget.model';
import { BudgetStore } from '@/stores/budget.store';

@Component({
  selector: 'app-planning',
  imports: [PageHeader, RouterLink, ScopeSwitch, MoneyPipe, ShortDatePipe],
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
