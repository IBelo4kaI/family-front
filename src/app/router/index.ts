import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { MainLayout } from '@/layouts/main-layout';
import { authGuard, guestGuard } from '@/services/auth/auth.guard';
import { FamilyService } from '@/services/family/family.service';

const underDevelopment = () =>
  import('@/components/under-development').then((m) => m.UnderDevelopment);

export const routes: Routes = [
  {
    path: 'login',
    title: 'Вход',
    canActivate: [guestGuard],
    loadComponent: () => import('@/pages/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Новая семья',
    canActivate: [guestGuard],
    loadComponent: () => import('@/pages/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'join',
    title: 'Вступить в семью',
    canActivate: [guestGuard],
    loadComponent: () => import('@/pages/auth/join/join').then((m) => m.Join),
  },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'budget' },
      { path: 'shopping', title: 'Покупки', loadComponent: underDevelopment },
      { path: 'budget', loadChildren: () => import('@/router/budget.routes').then((m) => m.BUDGET_ROUTES) },
      {
        path: 'family',
        title: 'Семья',
        canActivate: [() => inject(FamilyService).load().pipe(map(() => true), catchError(() => of(true)))],
        loadComponent: () => import('@/pages/family/index/index').then((m) => m.FamilyPage),
      },
      { path: 'plans', title: 'Планы', loadComponent: underDevelopment },
      { path: 'movies', title: 'Фильмы', loadComponent: underDevelopment },
      { path: 'recipes', title: 'Рецепты', loadComponent: underDevelopment },
      { path: 'wishlist', title: 'Вишлист', loadComponent: underDevelopment },
    ],
  },
  { path: '**', redirectTo: '' },
];
