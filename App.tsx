import React, { useState, useEffect, useRef } from 'react';
import { Transaction, TransactionType, ViewState, Category, AiParsedResult } from './types';
import TransactionItem from './components/TransactionItem';
import AnalysisChart from './components/AnalysisChart';
import { parseTextTransaction, parseReceiptImage, getFinancialAdvice } from './services/geminiService';

// -- Helper Components --

const NavBar = ({ current, onChange }: { current: ViewState, onChange: (v: ViewState) => void }) => (
  <div className="fixed bottom-0 left-0 w-full bg-white/80 backdrop-blur-xl border-t border-slate-100 pb-[env(safe-area-inset-bottom)] px-8 flex justify-between items-start z-50 h-[88px] shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
    <button 
        onClick={() => onChange('HOME')} 
        className={`flex flex-col items-center gap-1.5 pt-3 transition-all duration-300 w-16 ${current === 'HOME' ? 'text-slate-800 translate-y-0' : 'text-slate-300 hover:text-slate-400'}`}
    >
      <i className={`fa-solid fa-house text-xl ${current === 'HOME' ? 'scale-110' : 'scale-100'} transition-transform`}></i>
      <span className="text-[10px] font-bold tracking-wide">首页</span>
    </button>
    
    {/* Floating Action Button for Add */}
    <div className="relative -top-6">
        <button 
            onClick={() => onChange('ADD')} 
            className="w-16 h-16 bg-slate-900 rounded-[22px] shadow-xl shadow-slate-900/30 flex items-center justify-center text-white active:scale-90 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
        >
            <i className="fa-solid fa-plus text-2xl"></i>
        </button>
    </div>

    <button 
        onClick={() => onChange('STATS')} 
        className={`flex flex-col items-center gap-1.5 pt-3 transition-all duration-300 w-16 ${current === 'STATS' ? 'text-slate-800 translate-y-0' : 'text-slate-300 hover:text-slate-400'}`}
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
  const [advice, setAdvice] = useState<string>("");
  const [isLoadingAdvice, setIsLoadingAdvice] = useState(false);

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

  // Fetch advice when entering stats view
  useEffect(() => {
    if (view === 'STATS' && transactions.length > 0 && !advice) {
        setIsLoadingAdvice(true);
        getFinancialAdvice(transactions).then(res => {
            setAdvice(res);
            setIsLoadingAdvice(false);
        });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [view]);

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
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#f2f4f6]">
      {/* Header / Balance Card */}
      <div className="relative pt-[env(safe-area-inset-top)]">
          <div className="px-6 py-6 pb-20 bg-slate-900 text-white rounded-b-[40px] shadow-2xl shadow-slate-900/10 relative overflow-hidden">
             {/* Abstract Background */}
             <div className="absolute top-0 right-0 w-80 h-80 bg-slate-800 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
             <div className="absolute bottom-0 left-0 w-60 h-60 bg-emerald-900/50 rounded-full blur-3xl opacity-30 -ml-10 -mb-10"></div>
             
             <div className="relative z-10">
                 <div className="flex justify-between items-center mb-8 mt-2">
                    <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/5">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span className="text-xs font-medium text-slate-200">极简记账</span>
                    </div>
                    <button className="w-10 h-10 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md active:bg-white/20 transition-colors">
                        <i className="fa-regular fa-bell text-slate-200"></i>
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
                <h2 className="text-xl font-bold text-slate-800">近期明细</h2>
                <button className="text-xs font-bold text-slate-400 flex items-center gap-1 active:text-slate-600">
                    全部 <i className="fa-solid fa-chevron-right text-[10px]"></i>
                </button>
            </div>

            {transactions.length === 0 ? (
                <div className="bg-white rounded-3xl p-10 flex flex-col items-center justify-center shadow-sm text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                        <i className="fa-solid fa-receipt text-2xl text-slate-300"></i>
                    </div>
                    <p className="text-slate-800 font-bold mb-1">空空如也</p>
                    <p className="text-slate-400 text-sm">快去记一笔，开启理财生活</p>
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
    const [amount, setAmount] = useState('');
    const [note, setNote] = useState('');
    const [type, setType] = useState<TransactionType>(TransactionType.EXPENSE);
    const [category, setCategory] = useState<string>(Category.FOOD);
    const [isProcessing, setIsProcessing] = useState(false);
    
    // AI Input State
    const [aiInput, setAiInput] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleSave = () => {
      if (!amount || !note) return;
      
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: parseFloat(amount),
        type,
        category,
        note,
        date: new Date().toISOString().split('T')[0],
        timestamp: Date.now()
      };
      
      addTransaction(newTransaction);
    };

    const handleAiParse = async () => {
        if (!aiInput) return;
        setIsProcessing(true);
        const result = await parseTextTransaction(aiInput);
        if (result) {
            applyAiResult(result);
            setAiInput('');
        }
        setIsProcessing(false);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsProcessing(true);
        const reader = new FileReader();
        reader.onloadend = async () => {
            const base64 = reader.result as string;
            const result = await parseReceiptImage(base64);
            if (result) {
                applyAiResult(result);
            }
            setIsProcessing(false);
        };
        reader.readAsDataURL(file);
    };

    const applyAiResult = (res: AiParsedResult) => {
        setAmount(res.amount.toString());
        setNote(res.note);
        setType(res.type);
        setCategory(res.category);
    };

    return (
      <div className="h-full flex flex-col bg-slate-50">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-4 h-24 flex items-center justify-between bg-white/80 backdrop-blur-md z-30 fixed top-0 w-full shadow-[0_2px_15px_rgba(0,0,0,0.02)]">
            <button onClick={() => setView('HOME')} className="w-10 h-10 flex items-center justify-center text-slate-800 rounded-full active:bg-slate-100 transition-colors">
                <i className="fa-solid fa-times text-xl"></i>
            </button>
            <div className="flex bg-slate-100 p-1 rounded-full">
                <button 
                    onClick={() => setType(TransactionType.EXPENSE)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.EXPENSE ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}
                >
                    支出
                </button>
                <button 
                    onClick={() => setType(TransactionType.INCOME)}
                    className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${type === TransactionType.INCOME ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-400'}`}
                >
                    收入
                </button>
            </div>
            <div className="w-10"></div> {/* Spacer for center alignment */}
        </div>

        <div className="flex-1 overflow-y-auto pt-28 px-6 pb-24">
            
            {/* Amount Input - Big & Bold */}
            <div className="mb-8 mt-4 text-center">
                 <label className="block text-xs font-bold text-slate-400 mb-2 uppercase tracking-widest opacity-60">金额 (CNY)</label>
                 <div className="flex items-center justify-center gap-1">
                    <span className="text-3xl font-bold text-slate-900 mt-2">¥</span>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder="0.00"
                        className="bg-transparent text-center text-6xl font-bold text-slate-900 outline-none w-full placeholder-slate-200 caret-emerald-500"
                        autoFocus
                    />
                 </div>
            </div>

            {/* AI Assistant - Floating Card */}
            <div className="bg-white p-1 rounded-[24px] mb-8 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.05)] border border-slate-100">
                <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-[20px] p-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/40 rounded-full -mr-10 -mt-10 blur-xl"></div>
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-2 mb-3">
                            <i className="fa-solid fa-wand-magic-sparkles text-indigo-500 text-sm"></i>
                            <span className="text-xs font-bold text-indigo-800 uppercase tracking-wide">AI 智能识别</span>
                        </div>
                        
                        <div className="flex gap-2">
                             <input 
                                type="text" 
                                placeholder="输入如：打车去机场 58元" 
                                className="flex-1 text-sm py-3 px-4 rounded-xl border-none bg-white/80 focus:ring-2 focus:ring-indigo-200 shadow-sm text-slate-700 placeholder-slate-400"
                                value={aiInput}
                                onChange={(e) => setAiInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleAiParse()}
                             />
                             <button 
                                onClick={handleAiParse}
                                disabled={isProcessing || !aiInput}
                                className="w-11 h-11 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200 active:scale-90 transition-all disabled:opacity-50 disabled:shadow-none"
                             >
                                {isProcessing ? <i className="fa-solid fa-circle-notch fa-spin text-sm"></i> : <i className="fa-solid fa-arrow-up text-sm"></i>}
                             </button>
                        </div>
                        
                        <div className="mt-3 flex justify-center">
                             <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
                             <button onClick={() => fileInputRef.current?.click()} className="text-[10px] font-bold text-indigo-500 flex items-center gap-1.5 py-1.5 px-3 rounded-full bg-white/50 active:bg-white transition-colors">
                                <i className="fa-solid fa-camera"></i> 拍摄小票
                             </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Category Grid */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 mb-4 px-1">选择分类</label>
                <div className="grid grid-cols-4 gap-4">
                    {Object.values(Category).map((cat) => (
                        <button
                            key={cat}
                            onClick={() => setCategory(cat)}
                            className={`aspect-square flex flex-col items-center justify-center rounded-[20px] transition-all duration-300 ${category === cat ? 'bg-slate-800 text-white shadow-lg shadow-slate-800/20 scale-105' : 'bg-white text-slate-400 hover:bg-slate-100'}`}
                        >
                            <div className="text-xs font-bold">{cat}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Note */}
            <div className="mb-8">
                <label className="block text-xs font-bold text-slate-400 mb-3 px-1">备注信息</label>
                <div className="bg-white p-4 rounded-[20px] shadow-sm border border-slate-50 flex items-center gap-3">
                    <i className="fa-regular fa-pen-to-square text-slate-300"></i>
                    <input 
                        type="text" 
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="添加备注..."
                        className="flex-1 bg-transparent outline-none text-slate-700 font-medium placeholder-slate-300"
                    />
                </div>
            </div>

            <button 
                onClick={handleSave}
                className="w-full bg-emerald-500 text-white font-bold py-4 rounded-[20px] text-lg shadow-xl shadow-emerald-500/30 active:scale-[0.98] transition-all hover:shadow-2xl hover:shadow-emerald-500/40"
            >
                确认
            </button>
        </div>
      </div>
    );
  };

  const StatsView = () => (
    <div className="h-full overflow-y-auto pb-32 no-scrollbar bg-[#f2f4f6]">
        {/* Header */}
        <div className="pt-[env(safe-area-inset-top)] px-6 pb-6 bg-white shadow-sm z-10 sticky top-0">
             <div className="flex justify-between items-center h-16">
                 <h2 className="text-2xl font-bold text-slate-800 tracking-tight">财务分析</h2>
                 <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center">
                    <i className="fa-solid fa-calendar text-slate-400"></i>
                 </div>
             </div>
        </div>

        <div className="p-6 space-y-6">
            <AnalysisChart transactions={transactions} />

            {/* AI Advisor Card */}
            <div className="relative group">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-pink-300 to-purple-300 rounded-[26px] opacity-50 blur opacity-40 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white rounded-[24px] p-6 shadow-sm border border-slate-50">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                            <i className="fa-solid fa-robot"></i>
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800 text-sm">AI 理财顾问</h3>
                            <p className="text-[10px] text-slate-400">基于 Gemini 2.5 Flash 模型分析</p>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 rounded-2xl p-4 min-h-[100px]">
                         {isLoadingAdvice ? (
                            <div className="flex flex-col items-center justify-center py-4 space-y-3">
                                <i className="fa-solid fa-circle-notch fa-spin text-indigo-400 text-xl"></i>
                                <span className="text-xs text-slate-400 animate-pulse">正在深度分析您的消费习惯...</span>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-600 leading-7 whitespace-pre-line">
                                {advice || "请多记几笔账单，AI 将为您生成专属理财建议。"}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Monthly Summary */}
            <div>
                <h3 className="font-bold text-slate-800 mb-4 px-2 text-sm uppercase tracking-wide opacity-80">本月概览</h3>
                <div className="bg-white rounded-[24px] p-1 shadow-sm border border-slate-50">
                    <div className="flex items-center p-4 border-b border-slate-50 last:border-0">
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-500 mr-4">
                            <i className="fa-solid fa-arrow-down"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium">总收入</p>
                            <p className="font-bold text-slate-800">¥{income.toFixed(2)}</p>
                        </div>
                    </div>
                    <div className="flex items-center p-4">
                        <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-red-500 mr-4">
                            <i className="fa-solid fa-arrow-up"></i>
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-slate-400 font-medium">总支出</p>
                            <p className="font-bold text-slate-800">¥{expense.toFixed(2)}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <div className="h-10"></div>
        </div>
    </div>
  );

  return (
    <div className="h-full w-full relative bg-[#f2f4f6] text-slate-900 font-sans">
      {view === 'HOME' && <HomeView />}
      {view === 'ADD' && <AddView />}
      {view === 'STATS' && <StatsView />}
      
      {view !== 'ADD' && <NavBar current={view} onChange={setView} />}
    </div>
  );
}