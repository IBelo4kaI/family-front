import { Component, input } from '@angular/core';
import { MoneyPipe } from '@/pipes/money';

@Component({
  selector: 'app-balance-card',
  imports: [MoneyPipe],
  template: `
    <section class="card" aria-labelledby="balance-title">
      @if (income() > 0) {
        <h2 id="balance-title">Остаток за месяц</h2>
        <p class="value" [class.negative]="balance() < 0">{{ balance() | money }}</p>
        <dl>
          <div>
            <dt>Доходы</dt>
            <dd>{{ income() | money }}</dd>
          </div>
          <div>
            <dt>Расходы</dt>
            <dd>{{ expense() | money }}</dd>
          </div>
        </dl>
      } @else {
        <h2 id="balance-title">Расходы за месяц</h2>
        <p class="value">{{ expense() | money }}</p>
      }
    </section>
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.5rem;
    }

    .value {
      font-size: 1.75rem;
      font-weight: 700;
    }

    .value.negative {
      color: hsl(var(--clr-danger-text));
    }

    dl {
      display: flex;
      flex-wrap: wrap;
      gap: 1.5rem;
      margin-top: 0.5rem;
    }

    dt {
      font-size: var(--fz-caption);
      color: hsl(var(--clr-text-muted));
    }

    dd {
      font-weight: 600;
    }
  `,
})
export class BalanceCard {
  readonly balance = input.required<number>();
  readonly income = input.required<number>();
  readonly expense = input.required<number>();
}
