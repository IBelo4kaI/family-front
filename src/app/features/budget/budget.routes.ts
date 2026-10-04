import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { map } from 'rxjs';
import { BudgetStore } from '@/features/budget/data/budget.store';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    canActivate: [() => inject(BudgetStore).load().pipe(map(() => true))],
    children: [
      { path: '', title: 'Бюджет', loadComponent: () => import('@/features/budget/overview/overview').then((m) => m.Budget) },
      {
        path: 'payments',
        title: 'Платежи',
        loadComponent: () => import('@/features/budget/payments/payments').then((m) => m.Payments),
      },
      {
        path: 'payments/add',
        title: 'Новый платёж',
        loadComponent: () => import('@/features/budget/payment-form/payment-form').then((m) => m.PaymentForm),
      },
      {
        path: 'payments/add-card',
        title: 'Новая карта',
        loadComponent: () => import('@/features/budget/card-form/card-form').then((m) => m.CardForm),
      },
      {
        path: 'payments/:id/edit',
        title: 'Редактирование платежа',
        loadComponent: () => import('@/features/budget/payment-form/payment-form').then((m) => m.PaymentForm),
      },
      {
        path: 'payments/cards/:id/edit',
        title: 'Редактирование карты',
        loadComponent: () => import('@/features/budget/card-form/card-form').then((m) => m.CardForm),
      },
      {
        path: 'planning',
        title: 'Лимиты и цели',
        loadComponent: () => import('@/features/budget/planning/planning').then((m) => m.Planning),
      },
      {
        path: 'planning/limits/add',
        title: 'Новый лимит',
        loadComponent: () => import('@/features/budget/limit-form/limit-form').then((m) => m.LimitForm),
      },
      {
        path: 'planning/limits/:id/edit',
        title: 'Редактирование лимита',
        loadComponent: () => import('@/features/budget/limit-form/limit-form').then((m) => m.LimitForm),
      },
      {
        path: 'planning/goals/add',
        title: 'Новая цель',
        loadComponent: () => import('@/features/budget/goal-form/goal-form').then((m) => m.GoalForm),
      },
      {
        path: 'planning/goals/:id/edit',
        title: 'Редактирование цели',
        loadComponent: () => import('@/features/budget/goal-form/goal-form').then((m) => m.GoalForm),
      },
      {
        path: 'planning/goals/:id/top-up',
        title: 'Пополнение цели',
        loadComponent: () => import('@/features/budget/goal-top-up/goal-top-up').then((m) => m.GoalTopUp),
      },
      {
        path: 'transactions',
        title: 'Транзакции',
        loadComponent: () => import('@/features/budget/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'transactions/:id/edit',
        title: 'Редактирование транзакции',
        loadComponent: () => import('@/features/budget/transaction-form/transaction-form').then((m) => m.TransactionForm),
      },
      {
        path: 'scan',
        title: 'Сканирование чека',
        loadComponent: () => import('@/features/budget/scan/scan').then((m) => m.Scan),
      },
      {
        path: 'scan/confirm',
        title: 'Чек',
        loadComponent: () => import('@/features/budget/scan-confirm/scan-confirm').then((m) => m.ScanConfirm),
      },
      {
        path: 'add',
        title: 'Новая транзакция',
        loadComponent: () => import('@/features/budget/transaction-form/transaction-form').then((m) => m.TransactionForm),
      },
    ],
  },
];
