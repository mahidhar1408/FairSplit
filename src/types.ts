export interface User {
  id: string;
  name: string;
  email: string;
  initialBalance?: number;
}

export interface Group {
  id: string;
  name: string;
  description: string;
}

export interface Expense {
  id: string;
  groupId: string;
  title: string;
  amount: number;
  paidBy: string; // userId
  splitAmong: string[]; // userIds
  date: string;
}

export interface DatabaseState {
  users: User[];
  groups: Group[];
  expenses: Expense[];
}

export interface Settlement {
  from: string; // userId
  to: string; // userId
  amount: number;
}
