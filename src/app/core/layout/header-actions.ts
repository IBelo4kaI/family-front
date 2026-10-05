import { DestroyRef, Directive, TemplateRef, inject } from '@angular/core';
import { HeaderState } from '@/core/layout/header-state';

@Directive({ selector: 'ng-template[appHeaderActions]' })
export class HeaderActions {
  constructor() {
    const state = inject(HeaderState);
    const template = inject<TemplateRef<unknown>>(TemplateRef);
    state.actions.set(template);
    inject(DestroyRef).onDestroy(() => state.actions.update((current) => (current === template ? null : current)));
  }
}
