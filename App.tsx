import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, ViewState, Category } from './types';
import TransactionItem from './components/TransactionItem';
import AnalysisChart from './components/AnalysisChart';

// -- Helper Components --

const AmbientBackground = () => (
    <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        {/* Top Right Blob - Vibrant Purple */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-400/30 dark:bg-purple-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 dark:opacity-40 animate-blob"></div>
        {/* Bottom Left Blob - Vibrant Emerald */}
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-emerald-400/30 dark:bg-emerald-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 dark:opacity-40 animate-blob animation-delay-2000"></div>
        {/* Center/Moving Blob - Vibrant Blue */}
        <div className="absolute top-[30%] left-[20%] w-[400px] h-[400px] bg-blue-400/30 dark:bg-blue-600/30 rounded-full mix-blend-multiply dark:mix-blend-screen filter blur-[80px] opacity-70 dark:opacity-40 animate-blob animation-delay-4000"></div>
    </div>
);

const NavBar = ({ current, onChange }: { current: ViewState, onChange: (v: ViewState) => void }) => (
  <div className="fixed bottom-6 left-6 right-6 h-[72px] rounded-[28px] glass-panel flex justify-between items-center px-8 z-50 transition-all duration-300 animate-slide-up">
    <button 
        onClick={() => onChange('HOME')} 
        className={`flex flex-col items-center justify-center gap-1 w-14 h-full relative transition-all duration-300 group`}
    >
      <div className={`absolute -top-1 w-8 h-1 rounded-b-lg bg-emerald-500 transition-all duration-300 ${current === 'HOME' ? 'opacity-100' : 'opacity-0'}`}></div>
      <i className={`fa-solid fa-house text-xl ${current === 'HOME' ? 'text-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'} transition-all`}></i>
    </button>
    
    {/* Floating Action Button for Add - Popped out style */}
    <div className="relative -top-8">
        <button 
            onClick={() => onChange('ADD')} 
            className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-800 to-slate-900 dark:from-emerald-500 dark:to-emerald-600 shadow-[0_10px_20px_rgba(0,0,0,0.2)] dark:shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center text-white text-2xl active:scale-90 transition-all duration-300 hover:-translate-y-1 ring-4 ring-[#f2f4f6]/50 dark:ring-[#020617]/50"
        >
            <i className="fa-solid fa-plus transition-transform duration-300 group-hover:rotate-90"></i>
        </button>
    </div>

    <button 
        onClick={() => onChange('STATS')} 
        className={`flex flex-col items-center justify-center gap-1 w-14 h-full relative transition-all duration-300 group`}
    >
      <div className={`absolute -top-1 w-8 h-1 rounded-b-lg bg-blue-500 transition-all duration-300 ${current === 'STATS' ? 'opacity-100' : 'opacity-0'}`}></div>
      <i className={`fa-solid fa-chart-pie text-xl ${current === 'STATS' ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'} transition-all`}></i>
    </button>
  </div>
);

// -- Main App Component --

export default function App() {
  // State
  const [view, setView] = useState<ViewState>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Theme State with Persistence
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const saved = localStorage.getItem('app_theme');
    return (saved as 'light' | 'dark') || 'light';
  });

  // Handle Theme
  useEffect(() => {
    localStorage.setItem('app_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Handle Fullscreen events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => {
          console.log(e);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Load from local storage on mount
  useEffect(() => {
    const stored = localStorage.getItem('ai_ledger_transactions');
    if (stored) {
      setTransactions(JSON.parse(stored));
    }
  }, []);

  // Recalculate totals when transactions change
  useEffect(() => {
    localStorage.setItem('ai_ledger_transactions', JSON.stringify(transactions));
    
    let inc = 0;
    let exp = 0;
    transactions.forEach(t => {
      if (t.type === TransactionType.INCOME) inc += t.amount;
      else exp += t.amount;
    });
    setIncome(inc);
    setExpense(exp);
    setBalance(inc - exp);
  }, [transactions]);

  const addTransaction = (t: Transaction) => {
    setTransactions(prev => [t, ...prev]);
    setView('HOME');
  };

  const deleteTransaction = (id: string) => {
    if(confirm("确定要删除这条账单吗？")) {
        setTransactions(prev => prev.filter(t => t.id !== id));
    }
  };

  const clearAllTransactions = () => {
    if (transactions.length === 0) return;
    if (confirm("⚠️ 高危操作\n\n确定要清空所有账单数据吗？此操作无法撤销。")) {
        setTransactions([]);
    }
  };

  // --- Views ---

  const HomeView = () => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar transition-colors duration-300 relative z-10">
      {/* Header / Balance Card */}
      <div className="relative pt-[env(safe-area-inset-top)] px-5 animate-slide-up">
          <div className="mt-2 p-6 pb-8 glass-panel rounded-[32px] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl group">
             {/* Gradient Shine effect */}
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-50 pointer-events-none"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 bg-slate-100/30 dark:bg-slate-800/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">极简记账</span>
                    </div>
                    
                    <div className="flex gap-3">
                        {/* Fullscreen Toggle Button */}
                        <button 
                            onClick={toggleFullScreen}
                            className="w-9 h-9 bg-slate-100/30 dark:bg-slate-800/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-white/40"
                            title={isFullscreen ? "退出全屏" : "全屏显示"}
                        >
                            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-slate-600 dark:text-slate-300 text-xs`}></i>
                        </button>

                        {/* Theme Toggle Button */}
                        <button 
                            onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                            className="w-9 h-9 bg-slate-100/30 dark:bg-slate-800/40 rounded-full flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-white/40"
                        >
                            <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-slate-600 dark:text-slate-300 text-xs`}></i>
                        </button>
                    </div>
                 </div>

                 <div className="text-center mb-8">
                     <p className="text-slate-600 dark:text-slate-300 text-xs font-bold mb-2 tracking-widest uppercase opacity-80">本月结余</p>
                     <h1 className="text-[3.5rem] font-bold tracking-tighter leading-none text-slate-800 dark:text-white drop-shadow-sm">
                        <span className="text-2xl align-top mr-1 font-medium opacity-50">¥</span>
                        {balance.toFixed(2)}
                     </h1>
                 </div>

                 <div className="flex gap-3">
                    <div className="flex-1 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm hover:bg-white/30 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                <i className="fa-solid fa-arrow-down text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">收入</span>
                        </div>
                        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">¥{income.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md rounded-2xl p-4 border border-white/10 shadow-sm hover:bg-white/30 dark:hover:bg-slate-800/50 transition-colors">
                         <div className="flex items-center gap-2 mb-1 opacity-80">
                            <div className="w-4 h-4 rounded-full bg-rose-400/20 flex items-center justify-center">
                                <i className="fa-solid fa-arrow-up text-rose-500 dark:text-rose-400 text-[10px]"></i>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">支出</span>
                        </div>
                        <p className="font-bold text-lg text-rose-500 dark:text-rose-400 tracking-tight">¥{expense.toFixed(2)}</p>
                    </div>
                 </div>
             </div>
          </div>

          {/* Transactions List */}
          <div className="mt-8 relative z-20">
            <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">近期明细</h2>
                <div className="flex gap-2">
                    {transactions.length > 0 && (
                        <button 
                            onClick={clearAllTransactions}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors active:scale-90"
                            title="清空所有账单"
                        >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    )}
                    <button className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1 px-3 py-1.5 rounded-full bg-white/30 dark:bg-slate-800/30 hover:bg-white/40 transition-colors backdrop-blur-sm border border-white/10">
                        全部 <i className="fa-solid fa-chevron-right text-[10px]"></i>
                    </button>
                </div>
            </div>

            {transactions.length === 0 ? (
                <div className="glass-panel rounded-[24px] p-12 flex flex-col items-center justify-center text-center animate-scale-in relative overflow-hidden border border-white/20 dark:border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 opacity-50 pointer-events-none"></div>
                    
                    <div className="relative mb-6">
                        {/* Rotating Icon */}
                        <div className="w-20 h-20 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-full flex items-center justify-center shadow-lg border border-white/40 dark:border-white/10 relative z-10 backdrop-blur-md">
                            <i className="fa-solid fa-receipt text-3xl text-emerald-500/80 dark:text-emerald-400/80 animate-[spin_8s_linear_infinite]"></i>
                        </div>
                        
                        {/* Ambient Glows */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-emerald-400/30 rounded-full blur-xl animate-pulse"></div>
                    </div>

                    <p className="text-slate-800 dark:text-slate-200 font-bold mb-2 text-lg">暂无账单</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs font-medium px-4 py-1.5 rounded-full bg-slate-100/30 dark:bg-slate-800/30 border border-white/10">
                        记一笔，开启智能理财之旅
                    </p>
                </div>
            ) : (
                <div className="space-y-3 pb-24">
                    {transactions.map((t, index) => (
                        <div key={t.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                            <TransactionItem transaction={t} onClick={() => deleteTransaction(t.id)} />
                        </div>
                    ))}
                </div>
            )}
          </div>
      </div>
    </div>
  );

  const AddView = () => {
    const [amount, setAmount] = useState('0');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState<string>(Category.FOOD);

    // Animation mount check
    const [isMounted, setIsMounted] = useState(false);
    useEffect(() => setIsMounted(true), []);

    const handleSave = () => {
      const val = parseFloat(amount);
      if (val <= 0) return;
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: val,
        type,
        category,
        note: note || category,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };
      
      addTransaction(newTransaction);
    };

    const handleKeypad = (key: string) => {
        if (key === 'del') {
            setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
        } else if (key === '.') {
            if (!amount.includes('.')) setAmount(prev => prev + '.');
        } else {
            // Number inputs
            if (amount === '0' && key !== '.') {
                setAmount(key);
            } else {
                // Prevent >2 decimal places
                const parts = amount.split('.');
                if (parts[1] && parts[1].length >= 2) return;
                // Prevent too long numbers
                if (amount.length > 10) return;
                setAmount(prev => prev + key);
            }
        }
    };

    const KeypadButton = ({ val, onClick, className = '' }: { val: string | React.ReactNode, onClick: () => void, className?: string }) => (
        <button 
            onClick={onClick} 
            className={`h-16 rounded-2xl text-2xl font-bold backdrop-blur-md active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/10 dark:border-white/5 ${className}`}
        >
            {val}
        </button>
    );

    return (
      <div className={`h-full flex flex-col bg-slate-100/30 dark:bg-slate-900/40 backdrop-blur-3xl transition-all duration-500 z-50 absolute inset-0 ${isMounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
        
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-4 pb-2 flex items-center justify-between z-30">
            <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
            </button>
            
            <div className="flex bg-slate-200/40 dark:bg-slate-800/40 p-1 rounded-full backdrop-blur-md border border-white/10">
                <button 
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.EXPENSE ? 'bg-white/80 dark:bg-slate-600/80 text-slate-900 dark:text-white shadow-sm backdrop-blur-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                    支出
                </button>
                <button 
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.INCOME ? 'bg-white/80 dark:bg-slate-600/80 text-emerald-600 dark:text-emerald-400 shadow-sm backdrop-blur-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700'}`}
                >
                    收入
                </button>
            </div>
            <div className="w-10"></div>
        </div>

        {/* Display Amount */}
        <div className="flex-none pb-6 pt-4 text-center animate-scale-in">
             <div className="text-slate-500 dark:text-slate-400 text-xs font-bold mb-1 tracking-widest uppercase">金额</div>
             <div className="flex items-center justify-center text-6xl font-bold text-slate-800 dark:text-white tracking-tighter drop-shadow-sm">
                 <span className="text-3xl mr-1 mt-3 text-slate-400 font-medium">¥</span>
                 {amount}
             </div>
        </div>

        {/* Scrollable Middle Area: Category & Note */}
        <div className="flex-1 overflow-y-auto p-6 no-scrollbar">
            {/* Category Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.values(Category).map((cat, idx) => (
                    <div
                        key={cat}
                        className="aspect-square"
                        style={{ 
                            animation: `scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${idx * 30}ms forwards`, 
                            opacity: 0, 
                            transform: 'scale(0.8)' 
                        }}
                    >
                        <button
                            onClick={() => setCategory(cat)}
                            className={`w-full h-full flex flex-col items-center justify-center rounded-2xl transition-all duration-300 border border-white/10 backdrop-blur-md ${
                                category === cat 
                                ? 'bg-slate-800/90 dark:bg-emerald-500/90 text-white shadow-lg scale-110 ring-2 ring-white/20 dark:ring-emerald-400/30' 
                                : 'bg-white/20 dark:bg-slate-800/20 text-slate-600 dark:text-slate-400 hover:bg-white/40 dark:hover:bg-slate-700/40 hover:scale-105 active:scale-95'
                            }`}
                        >
                            <i className={`fa-solid mb-1.5 text-xl ${
                                cat === '餐饮' ? 'fa-utensils' :
                                cat === '交通' ? 'fa-car-side' :
                                cat === '购物' ? 'fa-bag-shopping' :
                                cat === '居住' ? 'fa-house' :
                                cat === '娱乐' ? 'fa-gamepad' :
                                cat === '医疗' ? 'fa-briefcase-medical' :
                                cat === '薪资' ? 'fa-wallet' : 'fa-circle-question'
                            }`}></i>
                            <span className="text-[10px] font-bold">{cat}</span>
                        </button>
                    </div>
                ))}
            </div>

            {/* Note Input */}
            <div className="glass-panel p-4 rounded-2xl flex items-center gap-3 transition-colors duration-300 bg-white/20 dark:bg-slate-800/30">
                <i className="fa-regular fa-comment-dots text-slate-400"></i>
                <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加备注..."
                    className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400/70"
                />
            </div>
        </div>

        {/* Custom Numeric Keypad */}
        <div className="flex-none rounded-t-[32px] glass-panel border-b-0 pt-6 px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] animate-slide-up bg-white/40 dark:bg-slate-900/60 backdrop-blur-2xl">
            <div className="grid grid-cols-4 gap-3">
                <KeypadButton val="1" onClick={() => handleKeypad('1')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="2" onClick={() => handleKeypad('2')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="3" onClick={() => handleKeypad('3')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton 
                    val={<i className="fa-solid fa-delete-left"></i>} 
                    onClick={() => handleKeypad('del')} 
                    className="bg-slate-200/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 hover:bg-slate-200/50" 
                />

                <KeypadButton val="4" onClick={() => handleKeypad('4')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="5" onClick={() => handleKeypad('5')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="6" onClick={() => handleKeypad('6')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <button 
                    onClick={handleSave} 
                    className="row-span-3 rounded-2xl bg-slate-900/90 dark:bg-emerald-500/90 text-white text-xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-emerald-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 hover:brightness-110 backdrop-blur-sm"
                >
                    <i className="fa-solid fa-check text-2xl"></i>
                </button>

                <KeypadButton val="7" onClick={() => handleKeypad('7')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="8" onClick={() => handleKeypad('8')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="9" onClick={() => handleKeypad('9')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                
                <KeypadButton val="." onClick={() => handleKeypad('.')} className="bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
                <KeypadButton val="0" onClick={() => handleKeypad('0')} className="col-span-2 bg-white/30 dark:bg-slate-800/30 text-slate-700 dark:text-slate-200 hover:bg-white/50 dark:hover:bg-slate-700/50" />
            </div>
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar relative z-10">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-6 pb-4 animate-slide-up">
             <div className="flex justify-between items-center h-16">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">财务分析</h2>
                 <div className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-sm bg-white/30 dark:bg-slate-800/30">
                    <i className="fa-solid fa-calendar text-slate-400 dark:text-slate-300"></i>
                 </div>
             </div>
        </div>

        <div className="p-6 space-y-6">
            <div className="animate-scale-in" style={{ animationDelay: '100ms', opacity: 0, animationFillMode: 'forwards' }}>
                 <AnalysisChart transactions={transactions} />
            </div>

            {/* Monthly Summary */}
            <div className="animate-slide-up" style={{ animationDelay: '200ms', opacity: 0, animationFillMode: 'forwards' }}>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-2 text-xs uppercase tracking-wide opacity-70">本月概览</h3>
                <div className="glass-panel rounded-[24px] p-2 shadow-sm bg-white/30 dark:bg-slate-800/30">
                    <div className="flex items-center p-4 border-b border-slate-100/10 dark:border-white/5 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mr-4 backdrop-blur-sm">
                            <i className="fa-solid fa-arrow-down"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">总收入</p>
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">¥{income.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-red-100/50 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mr-4 backdrop-blur-sm">
                            <i className="fa-solid fa-arrow-up"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mb-0.5">总支出</p>
                            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">¥{expense.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="h-20"></div>
        </div>
    </div>
  );

  return (
    <div className="h-full w-full relative bg-[#f2f4f6] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-hidden">
      <AmbientBackground />
      
      {view === 'HOME' && <HomeView />}
      {view === 'ADD' && <AddView />}
      {view === 'STATS' && <StatsView />}
      
      {view !== 'ADD' && <NavBar current={view} onChange={setView} />}
    </div>
  );
}