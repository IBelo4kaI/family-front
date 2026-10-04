import { Service, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, tap } from 'rxjs';
import { errorMessage } from '@/utils/http-error';
import { PERSONAL_MODE_ENABLED } from '@/constants/budget.constants';
import { FamilyService } from '@/services/family/family.service';
import {
  BudgetScope,
  Category,
  CategoryLimit,
  CategorySpend,
  CreditCard,
  LimitProgress,
  NewCategoryLimit,
  NewCreditCard,
  NewSavingsGoal,
  NewRecurringPayment,
  NewTransaction,
  PaymentAction,
  PaymentRef,
  PaymentView,
  RecurringPayment,
  SavingsGoal,
  SettleResult,
  Transaction,
  TransactionView,
  UpcomingPayment,
  YearMonth,
} from '@/models/budget.model';
import { daysInMonth, monthKey, parseIso, toIso, todayIso } from '@/utils/iso-date';
import { BudgetService } from '@/services/budget/budget.service';

const RECENT_COUNT = 5;

const sum = (values: number[]) => values.reduce((total, value) => total + value, 0);
const nameOf = (list: { id: string; name: string }[], id: string) =>
  list.find((item) => item.id === id)?.name ?? '';

const KIND_LABELS = { subscription: 'Подписка', loan: 'Кредит' } as const;

const byStatusThenDate = (a: PaymentView, b: PaymentView) =>
  Number(a.closed) - Number(b.closed) || a.date.localeCompare(b.date);

const monthFormatter = new Intl.DateTimeFormat('ru-RU', { month: 'long', year: 'numeric' });

@Service()
export class BudgetStore {
  readonly scope = signal<BudgetScope>(PERSONAL_MODE_ENABLED ? 'personal' : 'family');
  readonly month = signal<YearMonth>(this.currentMonth());

  private readonly api = inject(BudgetService);
  private readonly family = inject(FamilyService);

  readonly categories = signal<Category[]>([]);
  private readonly allTransactions = signal<Transaction[]>([]);
  private readonly payments = signal<RecurringPayment[]>([]);
  private readonly cards = signal<CreditCard[]>([]);
  private readonly allLimits = signal<CategoryLimit[]>([]);
  private readonly allGoals = signal<SavingsGoal[]>([]);

  readonly loadError = signal<string | null>(null);

  load(): Observable<void> {
    this.loadError.set(null);
    return forkJoin([this.family.load(), this.api.load()]).pipe(
      tap(([, data]) => {
        this.categories.set(data.categories);
        this.allTransactions.set(data.transactions);
        this.payments.set(data.payments);
        this.cards.set(data.cards);
        this.allLimits.set(data.limits);
        this.allGoals.set(data.goals);
      }),
      map(() => undefined),
      catchError((error: unknown) => {
        this.loadError.set(errorMessage(error));
        return of(undefined);
      }),
    );
  }

  readonly monthLabel = computed(() => {
    const { year, month } = this.month();
    const label = monthFormatter.format(new Date(year, month - 1));
    return label.charAt(0).toUpperCase() + label.slice(1);
  });

  private readonly transactions = computed(() =>
    this.allTransactions().filter(
      (t) => t.scope === this.scope() && t.date.startsWith(monthKey(this.month())),
    ),
  );

  readonly income = computed(() =>
    sum(this.transactions().filter((t) => t.type === 'income').map((t) => t.amount)),
  );
  readonly expense = computed(() =>
    sum(this.transactions().filter((t) => t.type === 'expense').map((t) => t.amount)),
  );
  readonly balance = computed(() => this.income() - this.expense());

  readonly categorySpend = computed<CategorySpend[]>(() => {
    const totals = new Map<string, number>();
    for (const t of this.transactions()) {
      if (t.type === 'expense') totals.set(t.categoryId, (totals.get(t.categoryId) ?? 0) + t.amount);
    }
    const total = this.expense();
    return [...totals]
      .map(([categoryId, amount]) => ({
        categoryId,
        name: nameOf(this.categories(), categoryId),
        amount,
        share: total ? Math.round((amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  });

  readonly upcoming = computed<UpcomingPayment[]>(() => {
    const { year, month } = this.month();
    const ym = monthKey({ year, month });
    const lastDay = daysInMonth(year, month);
    const monthsSince = (isoDate: string) => {
      const start = parseIso(isoDate);
      return year * 12 + month - (start.year * 12 + start.month);
    };
    const dayInMonth = (isoDate: string) =>
      toIso({ year, month, day: Math.min(parseIso(isoDate).day, lastDay) });

    const payments = this.payments()
      .filter((p) => p.scope === this.scope() && p.status === 'active')
      .filter((p) => {
        const elapsed = monthsSince(p.nextDate);
        return elapsed >= 0 && (p.period === 'month' || elapsed % 12 === 0);
      })
      .map<UpcomingPayment>((p) => ({
        id: p.id,
        name: p.name,
        amount: p.amount,
        date: dayInMonth(p.nextDate),
        kind: p.kind,
      }));

    const cards = this.cards()
      .filter((c) => c.scope === this.scope() && c.status === 'active' && c.dueDate.startsWith(ym))
      .map<UpcomingPayment>((c) => ({
        id: c.id,
        name: c.bank,
        amount: c.amountDue,
        date: c.dueDate,
        kind: 'card',
      }));

    return [...payments, ...cards].sort((a, b) => a.date.localeCompare(b.date));
  });
  readonly upcomingTotal = computed(() => sum(this.upcoming().map((p) => p.amount)));

  readonly limits = computed<LimitProgress[]>(() =>
    this.allLimits()
      .filter((l) => l.scope === this.scope())
      .map((l) => ({
        id: l.id,
        categoryId: l.categoryId,
        name: nameOf(this.categories(), l.categoryId),
        limit: l.limit,
        spent: sum(
          this.transactions()
            .filter((t) => t.type === 'expense' && t.categoryId === l.categoryId)
            .map((t) => t.amount),
        ),
      })),
  );

  readonly paymentItems = computed<PaymentView[]>(() => {
    const today = todayIso();
    return this.payments()
      .filter((p) => p.scope === this.scope())
      .map<PaymentView>((p) => ({
        ref: { kind: 'recurring', id: p.id },
        name: p.name,
        label: KIND_LABELS[p.kind],
        amount: p.amount,
        date: p.nextDate,
        pending: p.status === 'active' && p.nextDate <= today,
        closeLabel: p.kind === 'loan' ? 'Погашен' : 'Отменить',
        totalAmount: p.totalAmount,
        yearlyAmount: p.kind === 'subscription' && p.period === 'month' ? p.amount * 12 : undefined,
        endDate: p.endDate,
        closed: p.status === 'closed',
      }))
      .sort(byStatusThenDate);
  });

  readonly cardItems = computed<PaymentView[]>(() => {
    const today = todayIso();
    return this.cards()
      .filter((c) => c.scope === this.scope())
      .map<PaymentView>((c) => ({
        ref: { kind: 'card', id: c.id },
        name: c.bank,
        label: 'Кредитная карта',
        amount: c.amountDue,
        date: c.dueDate,
        pending: c.status === 'active' && c.dueDate <= today,
        closeLabel: 'Закрыть карту',
        creditLimit: c.creditLimit,
        closed: c.status === 'closed',
      }))
      .sort(byStatusThenDate);
  });

  readonly goals = computed<SavingsGoal[]>(() =>
    this.allGoals().filter((g) => g.scope === this.scope()),
  );

  readonly transactionItems = computed<TransactionView[]>(() =>
    [...this.transactions()]
      .sort((a, b) => b.date.localeCompare(a.date))
      .map((t) => {
        const author = this.family.member(t.authorId);
        return {
          id: t.id,
          categoryName: nameOf(this.categories(), t.categoryId),
          amount: t.amount,
          type: t.type,
          date: t.date,
          source: t.source,
          authorName: author?.name ?? '',
          authorColor: author?.color ?? '0 0% 50%',
        };
      }),
  );

  readonly recent = computed(() => this.transactionItems().slice(0, RECENT_COUNT));

  addTransaction(draft: NewTransaction): Observable<Transaction> {
    return this.api
      .addTransaction(draft)
      .pipe(tap((created) => this.allTransactions.update((list) => [...list, created])));
  }

  addPayment(draft: NewRecurringPayment): Observable<RecurringPayment> {
    return this.api
      .addPayment(draft)
      .pipe(tap((created) => this.payments.update((list) => [...list, created])));
  }

  addCard(draft: NewCreditCard): Observable<CreditCard> {
    return this.api.addCard(draft).pipe(tap((created) => this.cards.update((list) => [...list, created])));
  }

  appendTransaction(transaction: Transaction): void {
    this.allTransactions.update((list) => [...list, transaction]);
  }

  findTransaction(id: string): Transaction | undefined {
    return this.allTransactions().find((t) => t.id === id);
  }

  updateTransaction(id: string, draft: NewTransaction): Observable<Transaction> {
    return this.api
      .updateTransaction(id, draft)
      .pipe(tap((updated) => this.allTransactions.update((list) => list.map((t) => (t.id === id ? updated : t)))));
  }

  deleteTransaction(id: string): Observable<void> {
    return this.api
      .deleteTransaction(id)
      .pipe(tap(() => this.allTransactions.update((list) => list.filter((t) => t.id !== id))));
  }

  findPayment(id: string): RecurringPayment | undefined {
    return this.payments().find((p) => p.id === id);
  }

  findCard(id: string): CreditCard | undefined {
    return this.cards().find((c) => c.id === id);
  }

  updatePayment(id: string, draft: NewRecurringPayment): Observable<RecurringPayment> {
    return this.api
      .updatePayment(id, draft)
      .pipe(tap((updated) => this.payments.update((list) => list.map((p) => (p.id === id ? updated : p)))));
  }

  updateCard(id: string, draft: NewCreditCard): Observable<CreditCard> {
    return this.api
      .updateCard(id, draft)
      .pipe(tap((updated) => this.cards.update((list) => list.map((c) => (c.id === id ? updated : c)))));
  }

  findLimit(id: string): CategoryLimit | undefined {
    return this.allLimits().find((l) => l.id === id);
  }

  findGoal(id: string): SavingsGoal | undefined {
    return this.allGoals().find((g) => g.id === id);
  }

  hasLimit(categoryId: string, scope: BudgetScope, exceptId?: string): boolean {
    return this.allLimits().some(
      (l) => l.categoryId === categoryId && l.scope === scope && l.id !== exceptId,
    );
  }

  addLimit(draft: NewCategoryLimit): Observable<CategoryLimit> {
    return this.api.addLimit(draft).pipe(tap((created) => this.allLimits.update((list) => [...list, created])));
  }

  updateLimit(id: string, draft: NewCategoryLimit): Observable<CategoryLimit> {
    return this.api
      .updateLimit(id, draft)
      .pipe(tap((updated) => this.allLimits.update((list) => list.map((l) => (l.id === id ? updated : l)))));
  }

  deleteLimit(id: string): Observable<void> {
    return this.api.deleteLimit(id).pipe(tap(() => this.allLimits.update((list) => list.filter((l) => l.id !== id))));
  }

  addGoal(draft: NewSavingsGoal): Observable<SavingsGoal> {
    return this.api.addGoal(draft).pipe(tap((created) => this.allGoals.update((list) => [...list, created])));
  }

  updateGoal(id: string, draft: NewSavingsGoal): Observable<SavingsGoal> {
    return this.api
      .updateGoal(id, draft)
      .pipe(tap((updated) => this.allGoals.update((list) => list.map((g) => (g.id === id ? updated : g)))));
  }

  deleteGoal(id: string): Observable<void> {
    return this.api.deleteGoal(id).pipe(tap(() => this.allGoals.update((list) => list.filter((g) => g.id !== id))));
  }

  topUpGoal(id: string, amount: number): Observable<SavingsGoal> {
    return this.api
      .topUpGoal(id, amount)
      .pipe(tap((updated) => this.allGoals.update((list) => list.map((g) => (g.id === id ? updated : g)))));
  }

  closePayment(ref: PaymentRef): Observable<void> {
    return this.api.closePayment(ref).pipe(
      tap(() => {
        if (ref.kind === 'recurring') {
          this.payments.update((list) => list.map((p) => (p.id === ref.id ? { ...p, status: 'closed' } : p)));
        } else {
          this.cards.update((list) => list.map((c) => (c.id === ref.id ? { ...c, status: 'closed' } : c)));
        }
      }),
    );
  }

  settlePayment(ref: PaymentRef, action: PaymentAction): Observable<SettleResult> {
    return this.api.settlePayment(ref, action).pipe(
      tap(({ nextDate, transaction }) => {
        if (ref.kind === 'recurring') {
          this.payments.update((list) => list.map((p) => (p.id === ref.id ? { ...p, nextDate } : p)));
        } else {
          this.cards.update((list) => list.map((c) => (c.id === ref.id ? { ...c, dueDate: nextDate } : c)));
        }
        if (transaction) this.allTransactions.update((list) => [...list, transaction]);
      }),
    );
  }

  shiftMonth(delta: number): void {
    this.month.update(({ year, month }) => {
      const shifted = new Date(year, month - 1 + delta);
      return { year: shifted.getFullYear(), month: shifted.getMonth() + 1 };
    });
  }

  private currentMonth(): YearMonth {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() + 1 };
  }
}
