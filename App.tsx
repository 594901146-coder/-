import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, ViewState, Category } from './types';
import TransactionItem from './components/TransactionItem';
import AnalysisChart from './components/AnalysisChart';

// -- Helper Components --

const NavBar = ({ current, onChange }: { current: ViewState, onChange: (v: ViewState) => void }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-t border-slate-200 dark:border-slate-800 pb-[env(safe-area-inset-bottom)] px-8 flex justify-between items-start z-50 h-[80px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)] transition-colors duration-300">
    <button 
        onClick={() => onChange('HOME')} 
        className={`flex flex-col items-center gap-1.5 pt-3 transition-all duration-300 w-16 ${current === 'HOME' ? 'text-slate-800 dark:text-slate-100 translate-y-0' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
    >
      <i className={`fa-solid fa-house text-xl ${current === 'HOME' ? 'scale-110' : 'scale-100'} transition-transform`}></i>
      <span className="text-[10px] font-bold tracking-wide">首页</span>
    </button>
    
    {/* Floating Action Button for Add */}
    <div className="relative -top-5">
        <button 
            onClick={() => onChange('ADD')} 
            className="w-14 h-14 bg-slate-900 dark:bg-emerald-500 rounded-2xl shadow-lg shadow-slate-900/30 dark:shadow-emerald-500/30 flex items-center justify-center text-white active:scale-90 transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
        >
            <i className="fa-solid fa-plus text-xl"></i>
        </button>
    </div>

    <button 
        onClick={() => onChange('STATS')} 
        className={`flex flex-col items-center gap-1.5 pt-3 transition-all duration-300 w-16 ${current === 'STATS' ? 'text-slate-800 dark:text-slate-100 translate-y-0' : 'text-slate-400 dark:text-slate-600 hover:text-slate-500'}`}
    >
      <i className={`fa-solid fa-chart-pie text-xl ${current === 'STATS' ? 'scale-110' : 'scale-100'} transition-transform`}></i>
      <span className="text-[10px] font-bold tracking-wide">统计</span>
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

  // --- Views ---

  const HomeView = () => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#f2f4f6] dark:bg-slate-900 transition-colors duration-300">
      {/* Header / Balance Card */}
      <div className="relative pt-[env(safe-area-inset-top)]">
          <div className="px-6 py-6 pb-20 bg-slate-900 dark:bg-slate-800 text-white rounded-b-[40px] shadow-2xl shadow-slate-900/10 dark:shadow-black/20 relative overflow-hidden transition-colors duration-300">
             {/* Abstract Background */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-slate-800 dark:bg-slate-700 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
             <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-900/50 dark:bg-emerald-900/30 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-center mb-8 mt-2">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-200">极简记账</span>
                    </div>
                    {/* Theme Toggle Button */}
                    <button 
                        onClick={() => setTheme(prev => prev === 'light' ? 'dark' : 'light')}
                        className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/20 transition-all active:scale-95"
                    >
                        <i className={`fa-solid ${theme === 'light' ? 'fa-moon' : 'fa-sun'} text-slate-200 text-sm`}></i>
                    </button>
                 </div>

                 <div className="text-center mb-8">
                     <p className="text-slate-400 text-sm font-medium mb-2 tracking-wide">本月结余</p>
                     <h1 className="text-[3.5rem] font-bold tracking-tight leading-none">
                        <span className="text-2xl align-top mr-1 font-medium opacity-60">¥</span>
                        {balance.toFixed(2)}
                     </h1>
                 </div>

                 <div className="flex gap-4">
                    <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/5">
                        <div className="flex items-center gap-2 mb-1 opacity-70">
                            <i className="fa-solid fa-arrow-down text-emerald-400 text-xs"></i>
                            <span className="text-xs text-slate-300">收入</span>
                        </div>
                        <p className="font-bold text-lg text-emerald-100">¥{income.toFixed(2)}</p>
                    </div>
                    <div className="flex-1 bg-white/5 backdrop-blur-lg rounded-2xl p-4 border border-white/5">
                         <div className="flex items-center gap-2 mb-1 opacity-70">
                            <i className="fa-solid fa-arrow-up text-rose-400 text-xs"></i>
                            <span className="text-xs text-slate-300">支出</span>
                        </div>
                        <p className="font-bold text-lg text-rose-100">¥{expense.toFixed(2)}</p>
                    </div>
                 </div>
             </div>
          </div>

          {/* Transactions List */}
          <div className="px-5 -mt-10 relative z-20">
            <div className="flex justify-between items-end mb-4 px-2">
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">近期明细</h2>
                <button className="text-xs font-bold text-slate-400 flex items-center gap-1 active:text-slate-600 dark:active:text-slate-300">
                    全部 <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="bg-white dark:bg-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center shadow-sm text-center transition-colors duration-300">
                    <div className="w-16 h-16 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-receipt text-2xl text-slate-300 dark:text-slate-500"></i>
                    </div>
                    <p className="text-slate-800 dark:text-slate-200 font-bold mb-1">空空如也</p>
                    <p className="text-slate-400 dark:text-slate-500 text-sm">快去记一笔，开启理财生活</p>
                </div>
            ) : (
                <div className="space-y-1">
                    {transactions.map(t => (
                        <TransactionItem key={t.id} transaction={t} onClick={() => deleteTransaction(t.id)} />
                    ))}
                </div>
            )}
            
            {/* Bottom spacer for safe area */}
            <div className="h-24"></div>
          </div>
      </div>
    </div>
  );

  const AddView = () => {
    const [amount, setAmount] = useState('0');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState<string>(Category.FOOD);

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

    return (
      <div className="h-full flex flex-col bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-4 pb-2 flex items-center justify-between bg-white dark:bg-slate-800 z-30 shadow-sm transition-colors duration-300">
            <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center text-slate-800 dark:text-slate-100 rounded-full active:bg-slate-100 dark:active:bg-slate-700 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
            </button>
            <div className="flex bg-slate-100 dark:bg-slate-700 p-1 rounded-full">
                <button 
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.EXPENSE ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white shadow-sm' : 'text-slate-400'}`}
                >
                    支出
                </button>
                <button 
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`px-6 py-1.5 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.INCOME ? 'bg-white dark:bg-slate-600 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-400'}`}
                >
                    收入
                </button>
            </div>
            <div className="w-10"></div>
        </div>

        {/* Display Amount */}
        <div className="flex-none bg-white dark:bg-slate-800 pb-6 pt-2 transition-colors duration-300 text-center">
             <div className="text-slate-400 text-xs font-bold mb-1 tracking-widest uppercase">金额</div>
             <div className="flex items-center justify-center text-5xl font-bold text-slate-800 dark:text-white tracking-tight">
                 <span className="text-2xl mr-1 mt-2 text-slate-400">¥</span>
                 {amount}
             </div>
        </div>

        {/* Scrollable Middle Area: Category & Note */}
        <div className="flex-1 overflow-y-auto p-6">
            {/* Category Grid */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                {Object.values(Category).map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`aspect-square flex flex-col items-center justify-center rounded-2xl transition-all duration-200 ${category === cat ? 'bg-slate-800 dark:bg-emerald-500 text-white shadow-lg scale-105' : 'bg-white dark:bg-slate-800 text-slate-400 dark:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-750'}`}
                    >
                        <i className={`fa-solid mb-1 text-lg ${
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
                ))}
            </div>

            {/* Note Input */}
            <div className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm flex items-center gap-3 transition-colors duration-300">
                <i className="fa-regular fa-comment-dots text-slate-300 dark:text-slate-500"></i>
                <input 
                    type="text" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="添加备注..."
                    className="flex-1 bg-transparent outline-none text-slate-700 dark:text-slate-200 font-medium placeholder-slate-300 dark:placeholder-slate-600"
                />
            </div>
        </div>

        {/* Custom Numeric Keypad */}
        <div className="flex-none bg-slate-100 dark:bg-slate-800/50 pb-[env(safe-area-inset-bottom)] p-4 transition-colors duration-300">
            <div className="grid grid-cols-4 gap-3 h-52">
                <button onClick={() => handleKeypad('1')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">1</button>
                <button onClick={() => handleKeypad('2')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">2</button>
                <button onClick={() => handleKeypad('3')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">3</button>
                <button onClick={() => handleKeypad('del')} className="rounded-2xl bg-slate-200 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 shadow-sm active:bg-slate-300 dark:active:bg-slate-600 transition-colors flex items-center justify-center"><i className="fa-solid fa-delete-left"></i></button>

                <button onClick={() => handleKeypad('4')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">4</button>
                <button onClick={() => handleKeypad('5')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">5</button>
                <button onClick={() => handleKeypad('6')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">6</button>
                <button onClick={handleSave} className="row-span-3 rounded-2xl bg-emerald-500 text-white text-xl font-bold shadow-lg shadow-emerald-500/30 active:scale-95 transition-all flex flex-col items-center justify-center gap-1">
                    <i className="fa-solid fa-check text-2xl"></i>
                    <span className="text-xs opacity-80">完成</span>
                </button>

                <button onClick={() => handleKeypad('7')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">7</button>
                <button onClick={() => handleKeypad('8')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">8</button>
                <button onClick={() => handleKeypad('9')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">9</button>
                
                <button onClick={() => handleKeypad('.')} className="rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">.</button>
                <button onClick={() => handleKeypad('0')} className="col-span-2 rounded-2xl bg-white dark:bg-slate-700 text-xl font-bold text-slate-700 dark:text-slate-200 shadow-sm active:bg-slate-50 dark:active:bg-slate-600 transition-colors">0</button>
            </div>
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#f2f4f6] dark:bg-slate-900 transition-colors duration-300">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-6 pb-6 bg-white dark:bg-slate-800 shadow-sm z-10 sticky top-0 transition-colors duration-300">
             <div className="flex justify-between items-center h-16">
                 <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 tracking-tight">财务分析</h2>
                 <div className="w-10 h-10 bg-slate-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-calendar text-slate-400 dark:text-slate-300"></i>
                 </div>
             </div>
        </div>

        <div className="p-6 space-y-6">
            <AnalysisChart transactions={transactions} />

            {/* Monthly Summary */}
            <div>
                <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-4 px-2 text-sm uppercase tracking-wide opacity-80">本月概览</h3>
                <div className="bg-white dark:bg-slate-800 rounded-[24px] p-1 shadow-sm border border-slate-50 dark:border-slate-700 transition-colors duration-300">
                    <div className="flex items-center p-4 border-b border-slate-50 dark:border-slate-700 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-500 dark:text-emerald-400 mr-4">
                            <i className="fa-solid fa-arrow-down"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium">总收入</p>
                            <p className="font-bold text-slate-800 dark:text-slate-100">¥{income.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center text-red-500 dark:text-red-400 mr-4">
                            <i className="fa-solid fa-arrow-up"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium">总支出</p>
                            <p className="font-bold text-slate-800 dark:text-slate-100">¥{expense.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="h-10"></div>
        </div>
    </div>
  );

  return (
    <div className="h-full w-full relative bg-[#f2f4f6] dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      {view === 'HOME' && <HomeView />}
      {view === 'ADD' && <AddView />}
      {view === 'STATS' && <StatsView />}
      
      {view !== 'ADD' && <NavBar current={view} onChange={setView} />}
    </div>
  );
}