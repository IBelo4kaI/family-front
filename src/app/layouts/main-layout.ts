import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Navbar } from '@/components/Layout/navbar';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar],
  template: `
    <main>
      <router-outlet />
    </main>
    <app-navbar />
  `,
  styles: `
    :host {
      display: flex;
      flex-direction: column;
      height: 100dvh;
    }

    main {
      flex: 1;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 1rem;
      padding-top: calc(1rem + env(safe-area-inset-top));
    }
  `,
})
export class MainLayout {}
