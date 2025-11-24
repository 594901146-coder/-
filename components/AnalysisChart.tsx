import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

const AnalysisChart: React.FC<Props> = ({ transactions }) => {
  const expenses = transactions.filter(t => t.type === TransactionType.EXPENSE);
  
  const dataMap = expenses.reduce((acc, curr) => {
    const cat = curr.category as string;
    acc[cat] = (acc[cat] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(dataMap)
    .map(([name, value]) => ({ name, value: value as number }))
    .sort((a, b) => (b.value as number) - (a.value as number));

  if (data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-72 text-slate-400">
        <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-4 shadow-inner">
             <i className="fa-solid fa-chart-pie text-3xl text-slate-300"></i>
        </div>
        <p className="text-sm font-medium">暂无支出数据</p>
        <p className="text-xs mt-1 opacity-70">记一笔支出即可查看分析</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-3xl p-6 shadow-sm border border-slate-50/50">
      <div className="flex items-center justify-between mb-6">
         <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <i className="fa-solid fa-chart-simple text-primary text-sm"></i>
            支出构成
         </h3>
         <select className="text-xs bg-slate-50 border-none outline-none text-slate-500 font-medium py-1.5 px-3 rounded-full">
            <option>本月</option>
         </select>
      </div>
      
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
            <PieChart>
            <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={6}
            >
                {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
            </Pie>
            <Tooltip 
                formatter={(value: number) => `¥${value.toFixed(2)}`} 
                contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '12px 16px' }}
                itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
            />
            <Legend 
                iconType="circle" 
                layout="horizontal" 
                verticalAlign="bottom" 
                align="center"
                wrapperStyle={{ fontSize: '11px', paddingTop: '20px', opacity: 0.8 }} 
            />
            </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisChart;