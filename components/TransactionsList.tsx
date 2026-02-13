
import React, { useState } from 'react';
import { Transaction, TransactionType } from '../types';
import { Search, Filter, Edit2, Trash2, Calendar } from 'lucide-react';

interface TransactionsListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  // Fix: Added isDarkMode to interface
  isDarkMode?: boolean;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const TransactionsList: React.FC<TransactionsListProps> = ({ transactions, onEdit, onDelete, isDarkMode }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState<number | 'ALL'>(now.getMonth());
  const [selectedYear, setSelectedYear] = useState<number>(now.getFullYear());

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    const matchesSearch = t.category.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         t.note.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         t.personName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'ALL' || t.type === filterType;
    const matchesMonth = selectedMonth === 'ALL' || d.getMonth() === selectedMonth;
    const matchesYear = selectedMonth === 'ALL' ? true : d.getFullYear() === selectedYear;
    
    return matchesSearch && matchesType && matchesMonth && matchesYear;
  });

  // Get unique years from transactions to populate year selector dynamically
  const availableYears = Array.from(new Set([
    ...transactions.map(t => new Date(t.date).getFullYear()),
    now.getFullYear()
  ])).sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      {/* Fix: Added dark mode classes to the sticky filter bar */}
      <div className={`sticky top-0 ${isDarkMode ? 'bg-slate-950' : 'bg-gray-50'} pt-2 pb-4 space-y-3 z-20 transition-colors`}>
        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-2xl shadow-sm focus:ring-2 focus:ring-emerald-500 outline-none text-gray-800 dark:text-slate-100"
          />
        </div>

        {/* Date Filters Row */}
        <div className="flex gap-2 items-center overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-gray-100 dark:border-slate-800 shadow-sm shrink-0">
            <Calendar size={14} className="text-emerald-600" />
            <select 
              value={selectedMonth} 
              onChange={(e) => setSelectedMonth(e.target.value === 'ALL' ? 'ALL' : parseInt(e.target.value))}
              className="bg-transparent text-[10px] font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer appearance-none pr-1"
            >
              <option value="ALL">All Time</option>
              {MONTHS.map((m, i) => <option key={m} value={i} className="dark:bg-slate-900">{m}</option>)}
            </select>
          </div>

          {selectedMonth !== 'ALL' && (
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-full border border-gray-100 dark:border-slate-800 shadow-sm shrink-0">
              <select 
                value={selectedYear} 
                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                className="bg-transparent text-[10px] font-bold text-gray-700 dark:text-slate-200 outline-none cursor-pointer appearance-none"
              >
                {availableYears.map(y => <option key={y} value={y} className="dark:bg-slate-900">{y}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Type Filter Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          {['ALL', ...Object.values(TransactionType)].map(t => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold whitespace-nowrap transition-all ${
                filterType === t 
                  ? 'bg-emerald-600 text-white shadow-md' 
                  : 'bg-white dark:bg-slate-900 text-gray-500 dark:text-slate-400 border border-gray-100 dark:border-slate-800'
              }`}
            >
              {t.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(tx => (
          <div key={tx.id} className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col gap-3 group transition-colors">
            <div className="flex justify-between items-start">
              <div className="flex gap-3">
                <div className={`p-2 rounded-xl flex-shrink-0 ${
                  tx.type === TransactionType.INCOME ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 
                  tx.type === TransactionType.EXPENSE ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' :
                  'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                }`}>
                  <span className="text-xs font-bold">{tx.type.split('_')[0]}</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-800 dark:text-slate-100 text-sm">{tx.category}</h4>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500">{tx.date}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={`font-bold ${
                  tx.type === TransactionType.INCOME ? 'text-green-600 dark:text-green-400' : 
                  tx.type === TransactionType.EXPENSE ? 'text-red-600 dark:text-red-400' :
                  'text-blue-600 dark:text-blue-400'
                }`}>
                  ৳ {tx.amount.toLocaleString()}
                </p>
                {tx.personName && <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400">to/from: {tx.personName}</p>}
              </div>
            </div>
            
            {tx.note && <p className="text-xs text-gray-500 dark:text-slate-400 bg-gray-50 dark:bg-slate-800/50 p-2 rounded-lg italic">"{tx.note}"</p>}

            <div className="flex gap-2 justify-end opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => onEdit(tx)}
                className="p-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg flex items-center gap-1 text-[10px] font-bold"
              >
                <Edit2 size={14} /> Edit
              </button>
              <button 
                onClick={() => onDelete(tx.id)}
                className="p-2 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg flex items-center gap-1 text-[10px] font-bold"
              >
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400 dark:text-slate-600">
            <Filter size={40} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No records found for this period</p>
            <button 
              onClick={() => {
                setSearchTerm('');
                setFilterType('ALL');
                setSelectedMonth('ALL');
              }}
              className="mt-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold underline"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsList;
