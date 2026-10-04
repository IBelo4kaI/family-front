import { Component, model } from '@angular/core';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';

export type Scope = 'personal' | 'family';

@Component({
  selector: 'app-scope-switch',
  template: `
    @if (enabled) {
      <div role="group" aria-label="Режим">
        <button type="button" [attr.aria-pressed]="scope() === 'personal'" (click)="scope.set('personal')">
          Мой
        </button>
        <button type="button" [attr.aria-pressed]="scope() === 'family'" (click)="scope.set('family')">
          Семейный
        </button>
      </div>
    }
  `,
  styles: `
    div {
      display: flex;
      padding: 3px;
      background: hsl(var(--clr-surface));
      border: 1px solid hsl(var(--clr-border));
      border-radius: var(--br-base);
    }

    button {
      min-height: 40px;
      padding: 0 0.9rem;
      border-radius: calc(var(--br-base) - 3px);
      font: inherit;
      font-weight: 600;
    }

    button[aria-pressed='true'] {
      background: hsl(var(--clr-accent));
      color: hsl(var(--clr-on-accent));
    }
  `,
})
export class ScopeSwitch {
  protected readonly enabled = PERSONAL_MODE_ENABLED;
  readonly scope = model.required<Scope>();
}
