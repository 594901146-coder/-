import React, { useRef, useState } from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  transaction: Transaction;
  onClick?: () => void;
  onLongPress?: (transaction: Transaction) => void;
}

// Consistent color mapping for categories (Matches AnalysisChart)
const CATEGORY_COLORS: Record<string, string> = {
  '餐饮': '#f59e0b', // Amber 500
  '交通': '#3b82f6', // Blue 500
  '购物': '#ec4899', // Pink 500
  '居住': '#14b8a6', // Teal 500
  '娱乐': '#8b5cf6', // Violet 500
  '医疗': '#ef4444', // Red 500
  '薪资': '#10b981', // Emerald 500
  '其他': '#94a3b8', // Slate 400
};

const TransactionItem: React.FC<Props> = ({ transaction, onClick, onLongPress }) => {
  const isExpense = transaction.type === TransactionType.EXPENSE;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [isPressing, setIsPressing] = useState(false);

  const getIcon = (category: string) => {
    switch (category) {
      case '餐饮': return 'fa-utensils';
      case '交通': return 'fa-car-side';
      case '购物': return 'fa-bag-shopping';
      case '居住': return 'fa-house';
      case '娱乐': return 'fa-gamepad';
      case '医疗': return 'fa-briefcase-medical';
      case '薪资': return 'fa-wallet';
      case '其他': return 'fa-circle-question';
      default: return 'fa-tag';
    }
  };

  const baseColor = !isExpense 
    ? '#10b981' 
    : (CATEGORY_COLORS[transaction.category as string] || '#94a3b8');

  // --- Long Press Logic ---
  const handleStart = () => {
    setIsPressing(true);
    timerRef.current = setTimeout(() => {
      if (onLongPress) {
        onLongPress(transaction);
        // Vibrate if supported
        if (navigator.vibrate) navigator.vibrate(50);
      }
      setIsPressing(false);
    }, 600); // 600ms long press
  };

  const handleEnd = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleCancel = () => {
    setIsPressing(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  return (
    <div 
      onClick={onClick}
      onMouseDown={handleStart}
      onMouseUp={handleEnd}
      onMouseLeave={handleCancel}
      onTouchStart={handleStart}
      onTouchEnd={handleEnd}
      onTouchMove={handleCancel}
      onContextMenu={(e) => e.preventDefault()} // Prevent default browser menu
      className={`flex items-center justify-between p-4 bg-white/40 dark:bg-slate-900/40 backdrop-blur-md mb-3 transition-all duration-200 rounded-[24px] shadow-sm border border-white/40 dark:border-white/5 hover:bg-white/60 dark:hover:bg-slate-800/60 select-none ${isPressing ? 'scale-[0.96] opacity-90' : 'active:scale-[0.98]'}`}
      style={{ WebkitUserSelect: 'none' }}
    >
      <div className="flex items-center gap-4 pointer-events-none">
        <div 
            className="w-12 h-12 rounded-[20px] flex items-center justify-center text-lg shadow-sm transition-transform duration-300 backdrop-blur-sm"
            style={{ 
                backgroundColor: `${baseColor}20`, 
                color: baseColor 
            }}
        >
          <i className={`fa-solid ${getIcon(transaction.category as string)}`}></i>
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] mb-0.5 line-clamp-1">{transaction.note}</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{transaction.category}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{transaction.date}</span>
          </div>
        </div>
      </div>
      <div className={`font-bold text-lg tracking-tight pointer-events-none ${isExpense ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-600 dark:text-emerald-400'}`}>
        {isExpense ? '-' : '+'} <span className="text-sm font-medium mr-0.5">¥</span>{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
};

export default TransactionItem;