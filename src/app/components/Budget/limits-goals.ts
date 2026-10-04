import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MoneyPipe } from '@/pipes/money';
import { ShortDatePipe } from '@/pipes/short-date';
import { LimitProgress, SavingsGoal } from '@/models/budget.model';

@Component({
  selector: 'app-limits-goals',
  imports: [RouterLink, MoneyPipe, ShortDatePipe],
  template: `
    <h2>Лимиты и цели</h2>
    <a class="manage" routerLink="planning">Управлять</a>

    <h3>Лимиты на месяц</h3>
    @for (item of limits(); track item.id) {
      <div class="row">
        <span>{{ item.name }}</span>
        <span [class.over]="item.spent > item.limit">{{ item.spent | money }} / {{ item.limit | money }}</span>
        <progress
          [class.over]="item.spent > item.limit"
          [value]="item.spent"
          [max]="item.limit || 1"
          [attr.aria-label]="item.name"
          [attr.aria-valuetext]="(item.spent | money) + ' из ' + (item.limit | money)"
        ></progress>
      </div>
    } @empty {
      <p class="empty">Лимиты не заданы</p>
    }

    <h3>Цели накопления</h3>
    @for (goal of goals(); track goal.id) {
      <div class="row">
        <span>
          {{ goal.name }}
          @if (goal.deadline) {
            · до {{ goal.deadline | shortDate }}
          }
        </span>
        @if (goal.target !== null) {
          <span>{{ goal.saved | money }} / {{ goal.target | money }}</span>
          <progress
            [value]="goal.saved"
            [max]="goal.target || 1"
            [attr.aria-label]="goal.name"
            [attr.aria-valuetext]="(goal.saved | money) + ' из ' + (goal.target | money)"
          ></progress>
        } @else {
          <span>{{ goal.saved | money }}</span>
        }
      </div>
    } @empty {
      <p class="empty">Целей пока нет</p>
    }
  `,
  styles: `
    h2 {
      font-size: var(--fz-title);
      margin-bottom: 0.75rem;
    }

    h3 {
      font-size: var(--fz-base);
      margin-bottom: 0.5rem;
    }

    h3:not(:first-of-type) {
      margin-top: 1rem;
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

    span.over {
      color: hsl(var(--clr-danger-text));
      font-weight: 700;
    }

    progress.over {
      color: hsl(var(--clr-danger));
    }

    .manage {
      display: inline-block;
      margin-bottom: 0.5rem;
      padding: 0.6rem 0;
      color: hsl(var(--clr-accent));
      font-weight: 600;
    }

    .empty {
      color: hsl(var(--clr-text-muted));
      margin-bottom: 0.5rem;
    }
  `,
})
export class LimitsGoals {
  readonly limits = input.required<LimitProgress[]>();
  readonly goals = input.required<SavingsGoal[]>();
}
