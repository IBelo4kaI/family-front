import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { FamilyService } from '@/core/family/family.service';

export const FAMILY_ROUTES: Routes = [
  {
    path: '',
    title: 'Семья',
    canActivate: [() => inject(FamilyService).load().pipe(map(() => true), catchError(() => of(true)))],
    loadComponent: () => import('@/features/family/overview/overview').then((m) => m.FamilyPage),
  },
];
