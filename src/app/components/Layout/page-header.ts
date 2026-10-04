import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-page-header',
  imports: [RouterLink],
  template: `
    <header>
      @if (backLink(); as link) {
        <a [routerLink]="link" [attr.aria-label]="backLabel()">
          <i class="fi fi-rr-angle-left" aria-hidden="true"></i>
        </a>
      }
      <h1>{{ title() }}</h1>
      <ng-content />
    </header>
  `,
  styles: `
    header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    a {
      display: grid;
      place-items: center;
      width: 48px;
      height: 48px;
      font-size: 1.25rem;
    }

    h1 {
      flex: 1;
      font-size: 1.5rem;
    }
  `,
})
export class PageHeader {
  readonly title = input.required<string>();
  readonly backLink = input<string | null>(null);
  readonly backLabel = input('Назад');
}
