import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { TransactionView } from '@/models/budget.model';

@Component({
  selector: 'app-recent-transactions',
  imports: [RouterLink, MoneyPipe, ShortDatePipe],
  template: `
    <h2>Последние транзакции</h2>
    <ul>
      @for (item of items(); track item.id) {
        <li>
          <div>
            <div class="title">{{ item.categoryName }}</div>
            <div class="meta">
              {{ item.date | shortDate }}
              @if (showAuthor()) {
                ·
                <span class="dot" aria-hidden="true" [style.background]="'hsl(' + item.authorColor + ')'"></span>
                {{ item.authorName }}
              }
            </div>
          </div>
          <span [class.income]="item.type === 'income'">
            {{ item.type === 'income' ? '+' : '−' }}{{ item.amount | money }}
          </span>
        </li>
      } @empty {
        <li class="empty">Транзакций за месяц нет</li>
      }
    </ul>
    <a class="all" routerLink="transactions">Все транзакции</a>
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.75rem;
    }

    ul {
      list-style: none;
    }

    li {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0;
    }

    li:not(:last-child) {
      border-bottom: 1px solid hsl(var(--clr-border));
    }

    li > span {
      white-space: nowrap;
    }

    .title {
      font-weight: 600;
    }

    .meta {
      font-size: var(--fz-caption);
      color: hsl(var(--clr-text-muted));
    }

    .dot {
      display: inline-block;
      width: 0.6rem;
      height: 0.6rem;
      border-radius: var(--br-round);
    }

    .income {
      color: hsl(var(--clr-success-text));
      font-weight: 700;
    }

    .all {
      display: inline-block;
      margin-top: 0.5rem;
      padding: 0.6rem 0;
      color: hsl(var(--clr-accent));
      font-weight: 600;
    }

    .empty {
      color: hsl(var(--clr-text-muted));
    }
  `,
})
export class RecentTransactions {
  readonly items = input.required<TransactionView[]>();
  readonly showAuthor = input(false);
}
