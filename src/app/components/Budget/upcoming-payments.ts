import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { UpcomingPayment } from '@/models/budget.model';

@Component({
  selector: 'app-upcoming-payments',
  imports: [RouterLink, MoneyPipe, ShortDatePipe],
  template: `
    <section class="card" aria-labelledby="upcoming-title">
      <h2 id="upcoming-title">Предстоящие платежи</h2>
      <p class="total">{{ total() | money }}</p>
      <ul>
        @for (payment of items(); track payment.id) {
          <li>
            <span>{{ payment.name }} · {{ payment.date | shortDate }}</span>
            <span>{{ payment.amount | money }}</span>
          </li>
        } @empty {
          <li class="empty">Платежей в этом месяце нет</li>
        }
      </ul>
      <a class="all" routerLink="payments">Все платежи</a>
    </section>
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.5rem;
    }

    .total {
      font-size: 1.75rem;
      font-weight: 700;
    }

    ul {
      list-style: none;
      margin-top: 0.5rem;
    }

    li {
      display: flex;
      justify-content: space-between;
      gap: 0.5rem;
      padding: 0.4rem 0;
    }

    li span:last-child {
      white-space: nowrap;
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
export class UpcomingPayments {
  readonly items = input.required<UpcomingPayment[]>();
  readonly total = input.required<number>();
}
