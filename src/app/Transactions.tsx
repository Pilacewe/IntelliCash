import React from 'react';
import { useState } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Search, Filter, Trash2, Edit } from 'lucide-react';
import { addTransaction, deleteTransaction } from '../services/firestore';
import { useAuth } from '../hooks/useAuth';

export default function Transactions() {
  const { transactions } = useFinanceData();
  const { user } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filterType, setFilterType] = useState('all');

  // Form State
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [type, setType] = useState<'income'|'expense'>('expense');

  const filteredData = transactions.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) && 
    (filterType === 'all' || t.type === filterType)
  );

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    await addTransaction({
      userId: user.uid,
      title,
      amount: Number(amount),
      category,
      type,
      date: new Date().toISOString()
    });
    setIsModalOpen(false);
    setTitle(''); setAmount(''); setCategory('Food'); setType('expense');
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Transactions</h1>
           <p className="text-slate-400">Manage your cashflow.</p>
        </div>
        <button id="add-transaction-btn" onClick={() => setIsModalOpen(true)} className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-xl font-medium transition flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Transaction
        </button>
      </header>

      <div className="glass-card p-4 rounded-2xl flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-5 h-5 absolute left-3 top-3 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search transactions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'income', 'expense'].map(f => (
            <button 
              key={f}
              onClick={() => setFilterType(f)}
              className={`px-4 py-2.5 rounded-xl capitalize font-medium transition ${filterType === f ? 'bg-brand-500 text-white' : 'bg-white/5 text-slate-400 hover:text-white border border-white/5 hover:border-white/10'}`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden">
         <div className="overflow-x-auto">
           <table className="w-full text-left text-sm text-slate-400">
             <thead className="bg-white/5 uppercase border-b border-white/10">
               <tr>
                 <th className="px-6 py-4 rounded-tl-2xl">Title</th>
                 <th className="px-6 py-4">Date</th>
                 <th className="px-6 py-4">Category</th>
                 <th className="px-6 py-4">Amount</th>
                 <th className="px-6 py-4 rounded-tr-2xl text-right">Actions</th>
               </tr>
             </thead>
             <tbody className="divide-y divide-white/5">
                {filteredData.map(tx => (
                  <tr key={tx.id} className="hover:bg-white/5 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-200">{tx.title}</td>
                    <td className="px-6 py-4">{new Date(tx.date).toLocaleDateString()}</td>
                    <td className="px-6 py-4"><span className="px-3 py-1 bg-white/10 rounded-full text-xs">{tx.category}</span></td>
                    <td className={`px-6 py-4 font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button onClick={() => user && deleteTransaction(user.uid, tx.id!)} className="text-slate-400 hover:text-red-400 transition p-2">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
             </tbody>
           </table>
           {filteredData.length === 0 && <div className="text-center py-12 text-slate-400">No transactions found.</div>}
         </div>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="glass-card w-full max-w-md p-6 rounded-2xl border border-white/10">
              <h2 className="text-xl font-bold mb-4">New Transaction</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4 mb-4">
                   <button type="button" onClick={() => setType('expense')} className={`py-2 rounded-xl border ${type === 'expense' ? 'bg-rose-500/20 border-rose-500 text-rose-400' : 'border-white/10 text-slate-400'}`}>Expense</button>
                   <button type="button" onClick={() => setType('income')} className={`py-2 rounded-xl border ${type === 'income' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400' : 'border-white/10 text-slate-400'}`}>Income</button>
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Title</label>
                  <input required value={title} onChange={e=>setTitle(e.target.value)} type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Amount (IDR)</label>
                  <input required value={amount} onChange={e=>setAmount(e.target.value)} type="number" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Category</label>
                  <select value={category} onChange={e=>setCategory(e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2 focus:ring-brand-500">
                    {['Food', 'Transport', 'Shopping', 'Bills', 'Education', 'Entertainment', 'Salary', 'Other'].map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="flex gap-3 mt-6">
                  <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-white/10 hover:bg-white/5 transition">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white font-medium transition">Save</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
