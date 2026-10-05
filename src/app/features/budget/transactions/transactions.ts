import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MonthPicker } from '@/shared/ui/month-picker';
import { MoneyPipe } from '@/shared/pipes/money';
import { ShortDatePipe } from '@/shared/pipes/short-date';
import { TransactionView } from '@/features/budget/data/budget.model';
import { StoredReceiptItem } from '@/features/budget/data/receipt.model';
import { ReceiptService } from '@/features/budget/data/receipt.service';
import { BudgetStore } from '@/features/budget/data/budget.store';
import { errorMessage } from '@/shared/utils/http-error';
import { PERSONAL_MODE_ENABLED } from '@/features/budget/data/budget.constants';

@Component({
  selector: 'app-transactions',
  imports: [RouterLink, MonthPicker, MoneyPipe, ShortDatePipe],
  templateUrl: './transactions.html',
  styleUrl: './transactions.css',
})
export class Transactions {
  protected readonly store = inject(BudgetStore);
  private readonly receipts = inject(ReceiptService);
  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;

  protected readonly openId = signal<string | null>(null);
  protected readonly receiptItems = signal<StoredReceiptItem[]>([]);
  protected readonly itemsError = signal('');

  protected toggleItems(item: TransactionView): void {
    if (this.openId() === item.id) {
      this.openId.set(null);
      return;
    }
    this.openId.set(item.id);
    this.receiptItems.set([]);
    this.itemsError.set('');
    this.receipts.items(item.id).subscribe({
      next: (items) => this.receiptItems.set(items),
      error: (error: unknown) => this.itemsError.set(errorMessage(error)),
    });
  }

  protected remove(item: TransactionView): void {
    if (confirm(`Удалить транзакцию «${item.categoryName}»?`)) this.store.deleteTransaction(item.id).subscribe();
  }
}
