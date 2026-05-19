import React, { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { motion, AnimatePresence } from 'framer-motion';
import { Target, Plus, Pencil, Trash2, ArrowUpCircle } from 'lucide-react';
import { addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';
import { SavingsGoal } from '../types';

export default function Savings() {
  const { savingsGoals } = useFinanceData();
  const { user } = useAuth();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState<SavingsGoal | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [currentAmount, setCurrentAmount] = useState('');
  const [deadline, setDeadline] = useState('');

  // Add Funds State
  const [isAddFundsOpen, setIsAddFundsOpen] = useState(false);
  const [fundsAmount, setFundsAmount] = useState('');

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const openNewGoal = () => {
    setSelectedGoal(null);
    setTitle(''); setTargetAmount(''); setCurrentAmount(''); setDeadline('');
    setIsModalOpen(true);
  };

  const openEditGoal = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setTitle(goal.title);
    setTargetAmount(goal.targetAmount.toString());
    setCurrentAmount(goal.currentAmount.toString());
    setDeadline(goal.deadline.split('T')[0]); // assuming ISO date string
    setIsModalOpen(true);
  };

  const openAddFunds = (goal: SavingsGoal) => {
    setSelectedGoal(goal);
    setFundsAmount('');
    setIsAddFundsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    if (selectedGoal?.id) {
       await updateSavingsGoal(user.uid, selectedGoal.id, {
         title,
         targetAmount: Number(targetAmount),
         currentAmount: Number(currentAmount),
         deadline: new Date(deadline).toISOString()
       });
    } else {
       await addSavingsGoal({
         userId: user.uid,
         title,
         targetAmount: Number(targetAmount),
         currentAmount: Number(currentAmount),
         deadline: new Date(deadline).toISOString()
       });
    }
    
    setIsModalOpen(false);
  };

  const handleAddFundsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedGoal?.id) return;
    
    const amountToAdd = Number(fundsAmount);
    if (amountToAdd <= 0) return;

    await updateSavingsGoal(user.uid, selectedGoal.id, {
      currentAmount: selectedGoal.currentAmount + amountToAdd
    });

    setIsAddFundsOpen(false);
  };

  const handleDelete = async (goalId: string) => {
    if (!user || !goalId) return;
    if (window.confirm('Are you sure you want to delete this specific savings goal?')) {
      await deleteSavingsGoal(user.uid, goalId);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:justify-between md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Savings Goals</h1>
           <p className="text-slate-400">Track and achieve your financial dreams.</p>
        </div>
        <button onClick={openNewGoal} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center justify-center gap-2">
          <Plus className="w-5 h-5" /> New Goal
        </button>
      </header>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {savingsGoals.map((goal, idx) => {
          const progress = Math.min(100, Math.max(0, (goal.currentAmount / goal.targetAmount) * 100));
          const daysLeft = Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 3600 * 24));
          const isCompleted = goal.currentAmount >= goal.targetAmount;
          
          return (
            <motion.div key={goal.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group flex flex-col h-full hover:border-white/20 transition-colors">
              <div className="flex justify-between items-start mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isCompleted ? 'bg-green-500/10 text-green-400' : 'bg-purple-500/10 text-purple-400'}`}>
                  <Target className="w-6 h-6" />
                </div>
                
                <div className="flex gap-2">
                   <button onClick={() => openEditGoal(goal)} className="p-2 bg-white/5 hover:bg-brand-500/20 text-slate-400 hover:text-brand-400 rounded-lg transition-colors" title="Edit Goal">
                     <Pencil className="w-4 h-4" />
                   </button>
                   <button onClick={() => handleDelete(goal.id!)} className="p-2 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 rounded-lg transition-colors" title="Delete Goal">
                     <Trash2 className="w-4 h-4" />
                   </button>
                </div>
              </div>
              
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-1">{goal.title}</h3>
                <p className="text-slate-400 text-sm mb-6">
                  {isCompleted ? <span className="text-green-400">Target reached! 🎉</span> : (daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed')}
                </p>
                
                <div className="space-y-2 mb-6">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-200">{formatCurrency(goal.currentAmount)}</span>
                    <span className="text-slate-400">of {formatCurrency(goal.targetAmount)}</span>
                  </div>
                  <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden shadow-inner">
                    <div className={`h-full rounded-full transition-all duration-1000 ${isCompleted ? 'bg-green-400' : 'bg-gradient-to-r from-brand-400 to-purple-400'}`} style={{ width: `${progress}%` }}></div>
                  </div>
                  <div className="text-right text-xs text-brand-300">{progress.toFixed(1)}%</div>
                </div>
              </div>
              
              {!isCompleted && (
                <button 
                  onClick={() => openAddFunds(goal)}
                  className="w-full py-2.5 mt-auto rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium transition-colors flex items-center justify-center gap-2"
                >
                  <ArrowUpCircle className="w-5 h-5" /> Add Funds
                </button>
              )}
            </motion.div>
          );
        })}
        {savingsGoals.length === 0 && (
          <div className="col-span-full py-16 text-center glass-card border-dashed border-2 px-6 rounded-2xl border-white/10 flex flex-col items-center justify-center">
             <Target className="w-16 h-16 text-slate-600 mb-4" />
             <h3 className="text-xl font-semibold mb-2">No Savings Goals Yet</h3>
             <p className="text-slate-400 max-w-md mx-auto mb-6">Set a goal for your next vacation, emergency fund, or a new gadget to start tracking your progress.</p>
             <button onClick={openNewGoal} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2">
               <Plus className="w-5 h-5" /> Create Your First Goal
             </button>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10 shadow-2xl">
              <h2 className="text-xl font-bold mb-4">{selectedGoal ? 'Edit Goal' : 'New Savings Goal'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Title</label>
                  <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" placeholder="e.g. New Macbook" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Target Amount (IDR)</label>
                  <input required value={targetAmount} onChange={e=>setTargetAmount(e.target.value)} type="number" min="0" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Current Saved Amount (IDR)</label>
                  <input required value={currentAmount} onChange={e=>setCurrentAmount(e.target.value)} type="number" min="0" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Deadline</label>
                  <input required value={deadline} onChange={e=>setDeadline(e.target.value)} type="date" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 text-white focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors [color-scheme:dark]" />
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition">
                    {selectedGoal ? 'Update Goal' : 'Save Goal'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isAddFundsOpen && selectedGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-sm p-6 rounded-2xl border border-brand-500/30 shadow-2xl shadow-brand-500/10">
              <div className="w-12 h-12 bg-green-500/10 text-green-400 rounded-full flex items-center justify-center mb-4 mx-auto">
                <ArrowUpCircle className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-center mb-1">Add Funds</h2>
              <p className="text-slate-400 text-sm text-center mb-6">Contribute to {selectedGoal.title}</p>
              
              <form onSubmit={handleAddFundsSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-400 text-center">Amount to Add (IDR)</label>
                  <div className="relative text-xl">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500">Rp</span>
                    <input required value={fundsAmount} onChange={e=>setFundsAmount(e.target.value)} type="number" min="1" className="w-full bg-[#111] border border-brand-500/30 rounded-xl pl-12 pr-4 py-3 focus:ring-brand-500 focus:border-brand-500 outline-none transition-colors font-medium text-white" placeholder="100000" autoFocus />
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsAddFundsOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition shadow-lg shadow-brand-500/20">Add Funds</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
