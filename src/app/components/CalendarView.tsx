import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Transaction } from '../store';
import { cn } from '../utils/cn';

interface CalendarViewProps {
  transactions: Transaction[];
  onDayClick: (date: string) => void;
}

export function CalendarView({ transactions, onDayClick }: CalendarViewProps) {
  const [year, setYear] = useState(() => new Date().getFullYear());
  const [month, setMonth] = useState(() => new Date().getMonth());

  const dailySummary = useMemo(() => {
    const map: Record<string, { income: number; expense: number }> = {};
    for (const tx of transactions) {
      if (!map[tx.date]) map[tx.date] = { income: 0, expense: 0 };
      if (tx.type === 'income') map[tx.date].income += tx.amount;
      else map[tx.date].expense += tx.amount;
    }
    return map;
  }, [transactions]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days: (number | null)[] = [];
    for (let i = 0; i < firstDay; i++) days.push(null);
    for (let d = 1; d <= daysInMonth; d++) days.push(d);
    return days;
  }, [year, month]);

  // 月度汇总
  const monthSummary = useMemo(() => {
    const mStr = `${year}-${String(month + 1).padStart(2, '0')}`;
    let income = 0, expense = 0, count = 0;
    for (const tx of transactions) {
      if (tx.date.startsWith(mStr)) {
        count++;
        if (tx.type === 'income') income += tx.amount;
        else expense += tx.amount;
      }
    }
    return { income, expense, count };
  }, [transactions, year, month]);

  const goToPrev = () => {
    if (month === 0) { setYear(y => y - 1); setMonth(11); }
    else setMonth(m => m - 1);
  };

  const goToNext = () => {
    const now = new Date();
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextYear = month === 11 ? year + 1 : year;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth())) return;
    setYear(nextYear);
    setMonth(nextMonth);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        {/* 月份导航 */}
        <div className="flex items-center justify-between mb-4">
          <button onClick={goToPrev} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F4F6] transition-colors">
            <ChevronLeft size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
          <span className="text-[#181C1E] font-bold text-sm">{year}年{month + 1}月</span>
          <button onClick={goToNext} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F1F4F6] transition-colors">
            <ChevronRight size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
        </div>

        {/* 星期标题 */}
        <div className="grid grid-cols-7 mb-2">
          {['日', '一', '二', '三', '四', '五', '六'].map(d => (
            <div key={d} className="text-center text-[11px] text-[#A0AEC0] font-medium py-1">{d}</div>
          ))}
        </div>

        {/* 日期网格 */}
        <div className="grid grid-cols-7 gap-0.5">
          {calendarDays.map((day, idx) => {
            if (day === null) return <div key={`empty-${idx}`} />;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const summary = dailySummary[dateStr];
            const hasExpense = summary && summary.expense > 0;
            const hasIncome = summary && summary.income > 0;
            const isToday = dateStr === todayStr;

            return (
              <button
                key={day}
                onClick={() => onDayClick(dateStr)}
                className={cn(
                  "flex flex-col items-center py-2 rounded-lg transition-all text-[13px] min-h-[44px]",
                  isToday ? "font-bold" : "",
                  isToday ? "ring-1" : "hover:bg-[#F7FAFC]"
                )}
                style={isToday ? { color: 'var(--theme-primary)', ringColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-bg)' } : undefined}
              >
                <span>{day}</span>
                {(hasExpense || hasIncome) && (
                  <div className="flex gap-0.5 mt-1">
                    {hasExpense && <div className="w-1.5 h-1.5 rounded-full bg-[#AA2E33]" />}
                    {hasIncome && <div className="w-1.5 h-1.5 rounded-full bg-[#006D3C]" />}
                  </div>
                )}
                {summary && (
                  <span className="text-[8px] text-[#A0AEC0] mt-0.5 leading-none">
                    {summary.expense > 0 ? `-${summary.expense >= 1000 ? `${(summary.expense/1000).toFixed(0)}k` : summary.expense.toFixed(0)}` : ''}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 月度汇总 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <div className="flex justify-between items-center">
          <span className="text-[#717783] text-[12px]">{month + 1}月共 {monthSummary.count} 笔</span>
          <div className="flex gap-4">
            <span className="text-[#006D3C] text-[13px] font-semibold">收 ¥{monthSummary.income.toLocaleString()}</span>
            <span className="text-[#AA2E33] text-[13px] font-semibold">支 ¥{monthSummary.expense.toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
