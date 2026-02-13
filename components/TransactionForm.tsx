
import React, { useState } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { X, Check, Wallet } from 'lucide-react';

interface TransactionFormProps {
  accounts: Account[];
  editingTx: Transaction | null;
  onSave: (tx: Partial<Transaction>) => void;
  onClose: () => void;
  isDarkMode?: boolean;
  incomeHeads: string[];
  expenseHeads: string[];
}

const LOAN_HEADS = ['Family', 'Friend', 'Bank', 'Colleague', 'Other'];

const TransactionForm: React.FC<TransactionFormProps> = ({ accounts, editingTx, onSave, onClose, isDarkMode, incomeHeads, expenseHeads }) => {
  const [type, setType] = useState<TransactionType>(editingTx?.type || TransactionType.EXPENSE);
  const [amount, setAmount] = useState<string>(editingTx?.amount.toString() || '');
  const [category, setCategory] = useState<string>(editingTx?.category || '');
  const [accountId, setAccountId] = useState<string>(editingTx?.accountId || accounts[0]?.id || '');
  const [date, setDate] = useState<string>(editingTx?.date || new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState<string>(editingTx?.note || '');
  const [personName, setPersonName] = useState<string>(editingTx?.personName || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !accountId) return;

    onSave({
      ...(editingTx?.id ? { id: editingTx.id } : {}),
      type,
      amount: parseFloat(amount),
      category,
      accountId,
      date,
      note,
      personName: (type === TransactionType.LOAN_GIVEN || type === TransactionType.LOAN_RECEIVED) ? personName : undefined
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-t-[2.5rem] sm:rounded-3xl p-6 pb-10 sm:pb-6 shadow-2xl animate-in slide-in-from-bottom duration-300 transition-colors">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100">
            {editingTx ? 'Edit Transaction' : 'New Entry'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full text-gray-400">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-2xl">
            {[
              { id: TransactionType.EXPENSE, label: 'Expense' },
              { id: TransactionType.INCOME, label: 'Income' },
              { id: TransactionType.LOAN_GIVEN, label: 'Lent' },
              { id: TransactionType.LOAN_RECEIVED, label: 'Borrowed' },
            ].map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => { setType(t.id); setCategory(''); }}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                  type === t.id ? 'bg-white dark:bg-slate-700 text-gray-800 dark:text-white shadow-sm' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Amount (BDT)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-xl">৳</span>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-4 bg-gray-50 dark:bg-slate-800 border-none rounded-2xl text-2xl font-bold text-gray-800 dark:text-white focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Head (Category)</label>
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-semibold text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                required
              >
                <option value="">Select Head</option>
                {type === TransactionType.INCOME && incomeHeads.map(c => <option key={c} value={c}>{c}</option>)}
                {type === TransactionType.EXPENSE && expenseHeads.map(c => <option key={c} value={c}>{c}</option>)}
                {(type === TransactionType.LOAN_GIVEN || type === TransactionType.LOAN_RECEIVED) && LOAN_HEADS.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Wallet Head</label>
              <div className="relative">
                <select 
                  value={accountId}
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm font-bold text-emerald-600 dark:text-emerald-400 focus:ring-2 focus:ring-emerald-500 appearance-none"
                  required
                >
                  {accounts.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                </select>
                <Wallet size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 pointer-events-none" />
              </div>
            </div>

            {(type === TransactionType.LOAN_GIVEN || type === TransactionType.LOAN_RECEIVED) && (
              <div className="col-span-2">
                <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Person / Party</label>
                <input 
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder="Enter name"
                  className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            )}

            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Date</label>
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="col-span-2">
              <label className="text-[10px] uppercase font-bold text-gray-400 dark:text-slate-500 mb-1 block">Notes</label>
              <textarea 
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Transaction details..."
                rows={2}
                className="w-full p-3 bg-gray-50 dark:bg-slate-800 border-none rounded-xl text-sm text-gray-700 dark:text-slate-200 focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-emerald-600 dark:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-colors mt-4 flex items-center justify-center gap-2"
          >
            <Check size={20} />
            {editingTx ? 'Confirm Edit' : 'Complete Entry'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TransactionForm;
