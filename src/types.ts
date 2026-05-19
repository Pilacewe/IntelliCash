export interface Transaction {
  id?: string;
  userId: string;
  title: string;
  amount: number;
  category: string;
  type: 'income' | 'expense';
  date: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SavingsGoal {
  id?: string;
  userId: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  createdAt: string;
  updatedAt: string;
}

export interface UserSettings {
  userId: string;
  monthlyIncome: number;
  monthlyBudget: number;
  currency: string;
  updatedAt: string;
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
}
