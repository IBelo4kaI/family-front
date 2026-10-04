import { Routes } from '@angular/router';
import { guestGuard } from '@/core/auth/auth.guard';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    title: 'Вход',
    canActivate: [guestGuard],
    loadComponent: () => import('@/features/auth/login/login').then((m) => m.Login),
  },
  {
    path: 'register',
    title: 'Новая семья',
    canActivate: [guestGuard],
    loadComponent: () => import('@/features/auth/register/register').then((m) => m.Register),
  },
  {
    path: 'join',
    title: 'Вступить в семью',
    canActivate: [guestGuard],
    loadComponent: () => import('@/features/auth/join/join').then((m) => m.Join),
  },
];
