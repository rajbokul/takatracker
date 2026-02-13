
import React, { useState, useRef } from 'react';
import { 
  Shield, 
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
  TrendingDown,
  Info,
  Smartphone as PhoneIcon,
  RefreshCw,
  ExternalLink,
  Cpu
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
  const [showPinChange, setShowPinChange] = useState(false);
  const [showInstallGuide, setShowInstallGuide] = useState(false);
  const [activeInstallTab, setActiveInstallTab] = useState<'pwa' | 'apk'>('pwa');
  
  const [showAccountForm, setShowAccountForm] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [accName, setAccName] = useState('');
  const [accType, setAccType] = useState<AccountType>(AccountType.BANK);
  const [accBalance, setAccBalance] = useState('');

  const [headForm, setHeadForm] = useState<{ type: 'INCOME' | 'EXPENSE', editingIndex: number | null, value: string } | null>(null);

  const [newPin, setNewPin] = useState('');
  const [pinMessage, setPinMessage] = useState('');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePinUpdate = () => {
    if (newPin.length === 4) {
      localStorage.setItem('taka_tracker_pin', newPin);
      setNewPin('');
      setPinMessage('PIN updated successfully!');
      setTimeout(() => setPinMessage(''), 3000);
    } else {
      setPinMessage('PIN must be 4 digits.');
    }
  };

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
    if (confirm("Are you sure you want to delete this account head?")) {
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

  const handleDeleteHead = (type: 'INCOME' | 'EXPENSE', index: number) => {
    if (confirm("Remove this category head?")) {
      if (type === 'INCOME') setIncomeHeads(prev => prev.filter((_, i) => i !== index));
      else setExpenseHeads(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleExport = () => {
    let csvContent = "Data Type,ID,Name/Category,Type,Amount/Balance,Account ID,Date,Note,Person\n";
    accounts.forEach(acc => {
      csvContent += `ACCOUNT,${acc.id},"${acc.name.replace(/"/g, '""')}",${acc.type},${acc.balance},,,, \n`;
    });
    transactions.forEach(tx => {
      csvContent += `TRANSACTION,${tx.id},"${tx.category.replace(/"/g, '""')}",${tx.type},${tx.amount},${tx.accountId},${tx.date},"${(tx.note || '').replace(/"/g, '""')}","${(tx.personName || '').replace(/"/g, '""')}"\n`;
    });
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `takatracker_backup_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const rows = text.split('\n').filter(row => row.trim() !== '');
        const importedAccounts: Account[] = [];
        const importedTransactions: Transaction[] = [];
        for (let i = 1; i < rows.length; i++) {
          const cols = rows[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          const section = cols[0];
          if (section === 'ACCOUNT') {
            importedAccounts.push({ id: cols[1], name: cols[2].replace(/^"|"$/g, '').replace(/""/g, '"'), type: cols[3] as AccountType, balance: parseFloat(cols[4]) });
          } else if (section === 'TRANSACTION') {
            importedTransactions.push({ id: cols[1], category: cols[2].replace(/^"|"$/g, '').replace(/""/g, '"'), type: cols[3] as TransactionType, amount: parseFloat(cols[4]), accountId: cols[5], date: cols[6], note: cols[7].replace(/^"|"$/g, '').replace(/""/g, '"'), personName: cols[8]?.replace(/^"|"$/g, '').replace(/""/g, '"') || undefined });
          }
        }
        if (confirm(`Detected ${importedAccounts.length} accounts and ${importedTransactions.length} transactions. This will replace current data. Continue?`)) {
          onImport({ accounts: importedAccounts, transactions: importedTransactions });
        }
      } catch (err) { alert("Failed to parse CSV file."); }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const getAccountIcon = (type: AccountType) => {
    switch (type) {
      case AccountType.BANK: return <Building2 size={16} />;
      case AccountType.MOBILE_BANKING: return <Smartphone size={16} />;
      case AccountType.CASH: return <Wallet size={16} />;
      case AccountType.CREDIT_CARD: return <CreditCard size={16} />;
    }
  };

  const clearAllData = () => {
    if (confirm("DANGER: This will delete ALL transactions and reset accounts. Continue?")) {
      localStorage.removeItem('taka_tracker_data');
      window.location.reload();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-10">
      <div className="px-1">
        <h2 className="text-xl font-bold text-gray-800 dark:text-slate-100 mb-1">Settings</h2>
        <p className="text-xs text-gray-500 dark:text-slate-400">Manage account heads and app appearance</p>
      </div>

      {/* Wallets Management */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Wallet size={18} className="text-gray-400" />
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Wallets & Accounts</h3>
          </div>
          <button onClick={handleOpenAccountAdd} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg hover:scale-110 transition-transform">
            <Plus size={16} />
          </button>
        </div>

        {showAccountForm && (
          <div className="mb-4 p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 space-y-3 relative">
            <button onClick={() => { setShowAccountForm(false); setEditingAccount(null); }} className="absolute top-2 right-2 p-1 text-gray-400"><X size={16} /></button>
            <p className="text-[10px] text-gray-400 uppercase font-bold">{editingAccount ? 'Edit Wallet' : 'New Wallet'}</p>
            <input placeholder="Name" value={accName} onChange={(e) => setAccName(e.target.value)} className="w-full p-3 bg-white dark:bg-slate-700 border-none rounded-xl text-sm text-gray-800 dark:text-white" />
            <div className="grid grid-cols-2 gap-2">
              <select value={accType} onChange={(e) => setAccType(e.target.value as AccountType)} className="p-3 bg-white dark:bg-slate-700 border-none rounded-xl text-xs text-gray-800 dark:text-white">
                {Object.values(AccountType).map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
              </select>
              <input type="number" placeholder="Balance" value={accBalance} onChange={(e) => setAccBalance(e.target.value)} className="p-3 bg-white dark:bg-slate-700 border-none rounded-xl text-sm text-gray-800 dark:text-white" />
            </div>
            <div className="flex gap-2">
              <button onClick={handleSaveAccount} className="flex-1 py-3 bg-emerald-600 text-white rounded-xl text-xs font-bold">{editingAccount ? 'Update' : 'Add'}</button>
              {editingAccount && <button onClick={() => handleDeleteAccount(editingAccount.id)} className="px-4 py-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl"><Trash2 size={16} /></button>}
            </div>
          </div>
        )}

        <div className="space-y-2">
          {accounts.map(acc => (
            <div key={acc.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-xl border border-gray-50 dark:border-slate-700 group transition-colors">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white dark:bg-slate-700 rounded-lg text-gray-400">{getAccountIcon(acc.type)}</div>
                <div>
                  <p className="text-xs font-bold text-gray-700 dark:text-slate-200">{acc.name}</p>
                  <p className="text-[9px] text-gray-400 uppercase">{acc.type.replace('_', ' ')}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm font-black text-gray-800 dark:text-slate-100">৳{acc.balance.toLocaleString()}</p>
                <button onClick={() => handleOpenAccountEdit(acc)} className="p-1.5 text-gray-400 hover:text-emerald-600"><Edit2 size={14} /></button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories / Heads */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp size={18} className="text-emerald-500" />
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Income Heads</h3>
          </div>
          <button onClick={() => handleOpenHeadAdd('INCOME')} className="p-1.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-lg"><Plus size={16} /></button>
        </div>
        <div className="flex flex-wrap gap-2">
          {incomeHeads.map((head, i) => (
            <div key={head} className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-semibold group border border-emerald-100 dark:border-emerald-900/30">
              <span onClick={() => handleOpenHeadEdit('INCOME', i)} className="cursor-pointer">{head}</span>
              <button onClick={() => handleDeleteHead('INCOME', i)} className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:text-red-500"><Trash2 size={10} /></button>
            </div>
          ))}
        </div>
      </section>

      {/* App Export & Installation Guide */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <button onClick={() => setShowInstallGuide(!showInstallGuide)} className="w-full flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Smartphone size={18} className="text-blue-500" />
            <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Export as Mobile App</h3>
          </div>
          <ChevronRight size={18} className={`text-gray-300 transition-transform ${showInstallGuide ? 'rotate-90' : ''}`} />
        </button>
        
        {showInstallGuide && (
          <div className="mt-4 pt-3 border-t border-gray-50 dark:border-slate-800 space-y-4">
            <div className="flex p-1 bg-gray-100 dark:bg-slate-800 rounded-xl">
              <button 
                onClick={() => setActiveInstallTab('pwa')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeInstallTab === 'pwa' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Instant PWA (No Download)
              </button>
              <button 
                onClick={() => setActiveInstallTab('apk')}
                className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all ${activeInstallTab === 'apk' ? 'bg-white dark:bg-slate-700 text-blue-600 shadow-sm' : 'text-gray-500'}`}
              >
                Real APK (Advanced)
              </button>
            </div>

            {activeInstallTab === 'pwa' ? (
              <div className="space-y-3 animate-in fade-in slide-in-from-left-2">
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Turn this website into a standalone app icon instantly.
                </p>
                <div className="space-y-2">
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">1</div>
                    <p className="text-[10px] text-blue-800 dark:text-blue-300">Host this code on <b>Vercel</b> or <b>GitHub Pages</b>.</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">2</div>
                    <p className="text-[10px] text-blue-800 dark:text-blue-300">Open the URL in <b>Chrome</b> (Android) or <b>Safari</b> (iOS).</p>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-2xl">
                    <div className="w-5 h-5 rounded-full bg-blue-500 text-white text-[10px] flex items-center justify-center shrink-0 mt-0.5">3</div>
                    <p className="text-[10px] text-blue-800 dark:text-blue-300">Tap <b>"Install App"</b> or <b>"Add to Home Screen"</b>.</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3 animate-in fade-in slide-in-from-right-2">
                <p className="text-[11px] text-gray-600 dark:text-slate-400 leading-relaxed">
                  Export as a physical <b>.apk</b> file for the Play Store or local sharing.
                </p>
                <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-mono text-[9px] text-slate-600 dark:text-slate-300 space-y-1">
                  <p>1. npm install @capacitor/core @capacitor/cli</p>
                  <p>2. npx cap init TakaTracker</p>
                  <p>3. npx cap add android</p>
                  <p>4. npx cap open android</p>
                </div>
                <div className="flex items-center gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-900/30 rounded-xl">
                  <Cpu size={14} className="text-amber-600" />
                  <p className="text-[9px] text-amber-700 dark:text-amber-400">Requires Android Studio and Node.js installed on your PC.</p>
                </div>
              </div>
            )}
          </div>
        )}
      </section>

      {/* App Livery */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <Palette size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">App Livery</h3>
        </div>
        <div className="grid grid-cols-5 gap-3">
          {LIVERY_OPTIONS.map(opt => (
            <button key={opt.id} onClick={() => setAccentColor(opt.id)} className="flex flex-col items-center gap-2 group">
              <div className={`w-10 h-10 rounded-full border-4 flex items-center justify-center transition-all ${accentColor === opt.id ? 'border-gray-200 dark:border-slate-600 scale-110 shadow-lg' : 'border-transparent group-hover:scale-105'}`} style={{ backgroundColor: opt.color }}>
                {accentColor === opt.id && <Check size={16} className="text-white" />}
              </div>
              <span className={`text-[9px] font-bold ${accentColor === opt.id ? 'text-gray-800 dark:text-slate-200' : 'text-gray-400'}`}>{opt.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Backup & Restore */}
      <section className="bg-white dark:bg-slate-900 p-5 rounded-[2rem] shadow-sm border border-gray-100 dark:border-slate-800 transition-colors">
        <div className="flex items-center gap-2 mb-4">
          <FileSpreadsheet size={18} className="text-gray-400" />
          <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">Backup & Restore</h3>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <button onClick={handleExport} className="flex items-center justify-center gap-2 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-2xl font-bold text-xs hover:bg-blue-100 transition-colors"><Download size={16} /> Export CSV</button>
          <button onClick={handleImportClick} className="flex items-center justify-center gap-2 p-4 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 rounded-2xl font-bold text-xs hover:bg-emerald-100 transition-colors"><Upload size={16} /> Import CSV</button>
          <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".csv" className="hidden" />
        </div>
        <button onClick={clearAllData} className="w-full mt-3 flex items-center justify-center gap-2 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-2xl font-bold text-xs hover:bg-red-100 transition-colors">
          <RefreshCw size={14} /> Reset Local Data
        </button>
      </section>

      <div className="text-center pt-10">
        <p className="text-[10px] text-gray-300 dark:text-slate-600 font-bold uppercase flex items-center justify-center gap-2">
          <Lock size={12} /> TakaTracker v1.2.0 Secure
        </p>
      </div>
    </div>
  );
};

export default Settings;
