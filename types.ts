
export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  note: string;
  date: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export type AppTab = 'dashboard' | 'transactions' | 'reports' | 'ai-tips' | 'resources';

export interface GroundingLink {
  title: string;
  uri: string;
}
