import { useFinanceData } from '../hooks/useFinanceData';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend, PieChart, Pie, Cell } from 'recharts';
import { Zap, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { useEffect, useState } from 'react';
import { getAIInsights } from '../services/gemini';

const COLORS = ['#10b981', '#f43f5e', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#06b6d4'];

export default function Analytics() {
  const { transactions, savingsGoals } = useFinanceData();
  const [insights, setInsights] = useState<string[]>([]);
  const [loadingAI, setLoadingAI] = useState(false);

  useEffect(() => {
    if (transactions.length > 0) {
      const fetchInsights = async () => {
        setLoadingAI(true);
        try {
          const aiData = await getAIInsights(transactions, savingsGoals);
          setInsights(aiData);
        } catch (e) {
          console.error(e);
        }
        setLoadingAI(false);
      };
      
      const lastFetch = localStorage.getItem('lastInsightFetch');
      const now = new Date().getTime();
      if (!lastFetch || now - parseInt(lastFetch) > 3600000) { // cache 1 hr
        fetchInsights();
        localStorage.setItem('lastInsightFetch', now.toString());
      } else {
        const cached = localStorage.getItem('cachedInsights');
        if (cached) setInsights(JSON.parse(cached));
        else fetchInsights();
      }
    }
  }, [transactions]);

  useEffect(() => {
    if (insights.length > 0) {
      localStorage.setItem('cachedInsights', JSON.stringify(insights));
    }
  }, [insights]);

  const currentMonth = new Date().toISOString().substring(0, 7); // yyyy-mm

  let totalIncome = 0;
  let totalExpense = 0;

  // Aggregate monthly data & current month total & categories
  const monthlyDataMap: any = {};
  const categoryMap: any = {};

  transactions.forEach(tx => {
    const month = tx.date.substring(0, 7);
    if (!monthlyDataMap[month]) monthlyDataMap[month] = { name: month, income: 0, expense: 0 };
    monthlyDataMap[month][tx.type] += tx.amount;

    if (month === currentMonth) {
      if (tx.type === 'income') totalIncome += tx.amount;
      if (tx.type === 'expense') {
        totalExpense += tx.amount;
        categoryMap[tx.category] = (categoryMap[tx.category] || 0) + tx.amount;
      }
    }
  });

  const barData = Object.values(monthlyDataMap).sort((a: any, b: any) => a.name.localeCompare(b.name));
  
  const pieData = Object.keys(categoryMap).map(category => ({
    name: category.charAt(0).toUpperCase() + category.slice(1),
    value: categoryMap[category]
  })).sort((a, b) => b.value - a.value);

  const formatCurrency = (val: number) => new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(val);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((netSavings / totalIncome) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Analytics Overview</h1>
        <p className="text-slate-400">Deep dive into your financial habits and trends.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
              <TrendingUp className="w-16 h-16 text-green-400" />
           </div>
           <p className="text-slate-400 text-sm font-medium mb-1">Income (This Month)</p>
           <h3 className="text-3xl font-bold text-white">Rp {formatCurrency(totalIncome)}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
              <TrendingDown className="w-16 h-16 text-red-400" />
           </div>
           <p className="text-slate-400 text-sm font-medium mb-1">Expenses (This Month)</p>
           <h3 className="text-3xl font-bold text-white">Rp {formatCurrency(totalExpense)}</h3>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition duration-500">
              <DollarSign className="w-16 h-16 text-brand-400" />
           </div>
           <p className="text-slate-400 text-sm font-medium mb-1">Savings Rate</p>
           <h3 className="text-3xl font-bold text-white tracking-tight">{savingsRate}%</h3>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Cashflow Bar Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 }} className="glass-card p-6 rounded-2xl lg:col-span-2 shadow-2xl">
          <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
            Monthly Cashflow
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                <XAxis dataKey="name" stroke="#94a3b8" axisLine={false} tickLine={false} />
                <YAxis stroke="#94a3b8" tickFormatter={val => `${val / 1000}k`} axisLine={false} tickLine={false} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}
                  formatter={(val: number) => `Rp ${formatCurrency(val)}`}
                />
                <Legend wrapperStyle={{ paddingTop: '20px' }} iconType="circle" />
                <Bar dataKey="income" name="Income" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={50} />
                <Bar dataKey="expense" name="Expense" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Expenses by Category Pie Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4 }} className="glass-card p-6 rounded-2xl flex flex-col shadow-2xl">
           <h3 className="text-lg font-semibold mb-2">Expenses by Category</h3>
           <p className="text-sm text-slate-400 mb-4">Current Month ({currentMonth})</p>
           
           {pieData.length > 0 ? (
             <div className="flex-1 flex flex-col items-center justify-center min-h-[320px]">
               <div className="h-48 w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                     <Tooltip 
                       contentStyle={{ backgroundColor: '#111', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }}
                       formatter={(val: number) => `Rp ${formatCurrency(val)}`}
                       itemStyle={{ color: '#fff' }}
                     />
                     <Pie
                       data={pieData}
                       cx="50%"
                       cy="50%"
                       innerRadius={60}
                       outerRadius={80}
                       paddingAngle={5}
                       dataKey="value"
                       stroke="none"
                     >
                       {pieData.map((entry, index) => (
                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                     </Pie>
                   </PieChart>
                 </ResponsiveContainer>
               </div>
               
               <div className="w-full mt-6 grid grid-cols-2 gap-3 max-h-32 overflow-y-auto pr-2 custom-scrollbar">
                 {pieData.map((entry, idx) => (
                   <div key={idx} className="flex items-center gap-2 text-sm">
                     <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                     <span className="text-slate-300 truncate" title={entry.name}>{entry.name}</span>
                   </div>
                 ))}
               </div>
             </div>
           ) : (
             <div className="flex-1 flex items-center justify-center text-slate-500">
               No expenses this month.
             </div>
           )}
        </motion.div>
      </div>

      {/* AI Insights */}
      <motion.div id="analytics-ai-insights" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-gradient-to-r from-brand-500/10 to-purple-500/10 p-6 rounded-2xl relative overflow-hidden border border-brand-500/20 shadow-lg shadow-brand-500/5 mt-6">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-brand-400 to-purple-400"></div>
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <Zap className="w-5 h-5 text-brand-400 fill-brand-400/20" /> IntelliCash Insights
        </h3>
        {loadingAI ? (
          <div className="animate-pulse space-y-3">
             <div className="h-4 bg-white/5 rounded w-3/4"></div>
             <div className="h-4 bg-white/5 rounded w-1/2"></div>
             <div className="h-4 bg-white/5 rounded w-5/6"></div>
          </div>
        ) : (
          <ul className="space-y-4">
            {insights.map((insight, idx) => (
              <li key={idx} className="flex gap-4 text-slate-300 bg-[#0A0A0A]/50 p-4 rounded-xl border border-white/5">
                <span className="text-brand-400 font-bold mt-0.5">•</span> 
                <span className="leading-relaxed">{insight}</span>
              </li>
            ))}
            {insights.length === 0 && <p className="text-slate-400">Add more transactions to get personalized financial insights from our AI.</p>}
          </ul>
        )}
      </motion.div>
    </div>
  );
}
