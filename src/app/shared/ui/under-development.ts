import { Component } from '@angular/core';

@Component({
  selector: 'app-under-development',
  template: `
    <section>
      <i class="fi fi-rr-hammer-crash"></i>
      <p>В разработке</p>
    </section>
  `,
  styles: `
    :host {
      display: grid;
      place-items: center;
      min-height: 60dvh;
      font-size: var(--fz-title);
      color: hsl(var(--clr-text-muted));
    }
    section {
      display: flex;
      align-items: center;
      flex-direction: column;
    }
  `,
})
export class UnderDevelopment {}
