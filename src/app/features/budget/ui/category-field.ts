import { Component, computed, inject, input, model, signal } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';
import { Autocomplete } from '@/shared/ui/autocomplete';
import { TransactionType } from '@/features/budget/data/budget.model';
import { BudgetStore } from '@/features/budget/data/budget.store';
import { errorMessage } from '@/shared/utils/http-error';

@Component({
  selector: 'app-category-field',
  imports: [Autocomplete],
  template: `
    <app-autocomplete
      placeholder="Начните вводить название"
      [creatable]="true"
      [inputId]="inputId()"
      [options]="options()"
      [invalid]="invalid()"
      [disabled]="disabled() || creating()"
      [describedby]="describedby()"
      [(value)]="value"
      [(touched)]="touched"
      (create)="create($event)"
    />
    @if (createError()) {
      <p class="error" role="alert">{{ createError() }}</p>
    }
  `,
  styles: `
    .error {
      margin-top: 0.35rem;
      color: hsl(var(--clr-danger-text));
      font-size: var(--fz-caption);
    }
  `,
})
export class CategoryField implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly disabled = input(false);

  readonly inputId = input.required<string>();
  readonly kind = input.required<TransactionType>();
  readonly describedby = input<string | null>(null);

  private readonly store = inject(BudgetStore);
  protected readonly creating = signal(false);
  protected readonly createError = signal('');

  protected readonly options = computed(() =>
    this.store.categories().filter((c) => c.kind === this.kind()),
  );

  protected create(name: string): void {
    this.creating.set(true);
    this.createError.set('');
    this.store.addCategory(name, this.kind()).subscribe({
      next: (created) => {
        this.value.set(created.id);
        this.creating.set(false);
      },
      error: (error: unknown) => {
        this.createError.set(errorMessage(error));
        this.creating.set(false);
      },
    });
  }
}
