import { Component, input } from '@angular/core';
import { MoneyPipe } from '@/pipes/money';
import { CategorySpend } from '@/models/budget.model';

@Component({
  selector: 'app-category-breakdown',
  imports: [MoneyPipe],
  template: `
    <h2>Расходы по категориям</h2>
    @for (item of items(); track item.categoryId) {
      <div class="row">
        <span>{{ item.name }}</span>
        <span>{{ item.amount | money }} · {{ item.share }}%</span>
        <progress [value]="item.share" max="100" [attr.aria-label]="item.name"></progress>
      </div>
    } @empty {
      <p class="empty">Расходов за месяц нет</p>
    }
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.75rem;
    }

    .row {
      display: flex;
      flex-wrap: wrap;
      justify-content: space-between;
      gap: 0.25rem;
      margin-bottom: 0.75rem;
    }

    progress {
      width: 100%;
      height: 8px;
    }

    .empty {
      color: hsl(var(--clr-text-muted));
    }
  `,
})
export class CategoryBreakdown {
  readonly items = input.required<CategorySpend[]>();
}
