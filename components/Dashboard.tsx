
import React from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, HandCoins } from 'lucide-react';

interface DashboardProps {
  transactions: Transaction[];
  accounts: Account[];
  onEdit: (tx: Transaction) => void;
  isDarkMode?: boolean;
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, accounts, onEdit, isDarkMode }) => {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();

  const monthlyIncome = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === TransactionType.INCOME;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpense = transactions
    .filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear && t.type === TransactionType.EXPENSE;
    })
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="space-y-6">
      {/* Balance Card */}
      <div className="bg-emerald-600 dark:bg-emerald-700 rounded-3xl p-6 text-white shadow-lg relative overflow-hidden transition-colors">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500 rounded-full opacity-20"></div>
        <div className="relative z-10">
          <p className="text-emerald-100 text-sm font-medium">Total Balance</p>
          <h2 className="text-3xl font-bold mt-1">৳ {totalBalance.toLocaleString()}</h2>
          <div className="flex gap-4 mt-6">
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3">
              <div className="flex items-center gap-1 text-emerald-100 text-xs mb-1">
                <ArrowUpRight size={14} /> Income
              </div>
              <p className="font-semibold text-sm">৳ {monthlyIncome.toLocaleString()}</p>
            </div>
            <div className="flex-1 bg-white/10 backdrop-blur-md rounded-2xl p-3">
              <div className="flex items-center gap-1 text-emerald-100 text-xs mb-1">
                <ArrowDownRight size={14} /> Expense
              </div>
              <p className="font-semibold text-sm">৳ {monthlyExpense.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Overview */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">My Accounts</h3>
        </div>
        <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
          {accounts.map(acc => (
            <div key={acc.id} className="min-w-[140px] bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm transition-colors">
              <p className="text-xs text-gray-500 dark:text-slate-400 mb-1 font-medium">{acc.name}</p>
              <p className="font-bold text-gray-800 dark:text-slate-100">৳{acc.balance.toLocaleString()}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section>
        <div className="flex justify-between items-center mb-3 px-1">
          <h3 className="font-bold text-gray-800 dark:text-slate-100">Recent Activity</h3>
          <button className="text-emerald-600 dark:text-emerald-400 text-xs font-semibold">See All</button>
        </div>
        <div className="space-y-3">
          {transactions.slice(0, 5).map(tx => (
            <div 
              key={tx.id} 
              onClick={() => onEdit(tx)}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-900 rounded-2xl border border-gray-50 dark:border-slate-800 shadow-sm active:bg-gray-50 dark:active:bg-slate-800 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${
                  tx.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                  tx.type === TransactionType.EXPENSE ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  {tx.type === TransactionType.INCOME ? <TrendingUp size={18} /> : 
                   tx.type === TransactionType.EXPENSE ? <TrendingDown size={18} /> :
                   <HandCoins size={18} />}
                </div>
                <div>
                  <p className="font-semibold text-gray-800 dark:text-slate-100 text-sm leading-tight">{tx.category}</p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold text-sm ${
                  tx.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 
                  tx.type === TransactionType.EXPENSE ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  {tx.type === TransactionType.INCOME ? '+' : '-'}৳{tx.amount.toLocaleString()}
                </p>
                {tx.personName && <p className="text-[10px] text-gray-400 dark:text-slate-500">{tx.personName}</p>}
              </div>
            </div>
          ))}
          {transactions.length === 0 && (
            <div className="text-center py-8 text-gray-400 dark:text-slate-600 italic">No transactions yet. Tap + to start!</div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Dashboard;
