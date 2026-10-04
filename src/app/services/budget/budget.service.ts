import { HttpClient } from '@angular/common/http';
import { Service, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_URL } from '@/constants/api.constants';
import {
  BudgetData,
  CategoryLimit,
  CreditCard,
  NewCategoryLimit,
  NewCreditCard,
  NewRecurringPayment,
  NewSavingsGoal,
  NewTransaction,
  PaymentAction,
  PaymentRef,
  RecurringPayment,
  SavingsGoal,
  SettleResult,
  Transaction,
} from '@/models/budget.model';

const BASE = `${API_URL}/budget`;
const toVoid = map(() => undefined);
const group = (ref: PaymentRef) => (ref.kind === 'card' ? 'cards' : 'payments');

@Service()
export class BudgetService {
  private readonly http = inject(HttpClient);

  load(): Observable<BudgetData> {
    return this.http.get<BudgetData>(BASE);
  }

  addTransaction(draft: NewTransaction): Observable<Transaction> {
    return this.http.post<Transaction>(`${BASE}/transactions`, draft);
  }

  updateTransaction(id: string, draft: NewTransaction): Observable<Transaction> {
    return this.http.put<Transaction>(`${BASE}/transactions/${id}`, draft);
  }

  deleteTransaction(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/transactions/${id}`).pipe(toVoid);
  }

  addPayment(draft: NewRecurringPayment): Observable<RecurringPayment> {
    return this.http.post<RecurringPayment>(`${BASE}/payments`, draft);
  }

  updatePayment(id: string, draft: NewRecurringPayment): Observable<RecurringPayment> {
    return this.http.put<RecurringPayment>(`${BASE}/payments/${id}`, draft);
  }

  addCard(draft: NewCreditCard): Observable<CreditCard> {
    return this.http.post<CreditCard>(`${BASE}/cards`, draft);
  }

  updateCard(id: string, draft: NewCreditCard): Observable<CreditCard> {
    return this.http.put<CreditCard>(`${BASE}/cards/${id}`, draft);
  }

  closePayment(ref: PaymentRef): Observable<void> {
    return this.http.post<void>(`${BASE}/${group(ref)}/${ref.id}/close`, {}).pipe(toVoid);
  }

  settlePayment(ref: PaymentRef, action: PaymentAction): Observable<SettleResult> {
    return this.http.post<SettleResult>(`${BASE}/${group(ref)}/${ref.id}/settle`, { action });
  }

  addLimit(draft: NewCategoryLimit): Observable<CategoryLimit> {
    return this.http.post<CategoryLimit>(`${BASE}/limits`, draft);
  }

  updateLimit(id: string, draft: NewCategoryLimit): Observable<CategoryLimit> {
    return this.http.put<CategoryLimit>(`${BASE}/limits/${id}`, draft);
  }

  deleteLimit(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/limits/${id}`).pipe(toVoid);
  }

  addGoal(draft: NewSavingsGoal): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${BASE}/goals`, draft);
  }

  updateGoal(id: string, draft: NewSavingsGoal): Observable<SavingsGoal> {
    return this.http.put<SavingsGoal>(`${BASE}/goals/${id}`, draft);
  }

  deleteGoal(id: string): Observable<void> {
    return this.http.delete<void>(`${BASE}/goals/${id}`).pipe(toVoid);
  }

  topUpGoal(id: string, amount: number): Observable<SavingsGoal> {
    return this.http.post<SavingsGoal>(`${BASE}/goals/${id}/top-up`, { amount });
  }
}
