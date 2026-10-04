import { inject } from '@angular/core';
import { Routes } from '@angular/router';
import { map } from 'rxjs';
import { BudgetStore } from '@/stores/budget.store';

export const BUDGET_ROUTES: Routes = [
  {
    path: '',
    canActivate: [() => inject(BudgetStore).load().pipe(map(() => true))],
    children: [
      { path: '', title: 'Бюджет', loadComponent: () => import('@/pages/budget/index/index').then((m) => m.Budget) },
      {
        path: 'payments',
        title: 'Платежи',
        loadComponent: () => import('@/pages/budget/payments/payments').then((m) => m.Payments),
      },
      {
        path: 'payments/add',
        title: 'Новый платёж',
        loadComponent: () => import('@/pages/budget/payment-form/payment-form').then((m) => m.PaymentForm),
      },
      {
        path: 'payments/add-card',
        title: 'Новая карта',
        loadComponent: () => import('@/pages/budget/card-form/card-form').then((m) => m.CardForm),
      },
      {
        path: 'payments/:id/edit',
        title: 'Редактирование платежа',
        loadComponent: () => import('@/pages/budget/payment-form/payment-form').then((m) => m.PaymentForm),
      },
      {
        path: 'payments/cards/:id/edit',
        title: 'Редактирование карты',
        loadComponent: () => import('@/pages/budget/card-form/card-form').then((m) => m.CardForm),
      },
      {
        path: 'planning',
        title: 'Лимиты и цели',
        loadComponent: () => import('@/pages/budget/planning/planning').then((m) => m.Planning),
      },
      {
        path: 'planning/limits/add',
        title: 'Новый лимит',
        loadComponent: () => import('@/pages/budget/limit-form/limit-form').then((m) => m.LimitForm),
      },
      {
        path: 'planning/limits/:id/edit',
        title: 'Редактирование лимита',
        loadComponent: () => import('@/pages/budget/limit-form/limit-form').then((m) => m.LimitForm),
      },
      {
        path: 'planning/goals/add',
        title: 'Новая цель',
        loadComponent: () => import('@/pages/budget/goal-form/goal-form').then((m) => m.GoalForm),
      },
      {
        path: 'planning/goals/:id/edit',
        title: 'Редактирование цели',
        loadComponent: () => import('@/pages/budget/goal-form/goal-form').then((m) => m.GoalForm),
      },
      {
        path: 'planning/goals/:id/top-up',
        title: 'Пополнение цели',
        loadComponent: () => import('@/pages/budget/goal-top-up/goal-top-up').then((m) => m.GoalTopUp),
      },
      {
        path: 'transactions',
        title: 'Транзакции',
        loadComponent: () => import('@/pages/budget/transactions/transactions').then((m) => m.Transactions),
      },
      {
        path: 'transactions/:id/edit',
        title: 'Редактирование транзакции',
        loadComponent: () => import('@/pages/budget/transaction-form/transaction-form').then((m) => m.TransactionForm),
      },
      {
        path: 'scan',
        title: 'Сканирование чека',
        loadComponent: () => import('@/pages/budget/scan/scan').then((m) => m.Scan),
      },
      {
        path: 'scan/confirm',
        title: 'Чек',
        loadComponent: () => import('@/pages/budget/scan-confirm/scan-confirm').then((m) => m.ScanConfirm),
      },
      {
        path: 'add',
        title: 'Новая транзакция',
        loadComponent: () => import('@/pages/budget/transaction-form/transaction-form').then((m) => m.TransactionForm),
      },
    ],
  },
];
