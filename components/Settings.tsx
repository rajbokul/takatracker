import React, { useState, useRef } from 'react';
import { 
  Palette, 
  ChevronRight, 
  Check, 
  Lock, 
  Wallet, 
  Download, 
  Upload, 
  Plus, 
  Building2, 
  Smartphone, 
  CreditCard,
  FileSpreadsheet,
  Edit2,
  Trash2,
  X,
  TrendingUp,
  RefreshCw,
  Cpu,
  Terminal,
  Copy,
  ExternalLink,
  Package,
  Wrench
} from 'lucide-react';
import { Account, AccountType, Transaction, TransactionType } from '../types';

interface SettingsProps {
  accentColor: string;
  setAccentColor: (color: string) => void;
  accounts: Account[];
  setAccounts: React.Dispatch<React.SetStateAction<Account[]>>;
  transactions: Transaction[];
  onImport: (data: any) => void;
  onResetData: () => void;
  isDarkMode?: boolean;
  incomeHeads: string[];
  setIncomeHeads: React.Dispatch<React.SetStateAction<string[]>>;
  expenseHeads: string[];
  setExpenseHeads: React.Dispatch<React.SetStateAction<string[]>>;
}

const LIVERY_OPTIONS = [
  { id: 'emerald', color: '#10b981', label: 'Emerald' },
  { id: 'blue', color: '#3b82f6', label: 'Classic Blue' },
  { id: 'indigo', color: '#6366f1', label: 'Indigo' },
  { id: 'rose', color: '#f43f5e', label: 'Rose' },
  { id: 'slate', color: '#1e293b', label: 'Night' },
];

const Settings: React.FC<SettingsProps> = ({ 
  accentColor, 
  setAccentColor, 
  accounts, 
  setAccounts, 
  transactions, 
  onImport, 
  onResetData,
  isDarkMode,
  incomeHeads,
  setIncomeHeads,
  expenseHeads,
  setExpenseHeads
}) => {
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [showAPKGuide, setShowAPKGuide] = useState(false);
  
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>(AccountType.BANK);
  const [accBalance, setAccBalance] = useState('');

  const [headForm, setHeadForm] = useState<{ type: 'INCOME' | 'EXPENSE', editingIndex: number | null, value: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenAccountAdd = () => {
    setEditingAccount(null);
    setAccName('');
    setAccType(AccountType.BANK);
    setAccBalance('');
    setShowAccountForm(true);
  };

  const handleOpenAccountEdit = (acc: Account) => {
    setEditingAccount(acc);
    setAccName(acc.name);
    setAccType(acc.type);
    setAccBalance(acc.balance.toString());
    setShowAccountForm(true);
  };

  const handleSaveAccount = () => {
    if (!accName || !accBalance) return;
    if (editingAccount) {
      setAccounts(prev => prev.map(a => a.id === editingAccount.id ? { ...a, name: accName, type: accType, balance: parseFloat(accBalance) } : a));
    } else {
      const newAcc: Account = { id: Math.random().toString(36).substr(2, 9), name: accName, type: accType, balance: parseFloat(accBalance) };
      setAccounts([...accounts, newAcc]);
    }
    setShowAccountForm(false);
    setEditingAccount(null);
  };

  const handleDeleteAccount = (id: string) => {
    if (accounts.length <= 1) { alert("You must have at least one account."); return; }
    if (confirm("Are you sure?")) {
      setAccounts(prev => prev.filter(a => a.id !== id));
      setShowAccountForm(false);
    }
  };

  const handleOpenHeadAdd = (type: 'INCOME' | 'EXPENSE') => {
    setHeadForm({ type, editingIndex: null, value: '' });
  };

  const handleOpenHeadEdit = (type: 'INCOME' | 'EXPENSE', index: number) => {
    const heads = type === 'INCOME' ? incomeHeads : expenseHeads;
    setHeadForm({ type, editingIndex: index, value: heads[index] });
  };

  const handleSaveHead = () => {
    if (!headForm || !headForm.value.trim()) return;
    if (headForm.type === 'INCOME') {
      const newHeads = [...incomeHeads];
      if (headForm.editingIndex !== null) newHeads[headForm.editingIndex] = headForm.value;
      else newHeads.push(headForm.value);
      setIncomeHeads(newHeads);
    } else {
      const newHeads = [...expenseHeads];
      if (headForm.editingIndex !== null) newHeads[headForm.editingIndex] = headForm.value;
      else newHeads.push(headForm.value);
      setExpenseHeads(newHeads);
    }
    setHeadForm(null);
  };

  const handleExport = () => {
    let csvContent = "Data Type,ID,Name,Type,Balance,Account ID,Date,Note,Person\n";
    accounts.forEach(acc => {
      csvContent += `ACCOUNT,${acc.id},"${acc.name}",${acc.type},${acc.balance},,,, \n`;
    });
    transactions.forEach(tx => {
      csvContent += `TRANSACTION,${tx.id},"${tx.category}",${tx.type},${tx.amount},${tx.accountId},${tx.date},"${tx.note}","${tx.personName || ''}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `backup_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  // Implemented handleImportFile to process the CSV data
  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const csv = event.target?.result as string;
      const lines = csv.split('\n');
      const importedAccounts: Account[] = [];
      const importedTransactions: Transaction[] = [];
      
      lines.slice(1).forEach(line => {
        if (!line.trim()) return;
        const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
        const dataType = parts[0];
        
        if (dataType === 'ACCOUNT') {
          importedAccounts.push({
            id: parts[1],
            name: parts[2],
            type: parts[3] as AccountType,
            balance: parseFloat(parts[4])
          });
        } else if (dataType === 'TRANSACTION') {
          importedTransactions.push({
            id: parts[1],
            category: parts[2],
            type: parts[3] as TransactionType,
            amount: parseFloat(parts[4]),
            accountId: parts[5],
            date: parts[6],
            note: parts[7],
            personName: parts[8] || undefined
          });
        }
      });
      
      if (importedAccounts.length > 0) {
        onImport({ accounts: importedAccounts, transactions: importedTransactions });
        alert('Data imported successfully!');
      } else {
        alert('Invalid CSV format. No data imported.');
      }
    };
    reader.readAsText(file);
    // Clear input so same file can be imported again if needed
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="px-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">Settings</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400">Personalize your financial toolkit</p>
      </div>

      {/* APK BUILD MASTERCLASS */}
      <section className="bg-emerald-600 text-white p-6 rounded-[2.5rem] shadow-xl shadow-emerald-200 dark:shadow-none transition-all">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl">
            <Package size={22} />
          </div>
          <div>
            <h3 className="font-bold text-sm">Generate APK File</h3>
            <p className="text-[10px] opacity-80 font-medium">Turn this into a real Android App</p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="bg-emerald-700/50 p-4 rounded-2xl border border-white/10">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-100">
              <Terminal size={12} /> Step 1: Prepare Files
            </h4>
            <div className="flex items-center justify-between gap-2 p-2 bg-black/20 rounded-lg group">
              <code className="text-[9px] font-mono opacity-90 truncate">npm install & npx cap add android</code>
              <button onClick={() => copyToClipboard('npm install && npx cap add android')} className="p-1.5 hover:bg-white/10 rounded-md transition-colors">
                <Copy size={12} />
              </button>
            </div>
          </div>

          <div className="bg-emerald-700/50 p-4 rounded-2xl border border-white/10">
            <h4 className="text-[10px] font-bold uppercase tracking-wider mb-2 flex items-center gap-1.5 text-emerald-100">
              <Wrench size={12} /> Step 2: Android Studio
            </h4>
            <p className="text-[10px] leading-relaxed opacity-90">
              Open the <span className="font-bold">android</span> folder in Android Studio. Wait for Gradle sync, then go to:
              <br/><span className="bg-white/10 px-1 rounded mt-1 inline-block">Build > Build APK(s)</span>
            </p>
          </div>

          <a 
            href="https://capacitorjs.com/docs/android" 
            target="_blank" 
            className="flex items-center justify-center gap-2 py-3 bg-white text-emerald-700 rounded-xl text-xs font-bold shadow-lg active:scale-95 transition-all"
          >
            <ExternalLink size={14} /> View Full Dev Guide
          </a>
        </div>
      </section>

      {/* Wallets */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Manage Wallets</h3>
          </div>
          <button onClick={handleOpenAccountAdd} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg">
            <Plus size={16} />
          </button>
        </div>

        {showAccountForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-3">
             <input placeholder="Wallet Name" value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-700 border-none rounded-xl text-sm" />
             <div className="flex gap-2">
                <button onClick={handleSaveAccount} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold">Save</button>
                <button onClick={() => setShowAccountForm(false)} className="px-4 py-3 bg-gray-100 dark:bg-slate-600 rounded-xl text-xs">Cancel</button>
             </div>
          </div>
        )}

        <div className="space-y-2">
          {accounts.map(acc => (
            <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-50 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400">
                  {acc.type === AccountType.BANK ? <Building2 size={16} /> : <Smartphone size={16} />}
                </div>
                <p className="text-xs font-bold text-gray-700 dark:text-slate-200">{acc.name}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black">৳{acc.balance.toLocaleString()}</span>
                <button onClick={() => handleOpenAccountEdit(acc)} className="p-1.5 text-gray-400"><Edit2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* App Livery */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Theme Color</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {LIVERY_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setAccentColor(opt.id)} className="flex flex-col items-center gap-2">
              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${accentColor === opt.id ? 'border-gray-200 dark:border-slate-600 scale-110' : 'border-transparent'}`} style={{ backgroundColor: opt.color }}>
                {accentColor === opt.id && <Check size={16} className="text-white" />}
              </div>
              <span className="text-[9px] font-bold text-gray-400">{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Backup & Restore */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Data Management</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-bold text-xs"><Download size={16} /> Export CSV</button>
          <button onClick={() => fileInputRef.current?.click()} className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-xs"><Upload size={16} /> Import CSV</button>
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleImportFile} accept=".csv" />
        </div>
        {/* Fix: use the correct prop onResetData instead of the undefined clearAllData */}
        <button onClick={onResetData} className="w-full mt-3 flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs">
          <RefreshCw size={14} /> Reset Local Data
        </button>
      </section>

      <div className="text-center pt-10">
        <p className="text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase flex items-center justify-center gap-2">
          <Lock size={12} /> TakaTracker Secure Native Engine
        </p>
      </div>
    </div>
  );
};

export default Settings;