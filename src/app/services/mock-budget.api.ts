import { Service, inject } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { FamilyService } from '@/services/family.service';
import {
  Category,
  CategoryLimit,
  CreditCard,
  NewCategoryLimit,
  NewCreditCard,
  NewSavingsGoal,
  NewRecurringPayment,
  NewTransaction,
  PaymentAction,
  PaymentRef,
  RecurringPayment,
  SavingsGoal,
  SettleResult,
  Transaction,
} from '@/models/budget.model';
import { addMonths, monthKey, todayIso } from '@/utils/iso-date';
import { BudgetApi, BudgetData } from '@/services/budget.api';

const CATEGORIES: Category[] = [
  { id: 'salary', name: 'Зарплата', kind: 'income' },
  { id: 'products', name: 'Продукты', kind: 'expense' },
  { id: 'utilities', name: 'Коммуналка', kind: 'expense' },
  { id: 'transport', name: 'Транспорт', kind: 'expense' },
  { id: 'entertainment', name: 'Развлечения', kind: 'expense' },
  { id: 'building', name: 'Стройматериалы', kind: 'expense' },
  { id: 'tools', name: 'Инструменты', kind: 'expense' },
  { id: 'payments', name: 'Платежи и кредиты', kind: 'expense' },
];

const rub = (n: number) => n * 100;

const currentMonthKey = () => monthKey({ year: new Date().getFullYear(), month: new Date().getMonth() + 1 });

function buildMockData(ym: string): BudgetData {
  const day = (d: number) => `${ym}-${String(d).padStart(2, '0')}`;

  const transactions: Transaction[] = [
    { id: 't1', amount: rub(120000), date: day(1), categoryId: 'salary', type: 'income', scope: 'personal', authorId: 'u1', source: 'manual' },
    { id: 't2', amount: rub(95000), date: day(3), categoryId: 'salary', type: 'income', scope: 'family', authorId: 'u2', source: 'manual' },
    { id: 't3', amount: rub(8400), date: day(4), categoryId: 'products', type: 'expense', scope: 'family', authorId: 'u2', source: 'receipt' },
    { id: 't4', amount: rub(6200), date: day(7), categoryId: 'utilities', type: 'expense', scope: 'family', authorId: 'u1', source: 'manual' },
    { id: 't5', amount: rub(3100), date: day(8), categoryId: 'transport', type: 'expense', scope: 'personal', authorId: 'u1', source: 'manual' },
    { id: 't6', amount: rub(15800), date: day(10), categoryId: 'building', type: 'expense', scope: 'family', authorId: 'u1', source: 'receipt' },
    { id: 't7', amount: rub(2400), date: day(11), categoryId: 'entertainment', type: 'expense', scope: 'personal', authorId: 'u1', source: 'manual' },
    { id: 't8', amount: rub(5600), date: day(12), categoryId: 'products', type: 'expense', scope: 'family', authorId: 'u1', source: 'receipt' },
    { id: 't9', amount: rub(4300), date: day(14), categoryId: 'tools', type: 'expense', scope: 'family', authorId: 'u2', source: 'manual' },
  ];

  const payments: RecurringPayment[] = [
    { id: 'p1', name: 'Кинотеатр онлайн', kind: 'subscription', amount: rub(599), period: 'month', nextDate: day(18), categoryId: 'entertainment', notifyDaysBefore: 3, scope: 'personal', status: 'active' },
    { id: 'p2', name: 'Домашний интернет', kind: 'subscription', amount: rub(700), period: 'month', nextDate: day(20), categoryId: 'utilities', notifyDaysBefore: 3, scope: 'family', status: 'active' },
    { id: 'p4', name: 'Спортзал', kind: 'subscription', amount: rub(2500), period: 'month', nextDate: day(2), categoryId: 'entertainment', notifyDaysBefore: 3, scope: 'personal', status: 'active' },
    { id: 'p3', name: 'Ипотека', kind: 'loan', totalAmount: rub(4500000), endDate: `${ym.slice(0, 4)}-12-25`, amount: rub(38000), period: 'month', nextDate: day(25), categoryId: 'payments', notifyDaysBefore: 3, scope: 'family', status: 'active' },
  ];

  const cards: CreditCard[] = [
    { id: 'c1', bank: 'Банк «Север»', amountDue: rub(12000), dueDate: day(22), categoryId: 'payments', notifyDaysBefore: 3, scope: 'personal', status: 'active' },
  ];

  const limits: CategoryLimit[] = [
    { id: 'l1', categoryId: 'products', limit: rub(30000), scope: 'family' },
    { id: 'l2', categoryId: 'entertainment', limit: rub(4000), scope: 'family' },
    { id: 'l3', categoryId: 'transport', limit: rub(5000), scope: 'personal' },
    { id: 'l4', categoryId: 'entertainment', limit: rub(2000), scope: 'personal' },
  ];

  const goals: SavingsGoal[] = [
    { id: 'g1', name: 'Отпуск', target: rub(150000), saved: rub(45000), deadline: `${ym.slice(0, 4)}-12-31`, scope: 'family' },
    { id: 'g2', name: 'Ноутбук', target: rub(80000), saved: rub(20000), deadline: `${ym.slice(0, 4)}-12-01`, scope: 'personal' },
  ];

  return { categories: CATEGORIES, transactions, payments, cards, limits, goals };
}

@Service()
export class MockBudgetApi extends BudgetApi {
  private readonly family = inject(FamilyService);
  private readonly data = buildMockData(currentMonthKey());

  load(): Observable<BudgetData> {
    return of(structuredClone(this.data));
  }

  addTransaction(draft: NewTransaction): Observable<Transaction> {
    const transaction: Transaction = {
      ...draft,
      id: crypto.randomUUID(),
      authorId: this.family.currentUserId,
      source: 'manual',
    };
    this.data.transactions.push(transaction);
    return of(structuredClone(transaction));
  }

  addPayment(draft: NewRecurringPayment): Observable<RecurringPayment> {
    const payment: RecurringPayment = { ...draft, id: crypto.randomUUID(), status: 'active' };
    this.data.payments.push(payment);
    return of(structuredClone(payment));
  }

  addCard(draft: NewCreditCard): Observable<CreditCard> {
    const card: CreditCard = { ...draft, id: crypto.randomUUID(), status: 'active' };
    this.data.cards.push(card);
    return of(structuredClone(card));
  }

  updateTransaction(id: string, draft: NewTransaction): Observable<Transaction> {
    const index = this.data.transactions.findIndex((t) => t.id === id);
    if (index === -1) return throwError(() => new Error('Транзакция не найдена'));
    const { authorId, source } = this.data.transactions[index];
    const transaction: Transaction = { ...draft, id, authorId, source };
    this.data.transactions[index] = transaction;
    return of(structuredClone(transaction));
  }

  deleteTransaction(id: string): Observable<void> {
    this.data.transactions.splice(
      this.data.transactions.findIndex((t) => t.id === id),
      1,
    );
    return of(undefined);
  }

  addLimit(draft: NewCategoryLimit): Observable<CategoryLimit> {
    const limit: CategoryLimit = { ...draft, id: crypto.randomUUID() };
    this.data.limits.push(limit);
    return of(structuredClone(limit));
  }

  updateLimit(id: string, draft: NewCategoryLimit): Observable<CategoryLimit> {
    const index = this.data.limits.findIndex((l) => l.id === id);
    if (index === -1) return throwError(() => new Error('Лимит не найден'));
    const limit: CategoryLimit = { ...draft, id };
    this.data.limits[index] = limit;
    return of(structuredClone(limit));
  }

  deleteLimit(id: string): Observable<void> {
    this.data.limits.splice(
      this.data.limits.findIndex((l) => l.id === id),
      1,
    );
    return of(undefined);
  }

  addGoal(draft: NewSavingsGoal): Observable<SavingsGoal> {
    const goal: SavingsGoal = { ...draft, id: crypto.randomUUID() };
    this.data.goals.push(goal);
    return of(structuredClone(goal));
  }

  updateGoal(id: string, draft: NewSavingsGoal): Observable<SavingsGoal> {
    const index = this.data.goals.findIndex((g) => g.id === id);
    if (index === -1) return throwError(() => new Error('Цель не найдена'));
    const goal: SavingsGoal = { ...draft, id };
    this.data.goals[index] = goal;
    return of(structuredClone(goal));
  }

  deleteGoal(id: string): Observable<void> {
    this.data.goals.splice(
      this.data.goals.findIndex((g) => g.id === id),
      1,
    );
    return of(undefined);
  }

  topUpGoal(id: string, amount: number): Observable<SavingsGoal> {
    const goal = this.data.goals.find((g) => g.id === id);
    if (!goal) return throwError(() => new Error('Цель не найдена'));
    goal.saved += amount;
    return of(structuredClone(goal));
  }

  updatePayment(id: string, draft: NewRecurringPayment): Observable<RecurringPayment> {
    const index = this.data.payments.findIndex((p) => p.id === id);
    if (index === -1) return throwError(() => new Error('Платёж не найден'));
    const payment: RecurringPayment = { ...draft, id, status: this.data.payments[index].status };
    this.data.payments[index] = payment;
    return of(structuredClone(payment));
  }

  updateCard(id: string, draft: NewCreditCard): Observable<CreditCard> {
    const index = this.data.cards.findIndex((c) => c.id === id);
    if (index === -1) return throwError(() => new Error('Карта не найдена'));
    const card: CreditCard = { ...draft, id, status: this.data.cards[index].status };
    this.data.cards[index] = card;
    return of(structuredClone(card));
  }

  closePayment(ref: PaymentRef): Observable<void> {
    const item =
      ref.kind === 'recurring'
        ? this.data.payments.find((p) => p.id === ref.id)
        : this.data.cards.find((c) => c.id === ref.id);
    if (!item) return throwError(() => new Error('Платёж не найден'));
    item.status = 'closed';
    return of(undefined);
  }

  settlePayment(ref: PaymentRef, action: PaymentAction): Observable<SettleResult> {
    const item =
      ref.kind === 'recurring'
        ? this.data.payments.find((p) => p.id === ref.id)
        : this.data.cards.find((c) => c.id === ref.id);
    if (!item) return throwError(() => new Error('Платёж не найден'));

    let nextDate: string;
    let amount: number;
    if ('nextDate' in item) {
      nextDate = addMonths(item.nextDate, item.period === 'year' ? 12 : 1);
      amount = item.amount;
      item.nextDate = nextDate;
    } else {
      nextDate = addMonths(item.dueDate, 1);
      amount = item.amountDue;
      item.dueDate = nextDate;
    }

    const transaction: Transaction | undefined =
      action === 'confirm'
        ? {
            id: crypto.randomUUID(),
            amount,
            date: todayIso(),
            categoryId: item.categoryId,
            type: 'expense',
            scope: item.scope,
            authorId: this.family.currentUserId,
            source: 'manual',
          }
        : undefined;
    if (transaction) this.data.transactions.push(transaction);

    return of({ nextDate, transaction });
  }
}
