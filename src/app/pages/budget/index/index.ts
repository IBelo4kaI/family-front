import { Component, inject } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { RouterLink } from '@angular/router';
import { MonthPicker } from '@/components/month-picker';
import { ScopeSwitch } from '@/components/scope-switch';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetStore } from '@/stores/budget.store';
import { BalanceCard } from '@/components/Budget/balance-card';
import { CategoryBreakdown } from '@/components/Budget/category-breakdown';
import { LimitsGoals } from '@/components/Budget/limits-goals';
import { RecentTransactions } from '@/components/Budget/recent-transactions';
import { UpcomingPayments } from '@/components/Budget/upcoming-payments';

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
  templateUrl: './index.html',
  styleUrl: './index.css',
})
export class Budget {
  protected readonly store = inject(BudgetStore);
  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
}
