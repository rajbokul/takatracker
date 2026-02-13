
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
  Sun
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
const SESSION_TIMEOUT_MS = 2 * 60 * 1000;

const DEFAULT_INCOME_HEADS = ['Salary', 'Freelance', 'Investment', 'Business', 'Gift', 'Other'];
const DEFAULT_EXPENSE_HEADS = ['Food', 'Rent', 'Shopping', 'Utility', 'Health', 'Travel', 'Entertainment', 'Subscription', 'Other'];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [view, setView] = useState<ViewType>('DASHBOARD');
  const [accentColor, setAccentColor] = useState('emerald');
  const [isDarkMode, setIsDarkMode] = useState(false);
  
  const [incomeHeads, setIncomeHeads] = useState<string[]>(DEFAULT_INCOME_HEADS);
  const [expenseHeads, setExpenseHeads] = useState<string[]>(DEFAULT_EXPENSE_HEADS);

  // Cleared all test data for production/fresh start
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Pocket Cash', type: AccountType.CASH, balance: 0 },
  ]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isAIOpen, setIsAIOpen] = useState(false);
  
  const activityTimerRef = useRef<number | null>(null);

  const resetActivityTimer = () => {
    if (activityTimerRef.current) window.clearTimeout(activityTimerRef.current);
    if (isAuthenticated) {
      activityTimerRef.current = window.setTimeout(() => {
        handleLogout();
        alert("Session expired due to inactivity.");
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
        if (t && a && a.length > 0) {
          setTransactions(t);
          setAccounts(a);
        }
      } catch (e) {
        console.error("Failed to parse saved data", e);
      }
    }
  }, []);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      document.body.className = 'bg-slate-950 text-slate-100 transition-colors duration-300';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.className = 'bg-gray-50 text-gray-900 transition-colors duration-300';
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

  const handleImportData = (data: { accounts: Account[]; transactions: Transaction[] }) => {
    if (data.accounts) setAccounts(data.accounts);
    if (data.transactions) setTransactions(data.transactions);
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

  const openEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setIsFormOpen(true);
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
    slate: 'text-slate-800 dark:text-slate-300'
  };

  if (!isAuthenticated) {
    return <Auth onAuthenticated={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className={`flex flex-col min-h-screen max-w-md mx-auto shadow-xl overflow-hidden relative transition-colors duration-300`}>
      <header className={`${colorClasses[accentColor]} text-white p-4 pt-6 pb-4 flex justify-between items-center sticky top-0 z-10 shadow-md transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`p-1 bg-white rounded-lg ${textClasses[accentColor]} font-bold`}>৳</div>
          <div>
            <h1 className="text-lg font-bold tracking-tight">TakaTracker</h1>
            <p className="text-[10px] text-white/80">Secure Banking Session</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            title={isDarkMode ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
          </button>
          <button 
            onClick={() => setIsAIOpen(true)}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
          >
            <Sparkles size={18} />
          </button>
          <button 
            onClick={() => setView('SETTINGS')}
            className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors"
            title="Settings"
          >
            <SettingsIcon size={18} />
          </button>
          <button 
            onClick={handleLogout}
            className="p-2 bg-red-500/20 text-white rounded-full hover:bg-red-500 transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar p-4 pb-24">
        {view === 'DASHBOARD' && <Dashboard transactions={transactions} accounts={accounts} onEdit={openEdit} isDarkMode={isDarkMode} />}
        {view === 'TRANSACTIONS' && <TransactionsList transactions={transactions} onEdit={openEdit} onDelete={deleteTransaction} isDarkMode={isDarkMode} />}
        {view === 'ACCOUNTS' && <AccountsList accounts={accounts} setAccounts={setAccounts} isDarkMode={isDarkMode} />}
        {view === 'LOANS' && <LoansList transactions={transactions} onEdit={openEdit} onDelete={deleteTransaction} isDarkMode={isDarkMode} />}
        {view === 'INSIGHTS' && <Insights transactions={transactions} isDarkMode={isDarkMode} />}
        {view === 'SETTINGS' && (
          <Settings 
            accentColor={accentColor} setAccentColor={setAccentColor}
            accounts={accounts} setAccounts={setAccounts}
            transactions={transactions} onImport={handleImportData}
            onResetData={() => {}}
            isDarkMode={isDarkMode}
            incomeHeads={incomeHeads}
            setIncomeHeads={setIncomeHeads}
            expenseHeads={expenseHeads}
            setExpenseHeads={setExpenseHeads}
          />
        )}
      </main>

      {view !== 'SETTINGS' && (
        <button 
          onClick={() => { setEditingTransaction(null); setIsFormOpen(true); }}
          className={`fixed bottom-20 right-6 z-20 ${colorClasses[accentColor]} text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all`}
        >
          <Plus size={24} strokeWidth={3} />
        </button>
      )}

      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex justify-around p-3 z-10 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] transition-colors duration-300">
        <NavButton active={view === 'DASHBOARD'} accentColor={accentColor} icon={<LayoutDashboard size={22} />} label="Home" onClick={() => setView('DASHBOARD')} />
        <NavButton active={view === 'TRANSACTIONS'} accentColor={accentColor} icon={<ArrowLeftRight size={22} />} label="Activity" onClick={() => setView('TRANSACTIONS')} />
        <NavButton active={view === 'LOANS'} accentColor={accentColor} icon={<HandCoins size={22} />} label="Loans" onClick={() => setView('LOANS')} />
        <NavButton active={view === 'ACCOUNTS'} accentColor={accentColor} icon={<Wallet size={22} />} label="Accounts" onClick={() => setView('ACCOUNTS')} />
        <NavButton active={view === 'INSIGHTS'} accentColor={accentColor} icon={<PieChart size={22} />} label="Insight" onClick={() => setView('INSIGHTS')} />
      </nav>

      {isFormOpen && (
        <TransactionForm 
          accounts={accounts} editingTx={editingTransaction}
          incomeHeads={incomeHeads}
          expenseHeads={expenseHeads}
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
    slate: 'text-slate-800'
  };

  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center transition-colors ${active ? textClasses[accentColor] : 'text-gray-400 dark:text-gray-500'}`}
    >
      {icon}
      <span className="text-[10px] mt-1 font-medium">{label}</span>
    </button>
  );
};

export default App;
