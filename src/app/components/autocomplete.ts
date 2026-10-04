import { Component, computed, effect, input, model, output, signal, untracked } from '@angular/core';
import { FormValueControl } from '@angular/forms/signals';

export interface AutocompleteOption {
  id: string;
  name: string;
}

interface Item {
  key: string;
  label: string;
  option?: AutocompleteOption;
  createName?: string;
}

let nextId = 0;

@Component({
  selector: 'app-autocomplete',
  template: `
    <div class="wrap">
      <input
        type="text"
        role="combobox"
        autocomplete="off"
        aria-autocomplete="list"
        [id]="inputId()"
        [placeholder]="placeholder()"
        [value]="query()"
        [disabled]="disabled()"
        [attr.aria-expanded]="expanded()"
        [attr.aria-controls]="listId"
        [attr.aria-activedescendant]="expanded() && active() >= 0 ? listId + '-' + active() : null"
        [attr.aria-invalid]="invalid() ? 'true' : null"
        [attr.aria-describedby]="describedby()"
        (input)="onInput($event)"
        (focus)="open.set(true)"
        (blur)="onBlur()"
        (keydown)="onKeydown($event)"
      />
      @if (expanded()) {
        <ul role="listbox" [id]="listId" [attr.aria-label]="placeholder()">
          @for (item of items(); track item.key; let i = $index) {
            <li
              role="option"
              [id]="listId + '-' + i"
              [class.active]="i === active()"
              [class.create]="!item.option"
              [attr.aria-selected]="item.option?.id === value()"
              (mousedown)="$event.preventDefault(); choose(item)"
            >
              {{ item.label }}
            </li>
          }
        </ul>
      }
    </div>
  `,
  styles: `
    .wrap {
      position: relative;
    }

    input {
      display: block;
      width: 100%;
      min-width: 0;
      height: 48px;
      padding: 0 0.75rem;
      background: hsl(var(--clr-surface));
      border: 1px solid hsl(var(--clr-border));
      border-radius: var(--br-base);
      color: inherit;
      font: inherit;
    }

    input[aria-invalid='true'] {
      border-color: hsl(var(--clr-danger));
    }

    ul {
      position: absolute;
      z-index: 10;
      inset-inline: 0;
      top: calc(100% + 0.25rem);
      max-height: 14rem;
      overflow-y: auto;
      list-style: none;
      background: hsl(var(--clr-surface));
      border: 1px solid hsl(var(--clr-border));
      border-radius: var(--br-base);
    }

    li {
      display: flex;
      align-items: center;
      min-height: 44px;
      padding: 0 0.75rem;
      cursor: pointer;
    }

    li.active {
      background: hsl(var(--clr-accent-muted));
    }

    li[aria-selected='true'] {
      font-weight: 700;
    }

    li.create {
      color: hsl(var(--clr-accent));
      font-weight: 600;
    }
  `,
})
export class Autocomplete implements FormValueControl<string> {
  readonly value = model('');
  readonly touched = model(false);
  readonly invalid = input(false);
  readonly disabled = input(false);

  readonly inputId = input.required<string>();
  readonly options = input.required<AutocompleteOption[]>();
  readonly placeholder = input('Начните вводить');
  readonly describedby = input<string | null>(null);
  readonly creatable = input(false);
  readonly create = output<string>();

  protected readonly listId = `autocomplete-${nextId++}`;
  protected readonly query = signal('');
  protected readonly open = signal(false);
  protected readonly active = signal(-1);

  private readonly selectedName = computed(
    () => this.options().find((o) => o.id === this.value())?.name ?? '',
  );

  protected readonly items = computed<Item[]>(() => {
    const text = this.query().trim().toLowerCase();
    const items: Item[] = this.options()
      .filter((o) => o.name.toLowerCase().includes(text))
      .map((o) => ({ key: o.id, label: o.name, option: o }));
    const exact = this.options().some((o) => o.name.toLowerCase() === text);
    if (this.creatable() && text && !exact) {
      const name = this.query().trim();
      items.push({ key: 'create', label: `Создать «${name}»`, createName: name });
    }
    return items;
  });

  protected readonly expanded = computed(() => this.open() && this.items().length > 0);

  constructor() {
    effect(() => {
      const name = this.selectedName();
      untracked(() => this.query.set(name));
    });
  }

  protected onInput(event: Event): void {
    this.query.set((event.target as HTMLInputElement).value);
    this.active.set(this.items().length ? 0 : -1);
    this.open.set(true);
  }

  protected choose(item: Item): void {
    this.open.set(false);
    if (item.option) {
      this.value.set(item.option.id);
      this.query.set(item.option.name);
    } else if (item.createName) {
      this.create.emit(item.createName);
    }
  }

  protected onBlur(): void {
    this.open.set(false);
    this.touched.set(true);
    const text = this.query().trim().toLowerCase();
    const exact = this.options().find((o) => o.name.toLowerCase() === text);
    if (exact) {
      this.value.set(exact.id);
      this.query.set(exact.name);
    } else if (this.value()) {
      this.query.set(this.selectedName());
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    const count = this.items().length;
    switch (event.key) {
      case 'ArrowDown':
      case 'ArrowUp': {
        event.preventDefault();
        this.open.set(true);
        const step = event.key === 'ArrowDown' ? 1 : -1;
        this.active.update((i) => (count ? (i + step + count) % count : -1));
        break;
      }
      case 'Enter': {
        const item = this.items()[this.active()];
        if (this.expanded() && item) {
          event.preventDefault();
          this.choose(item);
        }
        break;
      }
      case 'Escape':
        if (this.open()) {
          event.preventDefault();
          this.open.set(false);
        }
        break;
    }
  }
}
