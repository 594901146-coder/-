import React, { useState } from 'react';
import { 
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend, Sector,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { Transaction, TransactionType } from '../types';

interface Props {
  transactions: Transaction[];
}

// Consistent color mapping for categories
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

const DEFAULT_COLOR = '#94a3b8';

const renderActiveShape = (props: any) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 6}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        cornerRadius={6}
        style={{ filter: 'drop-shadow(0px 4px 6px rgba(0, 0, 0, 0.2))', transition: 'all 0.3s ease' }}
      />
    </g>
  );
};

const AnalysisChart: React.FC<Props> = ({ transactions }) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('pie');

  const onPieEnter = (_: any, index: number) => {
    setActiveIndex(index);
  };

  const onPieLeave = () => {
    setActiveIndex(-1);
  };

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
      <div className="flex flex-col items-center justify-center h-56 text-slate-400 dark:text-slate-500">
        <div className="w-16 h-16 bg-slate-100/50 dark:bg-slate-800/50 rounded-full flex items-center justify-center mb-3 shadow-inner backdrop-blur-sm">
             <i className="fa-solid fa-chart-pie text-2xl text-slate-300 dark:text-slate-600"></i>
        </div>
        <p className="text-sm font-medium">暂无支出数据</p>
        <p className="text-xs mt-1 opacity-70">记一笔支出即可查看分析</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[32px] p-5 shadow-sm border border-white/40 dark:border-white/5">
      <div className="flex items-center justify-between mb-3">
         <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            <i className={`fa-solid ${chartType === 'pie' ? 'fa-chart-pie' : 'fa-chart-simple'} text-primary text-xs transition-all`}></i>
            支出构成
         </h3>
         
         {/* Toggle Controls */}
         <div className="flex bg-slate-100/50 dark:bg-slate-700/30 p-1 rounded-lg backdrop-blur-sm">
             <button 
                onClick={() => setChartType('pie')}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all duration-300 ${chartType === 'pie' ? 'bg-white/80 dark:bg-slate-600/80 text-emerald-500 shadow-sm scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
             >
                 <i className="fa-solid fa-chart-pie"></i>
             </button>
             <button 
                onClick={() => setChartType('bar')}
                className={`w-7 h-7 rounded-md flex items-center justify-center text-[10px] transition-all duration-300 ${chartType === 'bar' ? 'bg-white/80 dark:bg-slate-600/80 text-blue-500 shadow-sm scale-100' : 'text-slate-400 dark:text-slate-500 hover:text-slate-600'}`}
             >
                 <i className="fa-solid fa-chart-column"></i>
             </button>
         </div>
      </div>
      
      <div className="h-52 w-full">
        <ResponsiveContainer width="100%" height="100%">
            {chartType === 'pie' ? (
                <PieChart>
                    <Pie
                        data={data}
                        cx="50%"
                        cy="45%"
                        innerRadius={50}
                        outerRadius={70}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                        cornerRadius={6}
                        {...{ activeIndex, activeShape: renderActiveShape } as any}
                        onMouseEnter={onPieEnter}
                        onMouseLeave={onPieLeave}
                    >
                        {data.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR} 
                            stroke="none" 
                          />
                        ))}
                    </Pie>
                    <Tooltip 
                        formatter={(value: number) => `¥${value.toFixed(2)}`} 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '12px' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Legend 
                        iconType="circle" 
                        layout="horizontal" 
                        verticalAlign="bottom" 
                        align="center"
                        wrapperStyle={{ fontSize: '10px', paddingTop: '0px', opacity: 0.8, bottom: 0 }} 
                    />
                </PieChart>
            ) : (
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#94a3b8" opacity={0.1} />
                    <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 10 }}
                        dy={10}
                        interval={0}
                    />
                    <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fill: '#94a3b8', fontSize: 9 }}
                    />
                    <Tooltip 
                        cursor={{ fill: 'rgba(0,0,0,0.02)', radius: 8 }}
                        formatter={(value: number) => `¥${value.toFixed(2)}`} 
                        contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)', padding: '8px 12px', backgroundColor: 'rgba(255,255,255,0.95)', fontSize: '12px' }}
                        itemStyle={{ color: '#1e293b', fontWeight: 'bold' }}
                    />
                    <Bar 
                        dataKey="value" 
                        radius={[4, 4, 4, 4]} 
                        barSize={24}
                    >
                        {data.map((entry, index) => (
                            <Cell 
                                key={`cell-${index}`} 
                                fill={CATEGORY_COLORS[entry.name] || DEFAULT_COLOR} 
                            />
                        ))}
                    </Bar>
                </BarChart>
            )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AnalysisChart;