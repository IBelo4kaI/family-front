import { Component, input, output } from '@angular/core';

@Component({
  selector: 'app-month-picker',
  template: `
    <button type="button" aria-label="Предыдущий месяц" (click)="shift.emit(-1)">
      <i class="fi fi-rr-angle-left" aria-hidden="true"></i>
    </button>
    <p aria-live="polite">{{ label() }}</p>
    <button type="button" aria-label="Следующий месяц" (click)="shift.emit(1)">
      <i class="fi fi-rr-angle-right" aria-hidden="true"></i>
    </button>
  `,
  styles: `
    :host {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    p {
      font-size: var(--fz-title);
      font-weight: 700;
    }

    button {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      font-size: 1.25rem;
    }
  `,
})
export class MonthPicker {
  readonly label = input.required<string>();
  readonly shift = output<number>();
}
