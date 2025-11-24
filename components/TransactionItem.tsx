import React from 'react';
import { Transaction, TransactionType } from '../types';

interface Props {
  transaction: Transaction;
  onClick?: () => void;
}

const TransactionItem: React.FC<Props> = ({ transaction, onClick }) => {
  const isExpense = transaction.type === TransactionType.EXPENSE;

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

  // Color mapping for icons
  const getIconColor = (category: string) => {
    if (!isExpense) return 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400'; // Income
    switch (category) {
        case '餐饮': return 'bg-orange-100 text-orange-500 dark:bg-orange-900/30 dark:text-orange-400';
        case '购物': return 'bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400';
        case '交通': return 'bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400';
        case '娱乐': return 'bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400';
        default: return 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400';
    }
  }

  return (
    <div 
      onClick={onClick}
      className="flex items-center justify-between p-4 bg-white dark:bg-slate-800 mb-3 active:scale-[0.98] transition-all duration-200 rounded-2xl shadow-sm border border-slate-50 dark:border-slate-700"
    >
      <div className="flex items-center gap-4">
        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-lg shadow-sm ${getIconColor(transaction.category as string)} transition-transform duration-300 hover:scale-110 hover:rotate-6`}>
          <i className={`fa-solid ${getIcon(transaction.category as string)}`}></i>
        </div>
        <div>
          <p className="font-bold text-slate-800 dark:text-slate-100 text-[15px] mb-0.5">{transaction.note}</p>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500 dark:text-slate-400">{transaction.category}</span>
            <span className="w-0.5 h-0.5 rounded-full bg-slate-300 dark:bg-slate-600"></span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">{transaction.date}</span>
          </div>
        </div>
      </div>
      <div className={`font-bold text-lg tracking-tight ${isExpense ? 'text-slate-900 dark:text-slate-100' : 'text-emerald-500 dark:text-emerald-400'}`}>
        {isExpense ? '-' : '+'} <span className="text-sm font-medium mr-0.5">¥</span>{transaction.amount.toFixed(2)}
      </div>
    </div>
  );
};

export default TransactionItem;