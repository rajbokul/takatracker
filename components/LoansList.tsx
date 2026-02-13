
import React from 'react';
import { Transaction, TransactionType } from '../types';
import { Handshake, UserCheck, UserMinus, Clock } from 'lucide-react';

interface LoansListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  // Fix: Added isDarkMode to interface
  isDarkMode?: boolean;
}

const LoansList: React.FC<LoansListProps> = ({ transactions, onEdit, onDelete, isDarkMode }) => {
  const loans = transactions.filter(t => 
    t.type === TransactionType.LOAN_GIVEN || t.type === TransactionType.LOAN_RECEIVED
  );

  const totalGiven = loans
    .filter(l => l.type === TransactionType.LOAN_GIVEN)
    .reduce((sum, l) => sum + l.amount, 0);

  const totalReceived = loans
    .filter(l => l.type === TransactionType.LOAN_RECEIVED)
    .reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="space-y-6">
      {/* Loan Summary */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 border-l-4 border-l-blue-500 transition-colors">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Loans Given</p>
          <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">৳ {totalGiven.toLocaleString()}</p>
          <p className="text-[8px] text-gray-400 dark:text-slate-600 mt-1 italic">Money people owe you</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl shadow-sm border border-gray-100 dark:border-slate-800 border-l-4 border-l-orange-500 transition-colors">
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase">Loans Taken</p>
          <p className="text-xl font-black text-orange-600 dark:text-orange-400 mt-1">৳ {totalReceived.toLocaleString()}</p>
          <p className="text-[8px] text-gray-400 dark:text-slate-600 mt-1 italic">Money you owe others</p>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 px-1 flex items-center gap-2">
          <Clock size={18} className="text-emerald-600" /> Loan History
        </h3>
        
        {loans.map(loan => (
          <div key={loan.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm relative overflow-hidden group transition-colors">
            <div className={`absolute top-0 right-0 px-3 py-1 text-[10px] font-bold rounded-bl-xl ${
              loan.type === TransactionType.LOAN_GIVEN ? 'bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400' : 'bg-orange-100 dark:bg-orange-900/50 text-orange-600 dark:text-orange-400'
            }`}>
              {loan.type === TransactionType.LOAN_GIVEN ? 'GIVEN' : 'TAKEN'}
            </div>
            
            <div className="flex items-center gap-4 mb-4">
              <div className={`p-3 rounded-2xl ${
                loan.type === TransactionType.LOAN_GIVEN ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-500 dark:text-blue-400' : 'bg-orange-50 dark:bg-orange-900/30 text-orange-500 dark:text-orange-400'
              }`}>
                {loan.type === TransactionType.LOAN_GIVEN ? <UserMinus size={20} /> : <UserCheck size={20} />}
              </div>
              <div>
                <h4 className="font-bold text-gray-800 dark:text-slate-100">{loan.personName || 'Unnamed'}</h4>
                <p className="text-[10px] text-gray-400 dark:text-slate-500">{loan.date} • {loan.category}</p>
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="text-sm font-bold text-gray-800 dark:text-slate-100">৳ {loan.amount.toLocaleString()}</p>
                {loan.note && <p className="text-[10px] text-gray-400 dark:text-slate-500 mt-1 italic line-clamp-1">"{loan.note}"</p>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => onEdit(loan)} className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded-lg text-[10px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Edit</button>
                <button onClick={() => onDelete(loan.id)} className="px-3 py-1.5 bg-gray-50 dark:bg-slate-800 text-red-400 dark:text-red-400 rounded-lg text-[10px] font-bold hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors">Delete</button>
              </div>
            </div>
          </div>
        ))}

        {loans.length === 0 && (
          <div className="text-center py-20 bg-white/50 dark:bg-slate-900/50 rounded-[3rem] border border-dashed border-gray-200 dark:border-slate-800">
            <Handshake size={48} className="mx-auto mb-4 opacity-10" />
            <p className="text-gray-400 dark:text-slate-600 text-sm">No loan history yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoansList;
