import { useState, useEffect } from 'react';
import { collection, query, onSnapshot, orderBy, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { Transaction, SavingsGoal, UserSettings } from '../types';
import { useAuth } from './useAuth';
import { seedDummyData } from '../utils/seed';

export function useFinanceData() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const txQuery = query(
      collection(db, `users/${user.uid}/transactions`),
      orderBy('date', 'desc')
    );

    const unsubTx = onSnapshot(txQuery, async (snapshot) => {
      const txData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Transaction));
      
      if (txData.length === 0 && !localStorage.getItem(`seeded_${user.uid}`)) {
        console.log("Seeding initial data...");
        localStorage.setItem(`seeded_${user.uid}`, 'true');
        await seedDummyData(user.uid);
      } else {
        setTransactions(txData);
      }
    });

    const savingsQuery = query(
      collection(db, `users/${user.uid}/savingsGoals`),
      orderBy('createdAt', 'desc')
    );

    const unsubSavings = onSnapshot(savingsQuery, (snapshot) => {
      setSavingsGoals(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SavingsGoal)));
      setLoading(false);
    });

    const settingsRef = doc(db, `users/${user.uid}/settings`, 'preferences');
    const unsubSettings = onSnapshot(settingsRef, (docSnap) => {
      if (docSnap.exists()) {
        setSettings(docSnap.data() as UserSettings);
      } else {
        const defaultSettings: UserSettings = {
          userId: user.uid,
          monthlyIncome: 15000000,
          monthlyBudget: 10000000,
          currency: 'IDR',
          updatedAt: new Date().toISOString()
        };
        setDoc(settingsRef, defaultSettings);
        setSettings(defaultSettings);
      }
    });

    return () => {
      unsubTx();
      unsubSavings();
      unsubSettings();
    };
  }, [user]);

  return { transactions, savingsGoals, settings, loading };
}
