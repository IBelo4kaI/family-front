import { Component, model } from '@angular/core';

const COLORS = [
  { value: '0 65% 55%', name: 'Красный' },
  { value: '25 80% 52%', name: 'Оранжевый' },
  { value: '45 85% 48%', name: 'Жёлтый' },
  { value: '140 45% 42%', name: 'Зелёный' },
  { value: '175 55% 40%', name: 'Бирюзовый' },
  { value: '210 70% 50%', name: 'Синий' },
  { value: '270 50% 58%', name: 'Фиолетовый' },
  { value: '330 60% 58%', name: 'Розовый' },
];

@Component({
  selector: 'app-color-picker',
  template: `
    <div role="radiogroup" aria-label="Цвет">
      @for (color of colors; track color.value) {
        <label>
          <input
            type="radio"
            name="color"
            [value]="color.value"
            [checked]="value() === color.value"
            (change)="value.set(color.value)"
          />
          <span class="swatch" [style.background]="'hsl(' + color.value + ')'"></span>
          <span class="sr-only">{{ color.name }}</span>
        </label>
      }
    </div>
  `,
  styles: `
    div {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    label {
      position: relative;
    }

    input {
      position: absolute;
      opacity: 0;
    }

    .swatch {
      display: block;
      width: 44px;
      height: 44px;
      border: 3px solid transparent;
      border-radius: var(--br-round);
      background-clip: content-box;
      padding: 2px;
    }

    input:checked + .swatch {
      border-color: hsl(var(--clr-text));
    }

    input:focus-visible + .swatch {
      outline: 2px solid hsl(var(--clr-accent));
      outline-offset: 2px;
    }
  `,
})
export class ColorPicker {
  protected readonly colors = COLORS;
  readonly value = model.required<string>();
}
