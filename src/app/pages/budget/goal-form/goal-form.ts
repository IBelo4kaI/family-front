import { Component, inject, signal } from '@angular/core';
import { PageHeader } from '@/components/Layout/page-header';
import { FormField, FormRoot, form, max, min, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { BudgetScope } from '@/models/budget.model';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { BudgetStore } from '@/stores/budget.store';
import { todayIso } from '@/utils/iso-date';
import { toKopecks, toRubles } from '@/utils/money';

const MAX_AMOUNT = 999_999_999.99;
const BACK_URL = '/budget/planning';

@Component({
  selector: 'app-goal-form',
  imports: [PageHeader, FormField, FormRoot],
  templateUrl: './goal-form.html',
  styleUrl: '../../../assets/styles/form-page.css',
})
export class GoalForm {
  private readonly store = inject(BudgetStore);
  private readonly router = inject(Router);
  private readonly editId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  private readonly existing = this.editId ? this.store.findGoal(this.editId) : undefined;

  protected readonly isEdit = this.editId !== null;

  protected readonly personalEnabled = PERSONAL_MODE_ENABLED;
  protected readonly model = signal({
    name: this.existing?.name ?? '',
    target: (this.existing ? toRubles(this.existing.target) : null) as number | null,
    saved: (this.existing ? toRubles(this.existing.saved) : 0) as number | null,
    deadline: this.existing?.deadline ?? todayIso(),
    scope: (this.existing?.scope ?? this.store.scope()) as BudgetScope,
  });

  protected readonly goalForm = form(
    this.model,
    (path) => {
      required(path.name, { message: 'Введите название' });
      required(path.target, { message: 'Введите целевую сумму' });
      min(path.target, 0.01, { message: 'Сумма должна быть больше нуля' });
      max(path.target, MAX_AMOUNT, { message: 'Слишком большая сумма' });
      required(path.saved, { message: 'Введите накопленную сумму (можно 0)' });
      min(path.saved, 0, { message: 'Не меньше нуля' });
      max(path.saved, MAX_AMOUNT, { message: 'Слишком большая сумма' });
      required(path.deadline, { message: 'Выберите срок' });
    },
    {
      submission: {
        action: async () => {
          const value = this.model();
          if (value.target === null || value.saved === null) return;
          const draft = {
            name: value.name.trim(),
            target: toKopecks(value.target),
            saved: toKopecks(value.saved),
            deadline: value.deadline,
            scope: value.scope,
          };
          await firstValueFrom(
            this.editId ? this.store.updateGoal(this.editId, draft) : this.store.addGoal(draft),
          );
          this.store.scope.set(value.scope);
          await this.router.navigateByUrl(BACK_URL);
        },
      },
    },
  );

  constructor() {
    if (this.editId && !this.existing) void this.router.navigateByUrl(BACK_URL);
  }
}
