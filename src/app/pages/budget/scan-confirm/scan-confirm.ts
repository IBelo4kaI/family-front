import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { CategoryField } from '@/components/category-field';
import { PageHeader } from '@/components/Layout/page-header';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetScope } from '@/models/budget.model';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { ReceiptService } from '@/services/receipt/receipt.service';
import { BudgetStore } from '@/stores/budget.store';
import { errorMessage } from '@/utils/http-error';

@Component({
  selector: 'app-scan-confirm',
  imports: [PageHeader, CategoryField, FormField, FormRoot, MoneyPipe, ShortDatePipe],
  templateUrl: './scan-confirm.html',
  styleUrls: ['../../../assets/styles/form-page.css', './scan-confirm.css'],
})
export class ScanConfirm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  protected readonly receipts = inject(ReceiptService);

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly saving = signal(false);

  protected readonly model = signal({ scope: this.store.scope() as BudgetScope });

  protected readonly confirmForm = form(this.model, () => {}, {
    submission: {
      action: async () => {
        const pending = this.receipts.queue();
        if (!pending.length || this.saving()) return;

        // Без категории чек не сохраняем, остальные уходят
        for (const item of pending.filter((p) => !p.categoryId)) {
          this.receipts.patch(item.id, { error: 'Выберите категорию' });
        }

        this.saving.set(true);
        // По одному: ошибка на одном чеке не мешает остальным
        for (const item of pending.filter((p) => p.categoryId)) {
          try {
            const created = await firstValueFrom(
              this.receipts.save({ ...item.receipt, categoryId: item.categoryId, scope: this.model().scope }),
            );
            this.store.appendTransaction(created);
            this.receipts.remove(item.id);
          } catch (error) {
            this.receipts.patch(item.id, { error: errorMessage(error) });
          }
        }
        this.saving.set(false);

        if (!this.receipts.queue().length) await this.router.navigateByUrl('/budget');
      },
    },
  });


  protected readonly total = computed(() =>
    this.receipts.queue().reduce((sum, p) => sum + p.receipt.totalSum, 0),
  );

  constructor() {
    if (!this.receipts.queue().length) void this.router.navigateByUrl('/budget/scan');
  }

  protected setCategory(id: string, categoryId: string): void {
    this.receipts.patch(id, { categoryId, error: '' });
  }
}
