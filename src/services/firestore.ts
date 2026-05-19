import { 
  collection, 
  doc, 
  setDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, SavingsGoal } from '../types';

export const addTransaction = async (data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const txData = { ...data, createdAt: now, updatedAt: now };
  const _db = collection(db, `users/${data.userId}/transactions`);
  return await addDoc(_db, txData);
};

export const updateTransaction = async (userId: string, txId: string, data: Partial<Transaction>) => {
  const now = new Date().toISOString();
  const txRef = doc(db, `users/${userId}/transactions`, txId);
  return await updateDoc(txRef, { ...data, updatedAt: now });
};

export const deleteTransaction = async (userId: string, txId: string) => {
  const txRef = doc(db, `users/${userId}/transactions`, txId);
  return await deleteDoc(txRef);
};

export const addSavingsGoal = async (data: Omit<SavingsGoal, 'id' | 'createdAt' | 'updatedAt'>) => {
  const now = new Date().toISOString();
  const goalData = { ...data, createdAt: now, updatedAt: now };
  const _db = collection(db, `users/${data.userId}/savingsGoals`);
  return await addDoc(_db, goalData);
};

export const updateSavingsGoal = async (userId: string, goalId: string, data: Partial<SavingsGoal>) => {
  const now = new Date().toISOString();
  const goalRef = doc(db, `users/${userId}/savingsGoals`, goalId);
  return await updateDoc(goalRef, { ...data, updatedAt: now });
};

export const deleteSavingsGoal = async (userId: string, goalId: string) => {
  const goalRef = doc(db, `users/${userId}/savingsGoals`, goalId);
  return await deleteDoc(goalRef);
};

export const updateUserSettings = async (userId: string, data: any) => {
  const now = new Date().toISOString();
  const settingsRef = doc(db, `users/${userId}/settings`, 'preferences');
  return await setDoc(settingsRef, { ...data, updatedAt: now }, { merge: true });
};
