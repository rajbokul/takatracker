
import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, 
  ArrowLeftRight, 
  Wallet, 
  HandCoins, 
  PieChart, 
  Plus, 
  Sparkles,
  LogOut,
  Settings as SettingsIcon,
  Moon,
  Sun,
  WifiOff,
  Cloud
} from 'lucide-react';
import { 
  Transaction, 
  Account, 
  TransactionType, 
  AccountType, 
  ViewType 
} from './types.ts';
import Dashboard from './components/Dashboard.tsx';
import TransactionsList from './components/TransactionsList.tsx';
import AccountsList from './components/AccountsList.tsx';
import LoansList from './components/LoansList.tsx';
import Insights from './components/Insights.tsx';
import TransactionForm from './components/TransactionForm.tsx';
import AIAssistant from './components/AIAssistant.tsx';
import Auth from './components/Auth.tsx';
import Settings from './components/Settings.tsx';

const STORAGE_KEY = 'taka_tracker_data';
const LIVERY_KEY = 'taka_tracker_livery';
const THEME_KEY = 'taka_tracker_theme';
const CATEGORIES_KEY = 'taka_tracker_categories';
const SESSION_TIMEOUT_MS = 5 * 60 * 1000; // Increased to 5 mins for local usage convenience

const DEFAULT_INCOME_HEADS = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const DEFAULT_EXPENSE_HEADS = ['Food', 'Rent', 'Shopping', 'Utility', 'Health', 'Travel', 'Entertainment', 'Subscription', 'Other'];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewType>('DASHBOARD');
  const [accentColor, setAccentColor] = useState('emerald');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const [incomeHeads, setIncomeHeads] = useState<string[]>(DEFAULT_INCOME_HEADS);
  const [expenseHeads, setExpenseHeads] = useState<string[]>(DEFAULT_EXPENSE_HEADS);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Pocket Cash', type: AccountType.CASH, balance: 0 },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const activityTimerRef = useRef<number | null>(null);

  // Monitor Network
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => setIsOnline(false);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  const resetActivityTimer = () => {
    if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    if (isAuthenticated) {
      activityTimerRef.current = window.setTimeout(() => {
        handleLogout();
      }, SESSION_TIMEOUT_MS);
    }
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    const handler = () => resetActivityTimer();
    if (isAuthenticated) {
      events.forEach(event => window.addEventListener(event, handler));
      resetActivityTimer();
    }
    return () => {
      events.forEach(event => window.removeEventListener(event, handler));
      if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    };
  }, [isAuthenticated]);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const savedLivery = localStorage.getItem(LIVERY_KEY);
    const savedTheme = localStorage.getItem(THEME_KEY);
    const savedCats = localStorage.getItem(CATEGORIES_KEY);

    if (savedLivery) setAccentColor(savedLivery);
    if (savedTheme) setIsDarkMode(savedTheme === 'dark');
    if (savedCats) {
      try {
        const { income, expense } = JSON.parse(savedCats);
        if (income) setIncomeHeads(income);
        if (expense) setExpenseHeads(expense);
      } catch(e) { console.error(e); }
    }
    
    if (saved) {
      try {
        const { transactions: t, accounts: a } = JSON.parse(saved);
        if (t && a) {
          setTransactions(t);
          setAccounts(a);
        }
      } catch (e) { console.error(e); }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem(THEME_KEY, isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, accounts }));
    localStorage.setItem(LIVERY_KEY, accentColor);
    localStorage.setItem(CATEGORIES_KEY, JSON.stringify({ income: incomeHeads, expense: expenseHeads }));
  }, [transactions, accounts, accentColor, incomeHeads, expenseHeads]);

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
  };

  const addTransaction = (newTx: Omit<Transaction, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9);
    const tx = { ...newTx, id };
    setTransactions([tx, ...transactions]);
    updateAccountBalance(tx.accountId, tx.amount, tx.type);
    setIsFormOpen(false);
  };

  const updateTransaction = (updatedTx: Transaction) => {
    const oldTx = transactions.find(t => t.id === updatedTx.id);
    if (!oldTx) return;
    updateAccountBalance(oldTx.accountId, -oldTx.amount, oldTx.type);
    updateAccountBalance(updatedTx.accountId, updatedTx.amount, updatedTx.type);
    setTransactions(transactions.map(t => t.id === updatedTx.id ? updatedTx : t));
    setEditingTransaction(null);
    setIsFormOpen(false);
  };

  const deleteTransaction = (id: string) => {
    const foundTx = transactions.find(t => t.id === id);
    if (foundTx) updateAccountBalance(foundTx.accountId, -foundTx.amount, foundTx.type);
    setTransactions(transactions.filter(t => t.id !== id));
  };

  const updateAccountBalance = (accountId: string, amount: number, type: TransactionType) => {
    setAccounts(prev => prev.map(acc => {
      if (acc.id !== accountId) return acc;
      let diff = 0;
      switch (type) {
        case TransactionType.INCOME:
        case TransactionType.LOAN_RECEIVED: diff = amount; break;
        case TransactionType.EXPENSE:
        case TransactionType.LOAN_GIVEN: diff = -amount; break;
      }
      return { ...acc, balance: acc.balance + diff };
    }));
  };

  const colorClasses: Record<string, string> = {
    emerald: 'bg-emerald-600',
    blue: 'bg-blue-600',
    indigo: 'bg-indigo-600',
    rose: 'bg-rose-600',
    slate: 'bg-slate-800'
  };

  const textClasses: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    slate: 'text-slate-800'
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`flex flex-col h-screen max-w-md mx-auto relative overflow-hidden transition-colors duration-300 bg-gray-50 dark:bg-slate-950`}>
      {/* Header with Safe Area support */}
      <header className={`${colorClasses[accentColor]} text-white px-4 pt-[env(safe-area-inset-top,20px)] pb-4 flex justify-between items-center sticky top-0 z-30 shadow-md`}>
        <div className="flex items-center gap-3">
          <div className="bg-white rounded-xl p-1.5 shadow-sm">
            <span className={`${textClasses[accentColor]} font-black text-lg`}>৳</span>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight leading-none">TakaTracker</h1>
            <div className="flex items-center gap-1.5 mt-1">
               {isOnline ? <Cloud size={10} className="text-emerald-300" /> : <WifiOff size={10} className="text-red-300" />}
               <span className="text-[9px] uppercase font-bold tracking-wider opacity-80">
                 {isOnline ? 'Local Sync Active' : 'Offline Mode'}
               </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 bg-white/10 rounded-full active:scale-90 transition-transform">
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button onClick={() => setView('SETTINGS')} className="p-2.5 bg-white/10 rounded-full active:scale-90 transition-transform">
            <SettingsIcon size={18} />
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-28">
        <div className="page-transition">
          {view === 'DASHBOARD' && <Dashboard transactions={transactions} accounts={accounts} onEdit={(tx) => {setEditingTransaction(tx); setIsFormOpen(true);}} isDarkMode={isDarkMode} />}
          {view === 'TRANSACTIONS' && <TransactionsList transactions={transactions} onEdit={(tx) => {setEditingTransaction(tx); setIsFormOpen(true);}} onDelete={deleteTransaction} isDarkMode={isDarkMode} />}
          {view === 'ACCOUNTS' && <AccountsList accounts={accounts} setAccounts={setAccounts} isDarkMode={isDarkMode} />}
          {view === 'LOANS' && <LoansList transactions={transactions} onEdit={(tx) => {setEditingTransaction(tx); setIsFormOpen(true);}} onDelete={deleteTransaction} isDarkMode={isDarkMode} />}
          {view === 'INSIGHTS' && <Insights transactions={transactions} isDarkMode={isDarkMode} />}
          {view === 'SETTINGS' && (
            <Settings 
              accentColor={accentColor} setAccentColor={setAccentColor}
              accounts={accounts} setAccounts={setAccounts}
              transactions={transactions} onImport={(d) => {setAccounts(d.accounts); setTransactions(d.transactions);}}
              onResetData={() => {}}
              isDarkMode={isDarkMode}
              incomeHeads={incomeHeads}
              setIncomeHeads={setIncomeHeads}
              expenseHeads={expenseHeads}
              setExpenseHeads={setExpenseHeads}
            />
          )}
        </div>
      </main>

      {/* Floating Action Buttons */}
      <div className="fixed bottom-24 right-6 flex flex-col gap-3 z-40">
        <button 
          onClick={() => setIsAIOpen(true)}
          disabled={!isOnline}
          className={`p-4 bg-white dark:bg-slate-800 ${textClasses[accentColor]} rounded-full shadow-xl border border-gray-100 dark:border-slate-700 active:scale-90 transition-all disabled:opacity-50`}
        >
          <Sparkles size={22} strokeWidth={2.5} />
        </button>
        <button 
          onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
          className={`p-5 ${colorClasses[accentColor]} text-white rounded-full shadow-2xl active:scale-90 transition-all`}
        >
          <Plus size={28} strokeWidth={3} />
        </button>
      </div>

      {/* Navigation Bar with Safe Area Bottom */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-gray-100 dark:border-slate-800 px-2 pt-3 pb-[env(safe-area-inset-bottom,12px)] flex justify-around z-30 shadow-[0_-8px_30px_rgb(0,0,0,0.04)]">
        <NavButton active={view === 'DASHBOARD'} accentColor={accentColor} icon={<LayoutDashboard size={22} />} label="Wallet" onClick={() => setView('DASHBOARD')} />
        <NavButton active={view === 'TRANSACTIONS'} accentColor={accentColor} icon={<ArrowLeftRight size={22} />} label="Activity" onClick={() => setView('TRANSACTIONS')} />
        <NavButton active={view === 'LOANS'} accentColor={accentColor} icon={<HandCoins size={22} />} label="Loans" onClick={() => setView('LOANS')} />
        <NavButton active={view === 'ACCOUNTS'} accentColor={accentColor} icon={<Wallet size={22} />} label="Vaults" onClick={() => setView('ACCOUNTS')} />
        <NavButton active={view === 'INSIGHTS'} accentColor={accentColor} icon={<PieChart size={22} />} label="Stats" onClick={() => setView('INSIGHTS')} />
      </nav>

      {/* Overlays */}
      {isFormOpen && (
        <TransactionForm 
          accounts={accounts} editingTx={editingTransaction}
          incomeHeads={incomeHeads} expenseHeads={expenseHeads}
          onSave={(tx) => editingTransaction ? updateTransaction(tx as Transaction) : addTransaction(tx as Omit<Transaction, 'id'>)}
          onClose={() => { setIsFormOpen(false); setEditingTransaction(null); }}
          isDarkMode={isDarkMode}
        />
      )}

      {isAIOpen && (
        <AIAssistant 
          onClose={() => setIsAIOpen(false)}
          onAddParsedTx={(txData) => {
            addTransaction({ ...txData, date: new Date().toISOString().split('T')[0], accountId: accounts[0].id });
            setIsAIOpen(false);
          }}
          isDarkMode={isDarkMode}
        />
      )}
    </div>
  );
};

interface NavButtonProps {
  active: boolean;
  accentColor: string;
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const NavButton: React.FC<NavButtonProps> = ({ active, accentColor, icon, label, onClick }) => {
  const textClasses: Record<string, string> = {
    emerald: 'text-emerald-600',
    blue: 'text-blue-600',
    indigo: 'text-indigo-600',
    rose: 'text-rose-600',
    slate: 'text-white'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center flex-1 transition-all duration-300 ${active ? `${textClasses[accentColor]} scale-110` : 'text-gray-400 dark:text-slate-500'}`}
    >
      <div className={`p-1.5 rounded-xl transition-colors ${active ? 'bg-gray-100 dark:bg-slate-800' : ''}`}>
        {icon}
      </div>
      <span className="text-[9px] mt-1 font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
};

export default App;
