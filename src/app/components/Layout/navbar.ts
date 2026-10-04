import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav aria-label="Основная навигация">
      @for (link of links; track link.path) {
        <a [routerLink]="link.path" routerLinkActive="active" ariaCurrentWhenActive="page">
          <i class="icon" [class]="'fi fi-rr-' + link.icon" aria-hidden="true"></i>
          <span>{{ link.label }}</span>
        </a>
      }
    </nav>
  `,
  styles: `
    nav {
      display: flex;
      background: hsl(var(--clr-surface));
      border-top: 1px solid hsl(var(--clr-border));
      padding-bottom: env(safe-area-inset-bottom);
    }

    a {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 2px;
      min-width: 0;
      min-height: 56px;
      font-size: 0.7rem;
      font-weight: 600;
      color: hsl(var(--clr-text-muted));
    }

    span {
      max-width: 100%;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .icon {
      font-size: var(--fz-title);
      line-height: 1;
    }

    a.active {
      color: hsl(var(--clr-accent));
    }

    a:focus-visible {
      outline: 2px solid hsl(var(--clr-accent));
      outline-offset: -4px;
    }
  `,
})
export class Navbar {
  protected readonly links = [
    { path: '/shopping', label: 'Покупки', icon: 'shopping-cart' },
    { path: '/budget', label: 'Бюджет', icon: 'wallet' },
    { path: '/plans', label: 'Планы', icon: 'calendar' },
    { path: '/movies', label: 'Фильмы', icon: 'film' },
    { path: '/recipes', label: 'Рецепты', icon: 'utensils' },
    { path: '/wishlist', label: 'Вишлист', icon: 'gift' },
  ];
}
