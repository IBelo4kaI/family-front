import { Component, inject } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { ScopeSwitch } from '@/components/scope-switch';
import { BudgetStore } from '@/stores/budget.store';
import { PaymentView } from '@/models/budget.model';
import { PaymentList, SettleEvent } from '@/components/Budget/payment-list';

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
