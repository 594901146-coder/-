export enum TransactionType {
  EXPENSE = 'EXPENSE',
  INCOME = 'INCOME'
}

export enum Category {
  FOOD = '餐饮',
  TRANSPORT = '交通',
  SHOPPING = '购物',
  HOUSING = '居住',
  ENTERTAINMENT = '娱乐',
  HEALTH = '医疗',
  SALARY = '薪资',
  OTHERS = '其他'
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  category: Category | string;
  note: string;
  date: string; // ISO string
  timestamp: number;
}

export interface AiParsedResult {
  amount: number;
  category: string;
  note: string;
  type: TransactionType;
  date?: string;
}

export type ViewState = 'HOME' | 'ADD' | 'STATS' | 'SETTINGS';