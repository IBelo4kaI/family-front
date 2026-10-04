import { Routes } from '@angular/router';
import { MainLayout } from '@/core/layout/main-layout';
import { authGuard } from '@/core/auth/auth.guard';

const underDevelopment = () =>
  import('@/shared/ui/under-development').then((m) => m.UnderDevelopment);

export const routes: Routes = [
  { path: '', loadChildren: () => import('@/features/auth/auth.routes').then((m) => m.AUTH_ROUTES) },
  {
    path: '',
    component: MainLayout,
    canActivate: [authGuard],
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'budget' },
      { path: 'shopping', title: 'Покупки', loadComponent: underDevelopment },
      { path: 'budget', loadChildren: () => import('@/features/budget/budget.routes').then((m) => m.BUDGET_ROUTES) },
      { path: 'family', loadChildren: () => import('@/features/family/family.routes').then((m) => m.FAMILY_ROUTES) },
      { path: 'plans', title: 'Планы', loadComponent: underDevelopment },
      { path: 'movies', title: 'Фильмы', loadComponent: underDevelopment },
      { path: 'recipes', title: 'Рецепты', loadComponent: underDevelopment },
      { path: 'wishlist', title: 'Вишлист', loadComponent: underDevelopment },
    ],
  },
  { path: '**', redirectTo: '' },
];
