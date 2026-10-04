import { Component, inject } from '@angular/core';
import { PageHeader } from '@/shared/ui/page-header';
import { RouterLink } from '@angular/router';
import { MonthPicker } from '@/shared/ui/month-picker';
import { ScopeSwitch } from '@/features/budget/ui/scope-switch';
import { PERSONAL_MODE_ENABLED } from '@/features/budget/data/budget.constants';
import { BudgetStore } from '@/features/budget/data/budget.store';
import { BalanceCard } from '@/features/budget/ui/balance-card';
import { CategoryBreakdown } from '@/features/budget/ui/category-breakdown';
import { LimitsGoals } from '@/features/budget/ui/limits-goals';
import { RecentTransactions } from '@/features/budget/ui/recent-transactions';
import { UpcomingPayments } from '@/features/budget/ui/upcoming-payments';

@Component({
  selector: 'app-budget',
  imports: [PageHeader, 
    RouterLink,
    ScopeSwitch,
    MonthPicker,
    BalanceCard,
    UpcomingPayments,
    CategoryBreakdown,
    LimitsGoals,
    RecentTransactions,
  ],
  templateUrl: './overview.html',
  styleUrl: './overview.css',
})
export class Budget {
  protected readonly store = inject(BudgetStore);
  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
}
