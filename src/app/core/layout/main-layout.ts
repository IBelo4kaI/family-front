import { NgTemplateOutlet } from '@angular/common';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderState } from '@/core/layout/header-state';
import { Navbar } from '@/core/layout/navbar';
import { PageHeader } from '@/core/layout/page-header';

@Component({
  selector: 'app-main-layout',
  imports: [RouterOutlet, Navbar, PageHeader, NgTemplateOutlet],
  template: `
    <main>
      <div class="top">
        <app-page-header
          [title]="header.title()"
          [backLink]="header.backLink()"
          [backLabel]="header.backLabel()"
        >
          @if (header.actions(); as actions) {
            <ng-container [ngTemplateOutlet]="actions" />
          }
        </app-page-header>
      </div>
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
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow-y: auto;
      overscroll-behavior: contain;
      padding: 0 1rem 1rem;
    }

    .top {
      position: sticky;
      top: 0;
      z-index: 10;
      margin-inline: -1rem;
      padding: calc(0.5rem + env(safe-area-inset-top)) 1rem 0.5rem;
      background: hsl(var(--clr-back) / 0.7);
      -webkit-backdrop-filter: blur(12px);
      backdrop-filter: blur(12px);
      border-bottom: 1px solid hsl(var(--clr-border));
    }
  `,
})
export class MainLayout {
  protected readonly header = inject(HeaderState);
}
