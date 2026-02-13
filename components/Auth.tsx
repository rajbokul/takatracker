
import React, { useState, useEffect } from 'react';
import { Lock, Delete, ArrowRight, ShieldCheck } from 'lucide-react';

interface AuthProps {
  onAuthenticated: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthenticated }) => {
  const [pin, setPin] = useState('');
  const [storedPin, setStoredPin] = useState<string | null>(null);
  const [isSettingPin, setIsSettingPin] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const savedPin = localStorage.getItem('taka_tracker_pin');
    if (savedPin) {
      setStoredPin(savedPin);
      setIsSettingPin(false);
    } else {
      setIsSettingPin(true);
    }
  }, []);

  const handleKeyPress = (num: string) => {
    if (pin.length < 4) {
      setPin(prev => prev + num);
      setError('');
    }
  };

  const handleDelete = () => {
    setPin(prev => prev.slice(0, -1));
  };

  const handleSubmit = () => {
    if (pin.length !== 4) return;

    if (isSettingPin) {
      localStorage.setItem('taka_tracker_pin', pin);
      setStoredPin(pin);
      onAuthenticated();
    } else {
      if (pin === storedPin) {
        onAuthenticated();
      } else {
        setError('Incorrect PIN. Please try again.');
        setPin('');
      }
    }
  };

  useEffect(() => {
    if (pin.length === 4) {
      const timer = setTimeout(() => handleSubmit(), 300);
      return () => clearTimeout(timer);
    }
  }, [pin]);

  const KeypadButton = ({ val, icon }: { val?: string, icon?: React.ReactNode }) => (
    <button
      onClick={() => val ? handleKeyPress(val) : handleDelete()}
      className="w-16 h-16 rounded-full bg-white/10 hover:bg-white/20 active:bg-emerald-500/30 flex items-center justify-center text-2xl font-semibold transition-all border border-white/5"
    >
      {val || icon}
    </button>
  );

  return (
    <div className="fixed inset-0 z-[100] bg-emerald-950 text-white flex flex-col items-center justify-center p-8">
      <div className="mb-12 text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-emerald-500/20">
          <ShieldCheck size={40} className="text-white" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight">TakaTracker</h1>
        <p className="text-emerald-400 text-sm mt-2">
          {isSettingPin ? 'Secure your account with a PIN' : 'Enter Secure PIN'}
        </p>
      </div>

      <div className="flex gap-4 mb-10">
        {[0, 1, 2, 3].map(i => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full border-2 transition-all duration-300 ${
              pin.length > i ? 'bg-emerald-400 border-emerald-400 scale-125' : 'border-emerald-800'
            }`}
          />
        ))}
      </div>

      {error && <p className="text-red-400 text-xs mb-6 font-medium animate-bounce">{error}</p>}

      <div className="grid grid-cols-3 gap-6 max-w-[280px]">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(n => (
          <KeypadButton key={n} val={n} />
        ))}
        <div />
        <KeypadButton val="0" />
        <KeypadButton icon={<Delete size={24} />} />
      </div>

      <div className="mt-12 opacity-40 text-[10px] uppercase tracking-widest font-bold">
        Secure Banking Encryption Active
      </div>
    </div>
  );
};

export default Auth;
