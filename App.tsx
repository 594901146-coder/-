import React, { useState, useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
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
  <div className="fixed bottom-6 left-6 right-6 h-[72px] rounded-[32px] glass-panel flex justify-between items-center px-8 z-50 transition-all duration-300 animate-enter-smooth shadow-lg dark:shadow-slate-900/50">
    <button 
        onClick={() => onChange('HOME')} 
        className={`flex flex-col items-center justify-center gap-1 w-14 h-full relative transition-all duration-300 group`}
    >
      <div className={`absolute -top-1 w-8 h-1 rounded-b-lg bg-emerald-500 transition-all duration-300 ${current === 'HOME' ? 'opacity-100' : 'opacity-0'}`}></div>
      <i className={`fa-solid fa-house text-xl ${current === 'HOME' ? 'text-emerald-500 scale-110 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'} transition-all duration-300`}></i>
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
      <i className={`fa-solid fa-chart-pie text-xl ${current === 'STATS' ? 'text-blue-500 scale-110 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]' : 'text-slate-400 dark:text-slate-500 group-hover:text-slate-600'} transition-all duration-300`}></i>
    </button>
  </div>
);

// -- Separated View Components to fix Focus/Re-render issues --

const AddTransactionView = ({ onSave, onClose, isFullscreen }: { onSave: (t: Transaction) => void, onClose: () => void, isFullscreen: boolean }) => {
    const [amount, setAmount] = useState('0');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState<string>(Category.FOOD);
    const [isMounted, setIsMounted] = useState(false);
    const [isNoteFocused, setIsNoteFocused] = useState(false);

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
      
      onSave(newTransaction);
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
            className={`h-16 rounded-[20px] text-2xl font-bold backdrop-blur-md active:scale-95 transition-all duration-150 flex items-center justify-center shadow-[0_2px_10px_rgba(0,0,0,0.02)] border border-white/10 dark:border-white/5 ${className}`}
        >
            {val}
        </button>
    );

    return (
      <div className={`h-full flex flex-col bg-slate-100/30 dark:bg-slate-900/40 backdrop-blur-3xl transition-all duration-500 z-50 absolute inset-0 animate-slide-up-modal`}>
        
        {/* Header - Dynamic Padding */}
        <div 
            className="px-4 pb-2 flex items-center justify-between z-30 transition-all duration-300"
            style={{ paddingTop: `calc(env(safe-area-inset-top) + ${isFullscreen ? '12px' : '20px'})` }}
        >
            <button onClick={onClose} className="w-10 h-10 flex items-center justify-center text-slate-600 dark:text-slate-300 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
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
        <div className="flex-none pb-6 pt-4 text-center animate-scale-spring">
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
                            animation: `scaleSpring 0.4s cubic-bezier(0.2, 0.8, 0.2, 1) ${Math.min(idx * 20, 300)}ms forwards`, 
                            opacity: 0, 
                            transform: 'scale(0.8)' 
                        }}
                    >
                        <button
                            onClick={() => setCategory(cat)}
                            className={`w-full h-full flex flex-col items-center justify-center rounded-[24px] transition-all duration-200 border border-white/10 ${
                                category === cat 
                                ? 'bg-slate-800/90 dark:bg-emerald-500/90 text-white shadow-lg scale-105 ring-2 ring-white/20 dark:ring-emerald-400/30' 
                                : 'bg-white/40 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 hover:bg-white/60 dark:hover:bg-slate-700/60 hover:scale-105 active:scale-95'
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
            <div className="glass-panel p-4 rounded-[24px] flex items-center gap-3 transition-colors duration-300 bg-white/40 dark:bg-slate-800/40">
                <i className="fa-regular fa-comment-dots text-slate-400"></i>
                <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    onFocus={() => setIsNoteFocused(true)}
                    onBlur={() => setIsNoteFocused(false)}
                    onKeyDown={(e) => { if(e.key === 'Enter') (e.target as HTMLInputElement).blur(); }}
                    placeholder="添加备注..."
                    className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-400/70"
                />
                {isNoteFocused && (
                    <button 
                        onMouseDown={(e) => { e.preventDefault(); handleSave(); }}
                        className="w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-md animate-scale-spring active:scale-90"
                    >
                        <i className="fa-solid fa-check text-sm"></i>
                    </button>
                )}
            </div>
            {isNoteFocused && <div className="h-64"></div>}
        </div>

        {/* Custom Numeric Keypad - Hidden when typing note */}
        {!isNoteFocused && (
            <div className="flex-none rounded-t-[32px] glass-panel border-b-0 pt-6 px-4 pb-[calc(env(safe-area-inset-bottom)+2rem)] z-40 shadow-[0_-10px_40px_rgba(0,0,0,0.1)] bg-white/60 dark:bg-slate-900/80 backdrop-blur-2xl animate-slide-up-modal">
                <div className="grid grid-cols-4 gap-3">
                    <KeypadButton val="1" onClick={() => handleKeypad('1')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="2" onClick={() => handleKeypad('2')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="3" onClick={() => handleKeypad('3')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton 
                        val={<i className="fa-solid fa-delete-left"></i>} 
                        onClick={() => handleKeypad('del')} 
                        className="bg-slate-200/40 dark:bg-slate-800/40 text-slate-500 dark:text-slate-400 hover:bg-slate-200/60" 
                    />

                    <KeypadButton val="4" onClick={() => handleKeypad('4')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="5" onClick={() => handleKeypad('5')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="6" onClick={() => handleKeypad('6')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <button 
                        onClick={handleSave} 
                        className="row-span-3 rounded-[20px] bg-slate-900/90 dark:bg-emerald-500/90 text-white text-xl font-bold shadow-lg shadow-slate-900/20 dark:shadow-emerald-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-1 hover:brightness-110 backdrop-blur-sm"
                    >
                        <i className="fa-solid fa-check text-2xl"></i>
                    </button>

                    <KeypadButton val="7" onClick={() => handleKeypad('7')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="8" onClick={() => handleKeypad('8')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="9" onClick={() => handleKeypad('9')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    
                    <KeypadButton val="." onClick={() => handleKeypad('.')} className="bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                    <KeypadButton val="0" onClick={() => handleKeypad('0')} className="col-span-2 bg-white/40 dark:bg-slate-800/40 text-slate-700 dark:text-slate-200 hover:bg-white/60 dark:hover:bg-slate-700/60" />
                </div>
            </div>
        )}
      </div>
    );
};

// Extracted StatsView Component
const StatsView = ({ transactions, income, expense, isFullscreen }: { transactions: Transaction[], income: number, expense: number, isFullscreen: boolean }) => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar relative z-10 animate-enter-smooth">
        {/* Header - Dynamic Padding */}
        <div 
            className="px-6 pb-4 transition-all duration-300"
            style={{ paddingTop: `calc(env(safe-area-inset-top) + ${isFullscreen ? '12px' : '20px'})` }}
        >
             <div className="flex justify-between items-center h-16">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">财务分析</h2>
                 <div className="w-10 h-10 glass-panel rounded-full flex items-center justify-center shadow-sm bg-white/30 dark:bg-slate-800/30">
                    <i className="fa-solid fa-calendar text-slate-400 dark:text-slate-300"></i>
                 </div>
             </div>
        </div>

        <div className="p-6 space-y-6">
            <div className="animate-scale-spring" style={{ animationDelay: '50ms', opacity: 0, animationFillMode: 'forwards' }}>
                 <AnalysisChart transactions={transactions} />
            </div>

            {/* Monthly Summary */}
            <div className="animate-enter-smooth" style={{ animationDelay: '150ms', opacity: 0, animationFillMode: 'forwards' }}>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-2 text-xs uppercase tracking-wide opacity-70">本月概览</h3>
                <div className="glass-panel rounded-[32px] p-2 shadow-sm bg-white/30 dark:bg-slate-800/30">
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

// -- Main App Component --

export default function App() {
  // State
  const [view, setView] = useState<ViewState>('HOME');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [balance, setBalance] = useState(0);
  const [income, setIncome] = useState(0);
  const [expense, setExpense] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  
  // Filter State
  const [filterType, setFilterType] = useState<'ALL' | 'EXPENSE' | 'INCOME'>('ALL');
  const [filterDate, setFilterDate] = useState<'ALL' | 'THIS_MONTH' | 'LAST_MONTH'>('ALL');
  const [showFilter, setShowFilter] = useState(false);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // Context Menu State
  const [contextMenuTarget, setContextMenuTarget] = useState<Transaction | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [editNoteText, setEditNoteText] = useState('');

  // Delete Confirm State
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [deleteMode, setDeleteMode] = useState<'SINGLE' | 'ALL'>('SINGLE');

  // Auto-focus search input when opened
  useEffect(() => {
    if (isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
  }, [isSearchOpen]);
  
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
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, []);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((e) => console.log(e));
    } else {
      document.exitFullscreen();
    }
  };

  const handleThemeToggle = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!(document as any).startViewTransition) {
      setTheme(prev => prev === 'light' ? 'dark' : 'light');
      return;
    }

    const x = e.clientX;
    const y = e.clientY;
    const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

    const transition = (document as any).startViewTransition(() => {
      flushSync(() => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
      });
    });

    await transition.ready;

    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`] },
      {
        duration: 700,
        easing: 'cubic-bezier(0.65, 0, 0.35, 1)',
        pseudoElement: '::view-transition-new(root)',
      }
    );
  };

  // Load/Save Transactions
  useEffect(() => {
    const stored = localStorage.getItem('ai_ledger_transactions');
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  useEffect(() => {
    localStorage.setItem('ai_ledger_transactions', JSON.stringify(transactions));
    let inc = 0, exp = 0;
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

  const confirmDelete = () => {
    if (deleteMode === 'ALL') setTransactions([]);
    else if (pendingDeleteId) setTransactions(prev => prev.filter(t => t.id !== pendingDeleteId));
    setShowDeleteConfirm(false);
    setPendingDeleteId(null);
    setContextMenuTarget(null);
  };

  const promptDeleteTransaction = (id: string) => {
    setPendingDeleteId(id);
    setDeleteMode('SINGLE');
    setContextMenuTarget(null);
    setShowDeleteConfirm(true);
  };

  const promptClearAll = () => {
    if (transactions.length === 0) return;
    setDeleteMode('ALL');
    setShowDeleteConfirm(true);
  };

  const handleUpdateNote = () => {
    if (contextMenuTarget && editNoteText.trim()) {
        setTransactions(prev => prev.map(t => t.id === contextMenuTarget.id ? { ...t, note: editNoteText } : t));
        setIsEditingNote(false);
        setContextMenuTarget(null);
    }
  };

  const openContextMenu = (t: Transaction) => setContextMenuTarget(t);
  
  const handleSearchFocus = () => {
      setTimeout(() => {
          if (searchContainerRef.current) {
              searchContainerRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
      }, 300);
  };

  const getFilteredTransactions = () => {
    let filtered = transactions;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(t => t.note.toLowerCase().includes(query) || t.category.toLowerCase().includes(query));
    }
    if (filterType === 'EXPENSE') filtered = filtered.filter(t => t.type === TransactionType.EXPENSE);
    else if (filterType === 'INCOME') filtered = filtered.filter(t => t.type === TransactionType.INCOME);

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    if (filterDate === 'THIS_MONTH') {
        filtered = filtered.filter(t => { const d = new Date(t.date); return d.getMonth() === currentMonth && d.getFullYear() === currentYear; });
    } else if (filterDate === 'LAST_MONTH') {
        const lastMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        filtered = filtered.filter(t => { const d = new Date(t.date); return d.getMonth() === lastMonthDate.getMonth() && d.getFullYear() === lastMonthDate.getFullYear(); });
    }
    return filtered;
  };

  const filteredList = getFilteredTransactions();
  const isFiltered = filterType !== 'ALL' || filterDate !== 'ALL' || searchQuery.trim() !== '';
  const isOverlayActive = showFilter || isEditingNote || contextMenuTarget !== null || showDeleteConfirm;

  // -- Render Functions --
  
  const renderHomeView = () => (
    <div className={`h-full overflow-y-auto no-scrollbar relative z-10 animate-enter-smooth ${isSearchOpen ? 'pb-64' : 'pb-32'}`}>
      {/* Header - Dynamic Padding */}
      <div 
        className="relative px-5 transition-all duration-300" 
        style={{ paddingTop: `calc(env(safe-area-inset-top) + ${isFullscreen ? '12px' : '20px'})` }}
      >
          <div className="mt-2 p-6 pb-8 glass-panel rounded-[32px] shadow-xl relative overflow-hidden transition-all duration-300 hover:shadow-2xl group">
             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/20 to-transparent dark:from-white/5 opacity-50 pointer-events-none"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-2 bg-slate-100/30 dark:bg-slate-800/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]"></span>
                        <span className="text-xs font-bold text-slate-700 dark:text-slate-200">极简记账</span>
                    </div>
                    
                    <div className="flex gap-3">
                        <button 
                            onClick={toggleFullScreen}
                            className="w-9 h-9 bg-slate-100/30 dark:bg-slate-800/40 rounded-[20px] flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-white/40"
                        >
                            <i className={`fa-solid ${isFullscreen ? 'fa-compress' : 'fa-expand'} text-slate-600 dark:text-slate-300 text-xs`}></i>
                        </button>

                        <button 
                            onClick={handleThemeToggle}
                            className="w-9 h-9 bg-slate-100/30 dark:bg-slate-800/40 rounded-[20px] flex items-center justify-center backdrop-blur-md border border-white/20 active:scale-90 transition-all hover:bg-white/40"
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
                    <div className="flex-1 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md rounded-[24px] p-4 border border-white/10 shadow-sm hover:bg-white/30 dark:hover:bg-slate-800/50 transition-colors">
                        <div className="flex items-center gap-2 mb-1 opacity-80">
                            <div className="w-4 h-4 rounded-full bg-emerald-400/20 flex items-center justify-center">
                                <i className="fa-solid fa-arrow-down text-emerald-600 dark:text-emerald-400 text-[10px]"></i>
                            </div>
                            <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">收入</span>
                        </div>
                        <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400 tracking-tight">¥{income.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 bg-white/20 dark:bg-slate-900/40 backdrop-blur-md rounded-[24px] p-4 border border-white/10 shadow-sm hover:bg-white/30 dark:hover:bg-slate-800/50 transition-colors">
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
            <div className="flex justify-between items-center mb-4 px-2">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">近期明细</h2>
                <div className="flex gap-2">
                    <button 
                        onClick={() => setIsSearchOpen(!isSearchOpen)}
                        className={`w-8 h-8 flex items-center justify-center rounded-[20px] transition-all active:scale-90 ${isSearchOpen || searchQuery ? 'bg-blue-500 text-white shadow-md shadow-blue-500/20' : 'bg-white/30 dark:bg-slate-800/30 text-slate-500 dark:text-slate-400 hover:bg-white/40'}`}
                    >
                        <i className={`fa-solid fa-magnifying-glass text-xs transition-transform ${isSearchOpen ? 'scale-110' : ''}`}></i>
                    </button>

                    {transactions.length > 0 && (
                        <button 
                            onClick={promptClearAll}
                            className="w-8 h-8 flex items-center justify-center rounded-[20px] bg-red-500/10 hover:bg-red-500/20 text-red-500 dark:text-red-400 transition-colors active:scale-90"
                        >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                        </button>
                    )}
                    <button 
                        onClick={() => setShowFilter(true)}
                        className={`text-xs font-bold flex items-center gap-1 px-3 py-1.5 rounded-full transition-colors backdrop-blur-sm border border-white/10 ${isFiltered && !searchQuery ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20' : 'text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-800/30 hover:bg-white/40'}`}
                    >
                        {isFiltered && !searchQuery ? '已筛选' : '全部'} <i className={`fa-solid ${isFiltered && !searchQuery ? 'fa-filter' : 'fa-chevron-right'} text-[10px]`}></i>
                    </button>
                </div>
            </div>

            <div ref={searchContainerRef} className={`overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] origin-top ${isSearchOpen ? 'max-h-24 opacity-100 mb-4 scale-y-100' : 'max-h-0 opacity-0 mb-0 scale-y-95'}`}>
                <div className="mx-2 relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <i className={`fa-solid fa-magnifying-glass text-slate-400 text-xs ${searchQuery ? 'animate-pulse text-blue-500' : ''}`}></i>
                    </div>
                    <input 
                        ref={searchInputRef}
                        type="text" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={handleSearchFocus}
                        placeholder="搜索备注或分类..."
                        className="w-full pl-10 pr-9 py-3 bg-white/60 dark:bg-slate-800/60 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-[20px] text-sm font-bold text-slate-900 dark:text-white placeholder-slate-400 outline-none focus:bg-white/90 dark:focus:bg-slate-800/90 focus:ring-2 focus:ring-blue-400/20 transition-all shadow-sm caret-blue-500"
                    />
                     {searchQuery && (
                        <button 
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-slate-200/50 dark:bg-slate-700/50 flex items-center justify-center text-[10px] text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 animate-scale-spring"
                        >
                            <i className="fa-solid fa-times"></i>
                        </button>
                    )}
                </div>
            </div>

            {filteredList.length === 0 ? (
                <div className="glass-panel rounded-[32px] p-12 flex flex-col items-center justify-center text-center animate-scale-spring relative overflow-hidden border border-white/20 dark:border-white/5">
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-white/30 to-transparent dark:from-white/5 opacity-50 pointer-events-none"></div>
                    <div className="relative">
                        <div className="w-24 h-24 bg-gradient-to-br from-slate-50/50 to-slate-100/50 dark:from-slate-800/50 dark:to-slate-700/50 rounded-full flex items-center justify-center shadow-lg border border-white/40 dark:border-white/10 relative z-10 backdrop-blur-md">
                            <i className="fa-solid fa-receipt text-4xl text-emerald-500/80 dark:text-emerald-400/80"></i>
                        </div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-emerald-500/40 dark:bg-emerald-500/20 rounded-full blur-2xl animate-breathing"></div>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-20 h-20 bg-emerald-400/40 dark:bg-emerald-400/20 rounded-full blur-md animate-breathing" style={{ animationDelay: '1s' }}></div>
                    </div>
                    {isFiltered && (
                        <div className="mt-6 animate-enter-smooth">
                            <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">没有找到符合条件的记录</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="space-y-3 pb-24">
                    {filteredList.map((t, index) => (
                        <div 
                            key={t.id} 
                            // Performance Optimization: Only animate the first 10 items.
                            // Staggered animation on long lists kills performance.
                            className={index < 10 ? "animate-enter-smooth" : ""} 
                            style={index < 10 ? { animationDelay: `${index * 30}ms`, animationFillMode: 'both' } : {}}
                        >
                            <TransactionItem 
                                transaction={t} 
                                onLongPress={openContextMenu}
                            />
                        </div>
                    ))}
                </div>
            )}
          </div>
      </div>
  );

  return (
    <div className="h-full w-full relative bg-[#f2f4f6] dark:bg-[#020617] text-slate-900 dark:text-slate-100 font-sans transition-colors duration-500 overflow-hidden h-[100dvh]">
      <AmbientBackground />
      
      {view === 'HOME' && renderHomeView()}
      {view === 'ADD' && <AddTransactionView onSave={addTransaction} onClose={() => setView('HOME')} isFullscreen={isFullscreen} />}
      {view === 'STATS' && <StatsView transactions={transactions} income={income} expense={expense} isFullscreen={isFullscreen} />}

      {/* Filter Modal */}
      <div className={`fixed inset-0 z-[60] flex items-end sm:items-center justify-center pointer-events-none transition-all duration-300 ${showFilter ? 'visible' : 'invisible'}`}>
        <div 
          className={`absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[4px] transition-opacity duration-300 pointer-events-auto ${showFilter ? 'opacity-100' : 'opacity-0'}`} 
          onClick={() => setShowFilter(false)}
        ></div>
        <div className={`w-full sm:w-96 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] p-6 shadow-2xl border-t border-white/20 dark:border-white/10 transform transition-all duration-300 pointer-events-auto cubic-bezier(0.2, 0.8, 0.2, 1) ${showFilter ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-full sm:translate-y-10 sm:scale-95 opacity-0'}`}>
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">筛选交易</h3>
                <button onClick={() => setShowFilter(false)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                    <i className="fa-solid fa-times"></i>
                </button>
            </div>
            <div className="space-y-6">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block pl-1">交易类型</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px]">
                        {(['ALL', 'EXPENSE', 'INCOME'] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setFilterType(t)}
                                className={`flex-1 py-2.5 rounded-[20px] text-sm font-bold transition-all duration-300 ${filterType === t ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                {t === 'ALL' ? '全部' : t === 'EXPENSE' ? '支出' : '收入'}
                            </button>
                        ))}
                    </div>
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 block pl-1">时间范围</label>
                    <div className="flex bg-slate-100 dark:bg-slate-800 p-1.5 rounded-[24px]">
                        {(['ALL', 'THIS_MONTH', 'LAST_MONTH'] as const).map(d => (
                            <button
                                key={d}
                                onClick={() => setFilterDate(d)}
                                className={`flex-1 py-2.5 rounded-[20px] text-sm font-bold transition-all duration-300 ${filterDate === d ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'}`}
                            >
                                {d === 'ALL' ? '全部' : d === 'THIS_MONTH' ? '本月' : '上月'}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setShowFilter(false)} className="w-full py-3.5 rounded-[24px] bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-base shadow-lg shadow-emerald-500/30 active:scale-[0.98] transition-all duration-300">
                    确认
                </button>
            </div>
        </div>
      </div>

      {/* Context Menu Modal */}
      <div className={`fixed inset-0 z-[70] flex items-end sm:items-center justify-center pointer-events-none transition-all duration-300 ${contextMenuTarget && !isEditingNote && !showDeleteConfirm ? 'visible' : 'invisible'}`}>
        <div 
            className={`absolute inset-0 bg-black/20 dark:bg-black/60 backdrop-blur-[2px] transition-opacity duration-300 pointer-events-auto ${contextMenuTarget && !isEditingNote && !showDeleteConfirm ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setContextMenuTarget(null)}
        ></div>
        <div className={`w-full sm:w-96 bg-white/90 dark:bg-slate-900/95 backdrop-blur-2xl rounded-t-[32px] sm:rounded-[32px] p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shadow-2xl border-t border-white/20 dark:border-white/10 transform transition-all duration-300 pointer-events-auto cubic-bezier(0.2, 0.8, 0.2, 1) ${contextMenuTarget && !isEditingNote && !showDeleteConfirm ? 'translate-y-0 scale-100 opacity-100' : 'translate-y-full sm:translate-y-10 sm:scale-95 opacity-0'}`}>
            <div className="flex flex-col gap-2">
                <h3 className="text-center text-sm font-bold text-slate-400 dark:text-slate-500 mb-2 uppercase tracking-wider">选择操作</h3>
                <button 
                    onClick={() => { setEditNoteText(contextMenuTarget?.note || ''); setIsEditingNote(true); }}
                    className="w-full py-4 rounded-[24px] bg-slate-100/50 dark:bg-slate-800/50 hover:bg-white dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-pen-to-square text-blue-500"></i> 修改备注
                </button>
                <button 
                    onClick={() => promptDeleteTransaction(contextMenuTarget?.id || '')}
                    className="w-full py-4 rounded-[24px] bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 dark:text-red-400 font-bold text-base transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                    <i className="fa-regular fa-trash-can"></i> 删除账单
                </button>
                <div className="h-2"></div>
                <button 
                    onClick={() => setContextMenuTarget(null)}
                    className="w-full py-4 rounded-[24px] bg-white dark:bg-slate-800 text-slate-500 font-bold text-base shadow-sm active:scale-[0.98] transition-all"
                >
                    取消
                </button>
            </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <div className={`fixed inset-0 z-[90] flex items-center justify-center pointer-events-none transition-all duration-300 ${showDeleteConfirm ? 'visible' : 'invisible'}`}>
        <div 
            className={`absolute inset-0 bg-black/40 dark:bg-black/70 backdrop-blur-md transition-opacity duration-300 pointer-events-auto ${showDeleteConfirm ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => setShowDeleteConfirm(false)}
        ></div>
        <div className={`w-[85%] sm:w-80 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl transform transition-all duration-300 pointer-events-auto cubic-bezier(0.2, 0.8, 0.2, 1) ${showDeleteConfirm ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4 text-red-500 dark:text-red-400 animate-scale-spring">
                <i className="fa-solid fa-triangle-exclamation text-2xl"></i>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2 text-center">
                {deleteMode === 'ALL' ? '清空所有数据?' : '删除这条账单?'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
                {deleteMode === 'ALL' ? '此操作将永久删除所有交易记录，无法撤销。' : '此操作无法撤销，确定要继续吗？'}
            </p>
            <div className="flex gap-3">
                <button 
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 py-3.5 rounded-[20px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold transition-colors active:scale-95"
                >
                    取消
                </button>
                <button 
                    onClick={confirmDelete}
                    className="flex-1 py-3.5 rounded-[20px] bg-red-500 hover:bg-red-600 text-white font-bold shadow-lg shadow-red-500/30 transition-all active:scale-95"
                >
                    {deleteMode === 'ALL' ? '全部清空' : '删除'}
                </button>
            </div>
        </div>
      </div>

      {/* Edit Note Modal */}
      <div className={`fixed inset-0 z-[80] flex items-center justify-center pointer-events-none transition-all duration-300 ${isEditingNote ? 'visible' : 'invisible'}`}>
         <div 
            className={`absolute inset-0 bg-black/30 dark:bg-black/70 backdrop-blur-sm transition-opacity duration-300 pointer-events-auto ${isEditingNote ? 'opacity-100' : 'opacity-0'}`} 
            onClick={() => { setIsEditingNote(false); setContextMenuTarget(null); }}
        ></div>
        <div className={`w-[85%] sm:w-80 bg-white dark:bg-slate-900 rounded-[32px] p-6 shadow-2xl transform transition-all duration-300 pointer-events-auto cubic-bezier(0.2, 0.8, 0.2, 1) ${isEditingNote ? 'scale-100 opacity-100' : 'scale-90 opacity-0'}`}>
            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4 text-center">修改备注</h3>
            <div className="bg-slate-100 dark:bg-slate-800 rounded-[20px] p-2 mb-4">
                <input 
                    type="text" 
                    value={editNoteText}
                    onChange={(e) => setEditNoteText(e.target.value)}
                    className="w-full bg-transparent p-2 text-center text-slate-800 dark:text-white font-medium outline-none placeholder-slate-400"
                    placeholder="输入新备注..."
                    autoFocus
                />
            </div>
            <div className="flex gap-3">
                <button 
                    onClick={() => { setIsEditingNote(false); setContextMenuTarget(null); }}
                    className="flex-1 py-3 rounded-[20px] bg-slate-100 dark:bg-slate-800 text-slate-500 font-bold transition-colors active:scale-95"
                >
                    取消
                </button>
                <button 
                    onClick={handleUpdateNote}
                    className="flex-1 py-3 rounded-[20px] bg-emerald-500 text-white font-bold shadow-lg shadow-emerald-500/20 transition-all active:scale-95"
                >
                    保存
                </button>
            </div>
        </div>
      </div>
      
      {view !== 'ADD' && !isOverlayActive && <NavBar current={view} onChange={setView} />}
    </div>
  );
}