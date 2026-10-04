import { Component, inject } from '@angular/core';
import { PageHeader } from '@/shared/ui/page-header';
import { ScopeSwitch } from '@/features/budget/ui/scope-switch';
import { BudgetStore } from '@/features/budget/data/budget.store';
import { PaymentView } from '@/features/budget/data/budget.model';
import { PaymentList, SettleEvent } from '@/features/budget/ui/payment-list';

@Component({
  selector: 'app-payments',
  imports: [PageHeader, ScopeSwitch, PaymentList],
  templateUrl: './payments.html',
  styleUrl: './payments.css',
})
export class Payments {
  protected readonly store = inject(BudgetStore);

  protected settle({ ref, action }: SettleEvent): void {
    this.store.settlePayment(ref, action).subscribe();
  }

  protected close(item: PaymentView): void {
    if (confirm(`${item.closeLabel}: «${item.name}»?`)) this.store.closePayment(item.ref).subscribe();
  }
}
