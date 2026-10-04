export type BudgetScope = 'personal' | 'family';
export type TransactionType = 'income' | 'expense';

export interface Category {
  id: string;
  name: string;
  kind: TransactionType;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  categoryId: string;
  type: TransactionType;
  scope: BudgetScope;
  authorId: string;
  source: 'manual' | 'receipt';
}

export type NewTransaction = Omit<Transaction, 'id' | 'authorId' | 'source'>;

export interface RecurringPayment {
  id: string;
  name: string;
  kind: 'subscription' | 'loan';
  amount: number;
  period: 'month' | 'year';
  nextDate: string;
  categoryId: string;
  notifyDaysBefore: number;
  scope: BudgetScope;
  status: 'active' | 'closed';
  totalAmount?: number;
  endDate?: string;
}

export type NewRecurringPayment = Omit<RecurringPayment, 'id' | 'status'>;

export interface CreditCard {
  id: string;
  bank: string;
  amountDue: number;
  dueDate: string;
  categoryId: string;
  notifyDaysBefore: number;
  scope: BudgetScope;
  status: 'active' | 'closed';
  creditLimit?: number;
}

export type NewCreditCard = Omit<CreditCard, 'id' | 'status'>;

export interface CategoryLimit {
  id: string;
  categoryId: string;
  limit: number;
  scope: BudgetScope;
}

export type NewCategoryLimit = Omit<CategoryLimit, 'id'>;

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  deadline: string;
  scope: BudgetScope;
}

export type NewSavingsGoal = Omit<SavingsGoal, 'id'>;

export interface YearMonth {
  year: number;
  month: number;
}

export interface CategorySpend {
  categoryId: string;
  name: string;
  amount: number;
  share: number;
}

export interface LimitProgress {
  id: string;
  categoryId: string;
  name: string;
  spent: number;
  limit: number;
}

export interface UpcomingPayment {
  id: string;
  name: string;
  amount: number;
  date: string;
  kind: 'subscription' | 'loan' | 'card';
}

export interface TransactionView {
  id: string;
  categoryName: string;
  amount: number;
  type: TransactionType;
  date: string;
  source: Transaction['source'];
  authorName: string;
  authorColor: string;
}

export interface PaymentRef {
  kind: 'recurring' | 'card';
  id: string;
}

export type PaymentAction = 'confirm' | 'skip';

export interface SettleResult {
  nextDate: string;
  transaction?: Transaction;
}

export interface PaymentView {
  ref: PaymentRef;
  name: string;
  label: string;
  amount: number;
  date: string;
  closeLabel: string;
  totalAmount?: number;
  endDate?: string;
  creditLimit?: number;
  pending: boolean;
  closed: boolean;
}
