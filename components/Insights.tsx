
import React, { useMemo, useState } from 'react';
import { 
  PieChart as RePieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend 
} from 'recharts';
import { Transaction, TransactionType } from '../types';
import { Calendar, TrendingUp, TrendingDown } from 'lucide-react';

interface InsightsProps {
  transactions: Transaction[];
  // Fix: Added isDarkMode to interface
  isDarkMode?: boolean;
}

const COLORS = ['#10b981', '#ef4444', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#f97316'];

type FilterRange = '30_DAYS' | 'CURRENT_MONTH' | 'LAST_MONTH' | 'ALL';

const Insights: React.FC<InsightsProps> = ({ transactions, isDarkMode }) => {
  const [range, setRange] = useState<FilterRange>('30_DAYS');

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    return transactions.filter(t => {
      const tDate = new Date(t.date);
      
      switch (range) {
        case '30_DAYS': {
          const thirtyDaysAgo = new Date(today);
          thirtyDaysAgo.setDate(today.getDate() - 30);
          return tDate >= thirtyDaysAgo;
        }
        case 'CURRENT_MONTH': {
          const firstOfThisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
          return tDate >= firstOfThisMonth;
        }
        case 'LAST_MONTH': {
          const firstOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
          const lastOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
          return tDate >= firstOfLastMonth && tDate <= lastOfLastMonth;
        }
        case 'ALL':
        default:
          return true;
      }
    });
  }, [transactions, range]);

  const stats = useMemo(() => {
    return filteredTransactions.reduce((acc, t) => {
      if (t.type === TransactionType.INCOME) acc.income += t.amount;
      if (t.type === TransactionType.EXPENSE) acc.expense += t.amount;
      return acc;
    }, { income: 0, expense: 0 });
  }, [filteredTransactions]);

  const expenseByCategory = useMemo(() => {
    const categories: Record<string, number> = {};
    filteredTransactions
      .filter(t => t.type === TransactionType.EXPENSE)
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });
    return Object.entries(categories)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactions]);

  const cashflowTrend = useMemo(() => {
    const daily: Record<string, { income: number, expense: number }> = {};
    
    filteredTransactions.forEach(t => {
      // Use short date format for labels
      const dateKey = new Date(t.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!daily[dateKey]) daily[dateKey] = { income: 0, expense: 0 };
      if (t.type === TransactionType.INCOME) daily[dateKey].income += t.amount;
      if (t.type === TransactionType.EXPENSE) daily[dateKey].expense += t.amount;
    });

    return Object.entries(daily)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => new Date(a.name).getTime() - new Date(b.name).getTime())
      .slice(-10); // Show last 10 data points for readability
  }, [filteredTransactions]);

  const rangeButtons = [
    { id: '30_DAYS', label: 'Last 30 Days' },
    { id: 'CURRENT_MONTH', label: 'This Month' },
    { id: 'LAST_MONTH', label: 'Last Month' },
    { id: 'ALL', label: 'All Time' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Range Filter Bar */}
      <div className={`sticky top-0 z-20 ${isDarkMode ? 'bg-slate-950/80' : 'bg-gray-50/80'} backdrop-blur-md pt-2 pb-4 -mx-4 px-4 overflow-x-auto no-scrollbar flex gap-2 transition-colors`}>
        {rangeButtons.map(btn => (
          <button
            key={btn.id}
            onClick={() => setRange(btn.id as FilterRange)}
            className={`px-4 py-2.5 rounded-full text-[10px] font-bold whitespace-nowrap transition-all border ${
              range === btn.id 
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-200' 
                : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600'
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Period Summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-lg">
              <TrendingUp size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Total Income</span>
          </div>
          <p className="text-lg font-black text-gray-800 dark:text-slate-100">৳{stats.income.toLocaleString()}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg">
              <TrendingDown size={14} />
            </div>
            <span className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Total Expense</span>
          </div>
          <p className="text-lg font-black text-gray-800 dark:text-slate-100">৳{stats.expense.toLocaleString()}</p>
        </div>
      </div>

      {/* Expense Breakdown */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Expense Breakdown</h3>
          <Calendar size={16} className="text-gray-300 dark:text-slate-600" />
        </div>
        <div className="h-64 w-full">
          {expenseByCategory.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie
                  data={expenseByCategory}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  animationDuration={800}
                >
                  {expenseByCategory.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    fontSize: '12px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#1e293b'
                  }}
                  itemStyle={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                  formatter={(value: number) => `৳ ${value.toLocaleString()}`}
                />
                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ fontSize: '10px', paddingTop: '20px' }} />
              </RePieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 italic text-xs space-y-2">
              <p>No expenses found in this range</p>
            </div>
          )}
        </div>
      </section>

      {/* Cash Flow Trend */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 mb-6 text-sm">Cash Flow Activity</h3>
        <div className="h-64 w-full">
          {cashflowTrend.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashflowTrend} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <XAxis 
                  dataKey="name" 
                  fontSize={8} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af' }}
                />
                <YAxis 
                  fontSize={8} 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#9ca3af' }}
                  tickFormatter={(val) => `৳${val > 1000 ? (val/1000).toFixed(0)+'k' : val}`}
                />
                <Tooltip 
                  cursor={{ fill: isDarkMode ? '#334155' : '#f9fafb', radius: 8 }}
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)', 
                    fontSize: '11px',
                    backgroundColor: isDarkMode ? '#1e293b' : '#ffffff',
                    color: isDarkMode ? '#f8fafc' : '#1e293b'
                  }}
                  itemStyle={{ color: isDarkMode ? '#f8fafc' : '#1e293b' }}
                  formatter={(value: number) => `৳ ${value.toLocaleString()}`}
                />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} name="Income" animationDuration={1000} />
                <Bar dataKey="expense" fill="#ef4444" radius={[4, 4, 0, 0]} name="Expense" animationDuration={1000} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-slate-600 italic text-xs space-y-2">
              <p>Insufficient data for trending</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Insights;
