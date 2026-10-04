import { Component, computed, inject, signal } from '@angular/core';
import { FormField, FormRoot, form, required } from '@angular/forms/signals';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
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
  imports: [PageHeader, FormField, FormRoot, MoneyPipe, ShortDatePipe],
  templateUrl: './scan-confirm.html',
  styleUrls: ['../../../assets/styles/form-page.css', './scan-confirm.css'],
})
export class ScanConfirm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly receipts = inject(ReceiptService);

  protected readonly receipt = this.receipts.scanned;
  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly submitError = signal('');

  protected readonly model = signal({
    categoryId: '',
    scope: this.store.scope() as BudgetScope,
  });

  protected readonly confirmForm = form(
    this.model,
    (path) => {
      required(path.categoryId, { message: 'Выберите категорию' });
    },
    {
      submission: {
        action: async () => {
          const receipt = this.receipt();
          if (!receipt) return;
          this.submitError.set('');
          try {
            const created = await firstValueFrom(this.receipts.save({ ...receipt, ...this.model() }));
            this.store.appendTransaction(created);
            this.receipts.scanned.set(null);
            await this.router.navigateByUrl('/budget');
          } catch (error) {
            this.submitError.set(errorMessage(error));
          }
        },
      },
    },
  );

  protected readonly categories = computed(() =>
    this.store.categories().filter((c) => c.kind === 'expense'),
  );

  constructor() {
    if (!this.receipt()) void this.router.navigateByUrl('/budget/scan');
  }
}
