import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { RouterLink } from '@angular/router';
import { MonthPicker } from '@/components/month-picker';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { TransactionView } from '@/models/budget.model';
import { StoredReceiptItem } from '@/models/receipt.model';
import { ReceiptService } from '@/services/receipt.service';
import { BudgetStore } from '@/stores/budget.store';
import { errorMessage } from '@/utils/http-error';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';

@Component({
  selector: 'app-transactions',
  imports: [PageHeader, RouterLink, MonthPicker, MoneyPipe, ShortDatePipe],
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
