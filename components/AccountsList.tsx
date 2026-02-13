
import React, { useState } from 'react';
import { Account, AccountType } from '../types';
import { Plus, Wallet, Building2, Smartphone, CreditCard, Edit2, Trash2, X } from 'lucide-react';

interface AccountsListProps {
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  isDarkMode?: boolean;
}

const AccountsList: React.FC<AccountsListProps> = ({ accounts, setAccounts, isDarkMode }) => {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<AccountType>(AccountType.BANK);
  const [newBalance, setNewBalance] = useState('');

  const handleOpenAdd = () => {
    setEditingId(null);
    setNewName('');
    setNewType(AccountType.BANK);
    setNewBalance('');
    setShowAdd(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingId(acc.id);
    setNewName(acc.name);
    setNewType(acc.type);
    setNewBalance(acc.balance.toString());
    setShowAdd(true);
  };

  const handleSave = () => {
    if (!newName || !newBalance) return;
    if (editingId) {
      setAccounts(prev => prev.map(a => a.id === editingId ? { ...a, name: newName, type: newType, balance: parseFloat(newBalance) } : a));
    } else {
      const newAcc: Account = {
        id: Math.random().toString(36).substr(2, 9),
        name: newName,
        type: newType,
        balance: parseFloat(newBalance)
      };
      setAccounts([...accounts, newAcc]);
    }
    setShowAdd(false);
  };

  const handleDelete = (id: string) => {
    if (accounts.length <= 1) return;
    if (confirm("Delete this wallet?")) {
      setAccounts(prev => prev.filter(a => a.id !== id));
    }
  };

  const getIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.BANK: return <Building2 size={24} />;
      case AccountType.MOBILE_BANKING: return <Smartphone size={24} />;
      case AccountType.CASH: return <Wallet size={24} />;
      case AccountType.CREDIT_CARD: return <CreditCard size={24} />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center px-1">
        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-lg">Your Wallets</h3>
        <button 
          onClick={handleOpenAdd}
          className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-bold text-sm"
        >
          <Plus size={18} /> New Wallet
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {accounts.map(acc => (
          <div key={acc.id} className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-gray-100 dark:border-slate-800 shadow-sm flex items-center gap-4 group transition-colors">
            <div className={`p-3 rounded-2xl ${
              acc.type === AccountType.BANK ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' :
              acc.type === AccountType.MOBILE_BANKING ? 'bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400' :
              acc.type === AccountType.CASH ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
              'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400'
            }`}>
              {getIcon(acc.type)}
            </div>
            <div className="flex-1">
              <h4 className="font-bold text-gray-800 dark:text-slate-100">{acc.name}</h4>
              <p className="text-[10px] text-gray-400 dark:text-slate-500 font-bold uppercase">{acc.type.replace('_', ' ')}</p>
            </div>
            <div className="text-right flex flex-col items-end">
              <p className="text-xl font-black text-gray-800 dark:text-slate-100">৳ {acc.balance.toLocaleString()}</p>
              <div className="flex gap-2 mt-1">
                <button onClick={() => handleOpenEdit(acc)} className="p-1 text-gray-400 hover:text-emerald-600 transition-colors"><Edit2 size={12} /></button>
                <button onClick={() => handleDelete(acc.id)} className="p-1 text-gray-400 hover:text-red-600 transition-colors"><Trash2 size={12} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showAdd && (
        <div className="fixed inset-0 z-[60] bg-black/50 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2rem] p-6 shadow-2xl animate-in fade-in zoom-in duration-200 transition-colors">
            <h3 className="text-xl font-bold mb-4 text-gray-800 dark:text-slate-100">{editingId ? 'Edit Wallet' : 'Add Wallet'}</h3>
            <div className="space-y-4">
              <input 
                placeholder="Wallet Name (e.g. City Bank)" 
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <select 
                value={newType}
                onChange={(e) => setNewType(e.target.value as AccountType)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              >
                {Object.values(AccountType).map(t => <option key={t} value={t} className="dark:bg-slate-900">{t.replace('_', ' ')}</option>)}
              </select>
              <input 
                placeholder="Initial Balance" 
                type="number"
                value={newBalance}
                onChange={(e) => setNewBalance(e.target.value)}
                className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500"
              />
              <div className="flex gap-3 pt-2">
                <button 
                  onClick={() => setShowAdd(false)}
                  className="flex-1 py-4 text-gray-500 dark:text-slate-400 font-bold hover:bg-gray-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleSave}
                  className="flex-1 py-4 bg-emerald-600 dark:bg-emerald-700 text-white font-bold rounded-2xl shadow-lg hover:bg-emerald-700 dark:hover:bg-emerald-800 transition-all"
                >
                  {editingId ? 'Update' : 'Add Wallet'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountsList;
