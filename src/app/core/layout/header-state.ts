import { Service, TemplateRef, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter, map } from 'rxjs';

@Service()
export class HeaderState {
  private readonly router = inject(Router);

  // Кнопки справа в заголовке; страница задаёт их через appHeaderActions
  readonly actions = signal<TemplateRef<unknown> | null>(null);

  private readonly route = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map(() => this.deepestRoute()),
    ),
    { initialValue: this.deepestRoute() },
  );

  readonly title = computed(() => this.route().title ?? '');
  readonly backLink = computed<string | null>(() => this.route().data['backLink'] ?? null);
  readonly backLabel = computed<string>(() => this.route().data['backLabel'] ?? 'Назад');

  private deepestRoute() {
    let route = this.router.routerState.snapshot.root;
    while (route.firstChild) route = route.firstChild;
    return route;
  }
}
