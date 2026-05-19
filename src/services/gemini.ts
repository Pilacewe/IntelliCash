import { Transaction, SavingsGoal } from '../types';

export const getAIInsights = async (transactions: Transaction[], savings: SavingsGoal[]) => {
  const response = await fetch('/api/gemini/insights', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ transactionData: transactions, savingsData: savings })
  });
  const data = await response.json();
  return data.insights || [];
};

export const sendAIChatMessage = async (messages: {role: string, content: string}[], transactions: Transaction[], savings: SavingsGoal[]) => {
  const response = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, transactionData: transactions, savingsData: savings })
  });
  const data = await response.json();
  return data.text;
};
