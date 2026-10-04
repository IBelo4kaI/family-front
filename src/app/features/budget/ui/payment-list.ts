import { Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '@/shared/pipes/money';
import { ShortDatePipe } from '@/shared/pipes/short-date';
import { PaymentAction, PaymentRef, PaymentView } from '@/features/budget/data/budget.model';

export interface SettleEvent {
  ref: PaymentRef;
  action: PaymentAction;
}

@Component({
  selector: 'app-payment-list',
  imports: [RouterLink, MoneyPipe, ShortDatePipe],
  template: `
    <h2>{{ title() }}</h2>
    <ul>
      @for (item of items(); track item.ref.id) {
        <li [class.closed]="item.closed">
          <div class="row">
            <div>
              <div class="name">{{ item.name }}</div>
              <div class="meta">{{ item.label }} · {{ item.date | shortDate }}</div>
              @if (item.totalAmount !== undefined || item.endDate) {
                <div class="meta">
                  @if (item.totalAmount !== undefined) {
                    Общая сумма: {{ item.totalAmount | money }}
                  }
                  @if (item.endDate) {
                    · до {{ item.endDate | shortDate }}
                  }
                </div>
              }
              @if (item.yearlyAmount !== undefined) {
                <div class="meta">В год: {{ item.yearlyAmount | money }}</div>
              }
              @if (item.creditLimit !== undefined) {
                <div class="meta">Лимит: {{ item.creditLimit | money }}</div>
              }
            </div>
            <span class="amount">{{ item.amount | money }}</span>
          </div>
          @if (item.closed) {
            <p class="status">Завершён</p>
          } @else {
            @if (item.pending) {
              <p class="status pending">Ожидает подтверждения</p>
              <div class="actions">
                <button type="button" class="confirm" (click)="settle.emit({ ref: item.ref, action: 'confirm' })">
                  Подтвердить
                </button>
                <button type="button" class="skip" (click)="settle.emit({ ref: item.ref, action: 'skip' })">
                  Пропустить
                </button>
              </div>
            }
            <div class="links">
              <a class="edit" [routerLink]="editLink(item)">Изменить</a>
              <button type="button" class="close" (click)="close.emit(item)">
                {{ item.closeLabel }}
              </button>
            </div>
          }
        </li>
      } @empty {
        <li class="empty">{{ emptyText() }}</li>
      }
    </ul>
    <a class="add" [routerLink]="addLink()">Добавить</a>
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.5rem;
    }

    ul {
      list-style: none;
    }

    li {
      padding: 0.6rem 0;
    }

    li:not(:last-child) {
      border-bottom: 1px solid hsl(var(--clr-border));
    }

    .row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
    }

    .name {
      font-weight: 600;
    }

    .meta,
    .status {
      font-size: var(--fz-caption);
      color: hsl(var(--clr-text-muted));
    }

    .amount {
      font-weight: 700;
      white-space: nowrap;
    }

    .closed {
      opacity: 0.7;
    }

    .status.pending {
      display: inline-block;
      margin-top: 0.4rem;
      padding: 0.15rem 0.5rem;
      background: hsl(var(--clr-warn-muted));
      border-radius: var(--br-base);
      color: hsl(var(--clr-text));
      font-weight: 600;
    }

    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.5rem;
      margin-top: 0.5rem;
    }

    .actions button {
      min-height: 44px;
      border-radius: var(--br-base);
      font: inherit;
      font-weight: 600;
    }

    .confirm {
      background: hsl(var(--clr-accent));
      color: hsl(var(--clr-on-accent));
    }

    .skip {
      border: 1px solid hsl(var(--clr-border));
    }

    .links {
      display: flex;
      gap: 1rem;
      margin-top: 0.25rem;
    }

    .edit,
    .close {
      display: inline-flex;
      align-items: center;
      min-height: 44px;
      color: hsl(var(--clr-text-muted));
      font: inherit;
      font-size: var(--fz-caption);
      text-decoration: underline;
    }

    .add {
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
export class PaymentList {
  readonly title = input.required<string>();
  readonly items = input.required<PaymentView[]>();
  readonly emptyText = input('Пока ничего нет');
  readonly addLink = input.required<string>();
  readonly settle = output<SettleEvent>();
  readonly close = output<PaymentView>();

  protected editLink({ ref }: PaymentView): string[] {
    return ref.kind === 'card' ? ['cards', ref.id, 'edit'] : [ref.id, 'edit'];
  }
}
