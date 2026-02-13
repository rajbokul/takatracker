
export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  LOAN_GIVEN = 'LOAN_GIVEN',
  LOAN_RECEIVED = 'LOAN_RECEIVED',
  TRANSFER = 'TRANSFER'
}

export enum AccountType {
  BANK = 'BANK',
  MOBILE_BANKING = 'MOBILE_BANKING',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD'
}

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  accountId: string;
  date: string;
  note: string;
  personName?: string; // For loans
  isRepayment?: boolean;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
}

export type ViewType = 'DASHBOARD' | 'TRANSACTIONS' | 'ACCOUNTS' | 'LOANS' | 'INSIGHTS' | 'SETTINGS';
