import { addTransaction, addSavingsGoal } from '../services/firestore';
import { Transaction, SavingsGoal } from '../types';

export const seedDummyData = async (userId: string) => {
  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment'];
  const now = new Date();
  
  for (let i = 0; i < 20; i++) {
    const isExpense = Math.random() > 0.3;
    const pastDate = new Date(now.getTime() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
    
    await addTransaction({
      userId,
      title: isExpense ? `Purchase ${i}` : `Income ${i}`,
      amount: isExpense ? Math.floor(Math.random() * 500000) + 50000 : Math.floor(Math.random() * 5000000) + 1000000,
      category: isExpense ? categories[Math.floor(Math.random() * categories.length)] : 'Salary',
      type: isExpense ? 'expense' : 'income',
      date: pastDate.toISOString(),
      note: 'Auto seeded transaction'
    });
  }

  await addSavingsGoal({
    userId,
    title: 'Emergency Fund',
    targetAmount: 20000000,
    currentAmount: 8500000,
    deadline: new Date(now.getTime() + 180 * 24 * 60 * 60 * 1000).toISOString()
  });

  await addSavingsGoal({
    userId,
    title: 'New Laptop',
    targetAmount: 15000000,
    currentAmount: 4000000,
    deadline: new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000).toISOString()
  });
};
