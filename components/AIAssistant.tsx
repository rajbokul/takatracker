
import React, { useState } from 'react';
import { Sparkles, X, Send, Loader2, Check } from 'lucide-react';
import { parseTransactionText } from '../services/geminiService';
import { TransactionType } from '../types';

interface AIAssistantProps {
  onClose: () => void;
  onAddParsedTx: (tx: any) => void;
  // Fix: Added isDarkMode to interface
  isDarkMode?: boolean;
}

const AIAssistant: React.FC<AIAssistantProps> = ({ onClose, onAddParsedTx, isDarkMode }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleParse = async () => {
    if (!input.trim() || loading) return;
    setLoading(true);
    const parsed = await parseTransactionText(input);
    setResult(parsed);
    setLoading(false);
  };

  return (
    <div className={`fixed inset-0 z-[70] ${isDarkMode ? 'bg-slate-950/60' : 'bg-emerald-900/40'} backdrop-blur-md flex items-center justify-center p-6`}>
      <div className="bg-white dark:bg-slate-900 w-full max-w-sm rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col animate-in slide-in-from-bottom duration-300 transition-colors">
        <div className="bg-emerald-600 dark:bg-emerald-700 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles size={24} />
            <h2 className="font-bold text-lg">Smart Taka Entry</h2>
          </div>
          <button onClick={onClose} className="p-1 hover:bg-emerald-500 dark:hover:bg-emerald-600 rounded-lg">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-xs text-gray-500 dark:text-slate-400 font-medium">Just type what happened, and I'll record it for you.</p>
          <div className="space-y-2">
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="e.g. Spent 500 for lunch or Received 20k salary"
              className="w-full p-4 bg-gray-50 dark:bg-slate-800 rounded-2xl border-none text-sm text-gray-800 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 resize-none h-32"
            />
            <button 
              onClick={handleParse}
              disabled={loading || !input.trim()}
              className="w-full bg-emerald-600 dark:bg-emerald-700 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 transition-all active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Send size={20} />}
              {loading ? 'Thinking...' : 'Process Entry'}
            </button>
          </div>

          {result && (
            <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800/30 p-4 rounded-2xl animate-in fade-in duration-300">
              <h4 className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase mb-3">Does this look correct?</h4>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Type:</span>
                  <span className="font-bold text-gray-800 dark:text-slate-100">{result.type}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Amount:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">৳{result.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-slate-400 font-medium">Category:</span>
                  <span className="font-bold text-gray-800 dark:text-slate-100">{result.category}</span>
                </div>
                {result.personName && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-slate-400 font-medium">Person:</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">{result.personName}</span>
                  </div>
                )}
              </div>
              <button 
                onClick={() => onAddParsedTx(result)}
                className="w-full bg-emerald-700 dark:bg-emerald-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-emerald-800 dark:hover:bg-emerald-900 transition-colors"
              >
                <Check size={18} /> Confirm & Save
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIAssistant;
