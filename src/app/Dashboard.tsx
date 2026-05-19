import { useFinanceData } from '../hooks/useFinanceData';
import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowUpRight, ArrowDownRight, TrendingUp, Wallet, Activity, CreditCard } from 'lucide-react';

const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b'];

export default function Dashboard() {
  const { transactions, savingsGoals, loading } = useFinanceData();

  if (loading) {
    return <div className="animate-pulse space-y-6">
      <div className="h-32 bg-white/5 rounded-2xl w-full"></div>
      <div className="h-64 bg-white/5 rounded-2xl w-full"></div>
    </div>;
  }

  const income = transactions.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
  const expense = transactions.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
  const balance = income - expense;
  const savingRate = income > 0 ? ((income - expense) / income * 100).toFixed(1) : 0;

  // Formatting utils
  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

  // Group by date for chart
  const last7Days = [...Array(7)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - i); return d.toISOString().split('T')[0];
  }).reverse();

  const chartData = last7Days.map(date => {
    const dayTx = transactions.filter(t => t.date.startsWith(date));
    return {
      date: date.substring(5), // mm-dd
      income: dayTx.filter(t => t.type === 'income').reduce((acc, curr) => acc + curr.amount, 0),
      expense: dayTx.filter(t => t.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0),
    };
  });

  // Calculate expense by category
  const expensesByCategory = transactions.filter(t => t.type === 'expense').reduce((acc: any, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {});
  const pieData = Object.keys(expensesByCategory).map(key => ({ name: key, value: expensesByCategory[key] }));

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Overview</h1>
          <p className="text-slate-400">Welcome back! Here's your financial summary.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Balance', amount: balance, icon: Wallet, color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { title: 'Total Income', amount: income, icon: ArrowUpRight, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { title: 'Total Expense', amount: expense, icon: ArrowDownRight, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { title: 'Saving Rate', amount: `${savingRate}%`, isString: true, icon: TrendingUp, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((card, idx) => (
          <motion.div key={idx} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group hover:border-slate-600 transition-colors">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${card.bg}`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
            <p className="text-slate-400 text-sm font-medium">{card.title}</p>
            <p className="text-2xl font-semibold mt-1">
              {card.isString ? card.amount : formatCurrency(card.amount as number)}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2 glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-brand-400" /> Cashflow (Last 7 Days)
          </h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ fontSize: '14px' }}
                  formatter={(val: number) => formatCurrency(val)}
                />
                <Area type="monotone" dataKey="income" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
                <Area type="monotone" dataKey="expense" stroke="#f43f5e" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="glass-card p-6 rounded-2xl flex flex-col">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            <PieChart className="w-5 h-5 text-purple-400" /> Expenses by Category
          </h3>
          <div className="flex-1 flex items-center justify-center min-h-[200px]">
             {pieData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                      {pieData.map((_, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                    </Pie>
                    <Tooltip formatter={(val: number) => formatCurrency(val)} contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}/>
                  </PieChart>
                </ResponsiveContainer>
             ) : (
                <p className="text-slate-500">No expenses yet.</p>
             )}
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="glass-card p-0 rounded-2xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
           <h3 className="text-lg font-semibold flex items-center gap-2">
            <CreditCard className="w-5 h-5 text-brand-400" /> Recent Transactions
          </h3>
        </div>
        <div className="divide-y divide-white/5">
          {transactions.slice(0, 5).map((tx) => (
            <div key={tx.id} className="p-4 px-6 flex items-center justify-between hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                  {tx.type === 'income' ? <ArrowUpRight className="w-5 h-5" /> : <ArrowDownRight className="w-5 h-5" />}
                </div>
                <div>
                  <p className="font-medium">{tx.title}</p>
                  <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()} • {tx.category}</p>
                </div>
              </div>
              <p className={`font-semibold ${tx.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}>
                {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
              </p>
            </div>
          ))}
          {transactions.length === 0 && <p className="p-6 text-slate-400 text-center">No transactions found.</p>}
        </div>
      </motion.div>
    </div>
  );
}
