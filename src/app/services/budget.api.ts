import { Observable } from 'rxjs';
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

export interface BudgetData {
  categories: Category[];
  transactions: Transaction[];
  payments: RecurringPayment[];
  cards: CreditCard[];
  limits: CategoryLimit[];
  goals: SavingsGoal[];
}

export abstract class BudgetApi {
  abstract load(): Observable<BudgetData>;
  abstract addTransaction(draft: NewTransaction): Observable<Transaction>;
  abstract addPayment(draft: NewRecurringPayment): Observable<RecurringPayment>;
  abstract addCard(draft: NewCreditCard): Observable<CreditCard>;
  abstract updatePayment(id: string, draft: NewRecurringPayment): Observable<RecurringPayment>;
  abstract updateCard(id: string, draft: NewCreditCard): Observable<CreditCard>;
  abstract addLimit(draft: NewCategoryLimit): Observable<CategoryLimit>;
  abstract updateLimit(id: string, draft: NewCategoryLimit): Observable<CategoryLimit>;
  abstract deleteLimit(id: string): Observable<void>;
  abstract addGoal(draft: NewSavingsGoal): Observable<SavingsGoal>;
  abstract updateGoal(id: string, draft: NewSavingsGoal): Observable<SavingsGoal>;
  abstract deleteGoal(id: string): Observable<void>;
  abstract topUpGoal(id: string, amount: number): Observable<SavingsGoal>;
  abstract closePayment(ref: PaymentRef): Observable<void>;
  abstract updateTransaction(id: string, draft: NewTransaction): Observable<Transaction>;
  abstract deleteTransaction(id: string): Observable<void>;
  abstract settlePayment(ref: PaymentRef, action: PaymentAction): Observable<SettleResult>;
}
