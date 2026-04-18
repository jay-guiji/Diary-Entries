import React, { useState, useMemo } from 'react';
import { useApp, type Transaction } from '../store';
import { cn } from '../utils/cn';
import {
  PieChart, Pie, Cell, ResponsiveContainer,
  AreaChart, Area, XAxis, YAxis, Tooltip,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import {
  Calendar, ChevronLeft, ChevronRight,
  TrendingDown, Banknote, Inbox,
  Wallet, Receipt, CalendarDays, ArrowUpRight, ArrowDownRight, Minus,
  Crown, Medal, Award,
} from 'lucide-react';
import { CATEGORY_MAP } from '../utils/categories';

export function Reports() {
  const { transactions, budgetTotal } = useApp();
  const [tab, setTab] = useState<'expense' | 'income'>('expense');
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');

  const [selectedYear, setSelectedYear] = useState(() => new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(() => new Date().getMonth() + 1);

  const monthStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  // 当月交易
  const monthlyTransactions = useMemo(() =>
    transactions.filter(tx => tx.date.startsWith(monthStr)),
    [transactions, monthStr]
  );

  // 按类型筛选
  const filteredTransactions = useMemo(() =>
    monthlyTransactions.filter(tx => tx.type === tab),
    [monthlyTransactions, tab]
  );

  // 分类统计
  const categoryStats = useMemo(() => {
    const stats: Record<string, { amount: number; count: number }> = {};
    let total = 0;
    for (const tx of filteredTransactions) {
      if (!stats[tx.category]) stats[tx.category] = { amount: 0, count: 0 };
      stats[tx.category].amount += tx.amount;
      stats[tx.category].count += 1;
      total += tx.amount;
    }
    return Object.entries(stats)
      .map(([category, data]) => ({
        category,
        name: CATEGORY_MAP[category]?.name || category,
        color: CATEGORY_MAP[category]?.color || '#717783',
        icon: CATEGORY_MAP[category]?.icon || Banknote,
        amount: data.amount,
        count: data.count,
        percent: total > 0 ? Math.round((data.amount / total) * 100) : 0,
      }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions]);

  const totalAmount = useMemo(() =>
    filteredTransactions.reduce((sum, tx) => sum + tx.amount, 0),
    [filteredTransactions]
  );

  // ====== 新增：概览摘要数据 ======
  const summaryData = useMemo(() => {
    const monthExpense = monthlyTransactions.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
    const monthIncome = monthlyTransactions.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
    const txCount = filteredTransactions.length;
    // 当月天数（到今天或整月）
    const now = new Date();
    const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;
    const daysInMonth = isCurrentMonth ? now.getDate() : new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyAvg = daysInMonth > 0 ? totalAmount / daysInMonth : 0;
    // 预算进度（仅支出）
    const budgetPercent = budgetTotal > 0 ? Math.min(Math.round((monthExpense / budgetTotal) * 100), 100) : 0;
    return { monthExpense, monthIncome, txCount, dailyAvg, daysInMonth, budgetPercent };
  }, [monthlyTransactions, filteredTransactions, totalAmount, selectedYear, selectedMonth, budgetTotal]);

  // ====== 新增：上月对比（环比） ======
  const monthComparison = useMemo(() => {
    let prevM = selectedMonth - 1;
    let prevY = selectedYear;
    if (prevM <= 0) { prevM = 12; prevY -= 1; }
    const prevStr = `${prevY}-${String(prevM).padStart(2, '0')}`;
    const prevTotal = transactions
      .filter(tx => tx.date.startsWith(prevStr) && tx.type === tab)
      .reduce((s, tx) => s + tx.amount, 0);
    const diff = totalAmount - prevTotal;
    const changeRate = prevTotal > 0 ? ((diff / prevTotal) * 100) : (totalAmount > 0 ? 100 : 0);
    return { prevTotal, diff, changeRate, prevMonth: prevM };
  }, [transactions, selectedYear, selectedMonth, tab, totalAmount]);

  // ====== 新增：每日消费柱状图 ======
  const dailyData = useMemo(() => {
    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const dailyMap: Record<number, number> = {};
    for (const tx of filteredTransactions) {
      const day = parseInt(tx.date.split('-')[2], 10);
      dailyMap[day] = (dailyMap[day] || 0) + tx.amount;
    }
    const result = [];
    for (let d = 1; d <= daysInMonth; d++) {
      result.push({ day: d, amount: dailyMap[d] || 0 });
    }
    return result;
  }, [filteredTransactions, selectedYear, selectedMonth]);

  // ====== 新增：TOP 消费排行 ======
  const topTransactions = useMemo(() =>
    [...filteredTransactions]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5),
    [filteredTransactions]
  );

  // 饼图数据
  const pieData = categoryStats.map(s => ({
    name: s.name,
    value: s.amount,
    color: s.color,
  }));

  // 6 个月趋势
  const trendData = useMemo(() => {
    const months: { month: string; value: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      let m = selectedMonth - i;
      let y = selectedYear;
      while (m <= 0) { m += 12; y -= 1; }
      const mStr = `${y}-${String(m).padStart(2, '0')}`;
      const monthTotal = transactions
        .filter(tx => tx.date.startsWith(mStr) && tx.type === tab)
        .reduce((sum, tx) => sum + tx.amount, 0);
      months.push({ month: `${m}月`, value: monthTotal });
    }
    return months;
  }, [transactions, selectedYear, selectedMonth, tab]);

  // ====== 年度报表数据 ======
  const yearlyData = useMemo(() => {
    const months = [];
    for (let m = 1; m <= 12; m++) {
      const mStr = `${selectedYear}-${String(m).padStart(2, '0')}`;
      const monthTxs = transactions.filter(tx => tx.date.startsWith(mStr));
      const income = monthTxs.filter(tx => tx.type === 'income').reduce((s, tx) => s + tx.amount, 0);
      const expense = monthTxs.filter(tx => tx.type === 'expense').reduce((s, tx) => s + tx.amount, 0);
      months.push({ month: m, label: `${m}月`, income, expense, balance: income - expense });
    }
    const totalIncome = months.reduce((s, m) => s + m.income, 0);
    const totalExpense = months.reduce((s, m) => s + m.expense, 0);
    return { months, totalIncome, totalExpense, balance: totalIncome - totalExpense };
  }, [transactions, selectedYear]);

  // 月份切换
  const goToPrevMonth = () => {
    if (selectedMonth === 1) {
      setSelectedYear(y => y - 1);
      setSelectedMonth(12);
    } else {
      setSelectedMonth(m => m - 1);
    }
  };

  const goToNextMonth = () => {
    const now = new Date();
    const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
    const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
    if (nextYear > now.getFullYear() || (nextYear === now.getFullYear() && nextMonth > now.getMonth() + 1)) return;
    setSelectedYear(nextYear);
    setSelectedMonth(nextMonth);
  };

  const isCurrentMonth = selectedYear === new Date().getFullYear() && selectedMonth === new Date().getMonth() + 1;

  const rankIcons = [Crown, Medal, Award];

  return (
    <div className="flex flex-col gap-5 p-6 pb-32 bg-[#F7FAFC] min-h-full">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sticky top-0 bg-[#F7FAFC] z-10 py-2">
        <div className="bg-[#F1F4F6] p-1 rounded-xl flex items-center">
          <button
            className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              tab === 'expense' ? "text-white shadow-md" : "text-[#717783]")}
            style={tab === 'expense' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            onClick={() => setTab('expense')}
          >
            支出
          </button>
          <button
            className={cn("flex-1 py-2 text-sm font-semibold rounded-lg transition-all",
              tab === 'income' ? "text-white shadow-md" : "text-[#717783]")}
            style={tab === 'income' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
            onClick={() => setTab('income')}
          >
            收入
          </button>
        </div>

        {/* 月度/年度切换 */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('monthly')}
            className={cn("flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all",
              viewMode === 'monthly' ? "bg-white shadow-sm" : "text-[#717783]")}
            style={viewMode === 'monthly' ? { color: 'var(--theme-primary)' } : undefined}
          >
            月度
          </button>
          <button
            onClick={() => setViewMode('yearly')}
            className={cn("flex-1 py-1.5 text-[13px] font-semibold rounded-lg transition-all",
              viewMode === 'yearly' ? "bg-white shadow-sm" : "text-[#717783]")}
            style={viewMode === 'yearly' ? { color: 'var(--theme-primary)' } : undefined}
          >
            年度
          </button>
        </div>

        {viewMode === 'monthly' ? (
        <div className="flex items-center gap-3">
          <button onClick={goToPrevMonth} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-[#F1F4F6] transition-colors">
            <ChevronLeft size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm flex-1 justify-center">
            <Calendar size={16} style={{ color: 'var(--theme-primary)' }} />
            <span className="text-[#181C1E] text-sm font-bold">{selectedYear}年{selectedMonth}月</span>
          </div>
          <button
            onClick={goToNextMonth}
            disabled={isCurrentMonth}
            className={cn(
              "w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm transition-colors",
              isCurrentMonth ? "opacity-30 cursor-not-allowed" : "hover:bg-[#F1F4F6]"
            )}
          >
            <ChevronRight size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
        </div>
        ) : (
        <div className="flex items-center gap-3">
          <button onClick={() => setSelectedYear(y => y - 1)} className="w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm hover:bg-[#F1F4F6] transition-colors">
            <ChevronLeft size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm flex-1 justify-center">
            <Calendar size={16} style={{ color: 'var(--theme-primary)' }} />
            <span className="text-[#181C1E] text-sm font-bold">{selectedYear}年</span>
          </div>
          <button
            onClick={() => { if (selectedYear < new Date().getFullYear()) setSelectedYear(y => y + 1); }}
            disabled={selectedYear >= new Date().getFullYear()}
            className={cn(
              "w-10 h-10 flex items-center justify-center bg-white rounded-lg shadow-sm transition-colors",
              selectedYear >= new Date().getFullYear() ? "opacity-30 cursor-not-allowed" : "hover:bg-[#F1F4F6]"
            )}
          >
            <ChevronRight size={18} style={{ color: 'var(--theme-primary)' }} />
          </button>
        </div>
        )}
      </div>

      {viewMode === 'yearly' ? (
        /* ====== 年度报表 ====== */
        <>
          {/* 年度概览 */}
          <div className="rounded-2xl p-5 text-white shadow-md" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <h3 className="text-[16px] font-bold mb-3">{selectedYear}年度总览</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/70 text-[11px]">总收入</p>
                <p className="text-[16px] font-bold mt-1">¥{yearlyData.totalIncome.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/70 text-[11px]">总支出</p>
                <p className="text-[16px] font-bold mt-1">¥{yearlyData.totalExpense.toLocaleString()}</p>
              </div>
              <div className="bg-white/10 rounded-xl p-3 text-center">
                <p className="text-white/70 text-[11px]">结余</p>
                <p className={cn("text-[16px] font-bold mt-1", yearlyData.balance < 0 ? "text-red-300" : "")}>
                  ¥{Math.abs(yearlyData.balance).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* 12个月柱状图 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-[#181C1E] text-[15px] font-bold mb-4">月度{tab === 'expense' ? '支出' : '收入'}对比</h3>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={yearlyData.months} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F4F6" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 10 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#A0AEC0', fontSize: 10 }}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#181C1E', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, tab === 'expense' ? '支出' : '收入']}
                  />
                  <Bar dataKey={tab === 'expense' ? 'expense' : 'income'} radius={[4, 4, 0, 0]} maxBarSize={20}>
                    {yearlyData.months.map((entry) => {
                      const val = tab === 'expense' ? entry.expense : entry.income;
                      return <Cell key={`ym-${entry.month}`} fill={val > 0 ? 'var(--theme-primary)' : '#F1F4F6'} fillOpacity={val > 0 ? 0.85 : 0.4} />;
                    })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 月度明细列表 */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <h3 className="text-[#181C1E] text-[15px] font-bold mb-3">各月明细</h3>
            <div className="flex flex-col gap-2">
              {yearlyData.months.map(m => {
                const val = tab === 'expense' ? m.expense : m.income;
                if (val === 0) return null;
                const maxVal = Math.max(...yearlyData.months.map(x => tab === 'expense' ? x.expense : x.income));
                const barW = maxVal > 0 ? Math.round((val / maxVal) * 100) : 0;
                return (
                  <button key={m.month} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#F7FAFC] transition-colors"
                    onClick={() => { setSelectedMonth(m.month); setViewMode('monthly'); }}>
                    <span className="text-[13px] font-semibold text-[#181C1E] w-8 shrink-0">{m.label}</span>
                    <div className="flex-1 h-2 bg-[#F1F4F6] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${barW}%`, backgroundColor: 'var(--theme-primary)' }} />
                    </div>
                    <span className="text-[13px] font-bold text-[#181C1E] w-20 text-right shrink-0">¥{val.toLocaleString()}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </>
      ) : (
      /* ====== 月度报表 ====== */
      filteredTransactions.length > 0 ? (
        <>
          {/* ====== 1. 概览摘要卡片 ====== */}
          <div className="grid grid-cols-2 gap-3">
            <SummaryCard
              icon={<Wallet size={18} />}
              label={tab === 'expense' ? '本月支出' : '本月收入'}
              value={`¥${totalAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}`}
              accent
            />
            <SummaryCard
              icon={<Receipt size={18} />}
              label="交易笔数"
              value={`${summaryData.txCount} 笔`}
            />
            <SummaryCard
              icon={<CalendarDays size={18} />}
              label="日均消费"
              value={`¥${summaryData.dailyAvg.toFixed(0)}`}
            />
            <SummaryCard
              icon={tab === 'expense' ? (
                monthComparison.changeRate > 0 ? <ArrowUpRight size={18} /> : monthComparison.changeRate < 0 ? <ArrowDownRight size={18} /> : <Minus size={18} />
              ) : (
                monthComparison.changeRate > 0 ? <ArrowUpRight size={18} /> : monthComparison.changeRate < 0 ? <ArrowDownRight size={18} /> : <Minus size={18} />
              )}
              label={`环比${monthComparison.prevMonth}月`}
              value={`${monthComparison.changeRate > 0 ? '+' : ''}${monthComparison.changeRate.toFixed(1)}%`}
              valueColor={
                tab === 'expense'
                  ? monthComparison.changeRate > 0 ? '#E11D48' : monthComparison.changeRate < 0 ? '#059669' : undefined
                  : monthComparison.changeRate > 0 ? '#059669' : monthComparison.changeRate < 0 ? '#E11D48' : undefined
              }
            />
          </div>

          {/* ====== 2. 分类明细 ====== */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[#181C1E] text-[15px] font-bold">分类明细</h3>
            </div>

            <div className="flex flex-col gap-3">
              {categoryStats.map(stat => {
                const Icon = stat.icon;
                return (
                  <CategoryProgressCard
                    key={stat.category}
                    icon={<Icon size={20} />}
                    title={stat.name}
                    txCount={stat.count}
                    amount={stat.amount}
                    percent={stat.percent}
                    color={stat.color}
                  />
                );
              })}
            </div>
          </div>

          {/* ====== 3. 饼图分布 ====== */}
          <div className="bg-white rounded-2xl p-6 shadow-sm flex flex-col items-center">
            <div className="w-full flex justify-between items-start mb-4">
              <div>
                <h3 className="text-[#181C1E] text-[15px] font-bold">{tab === 'expense' ? '支出' : '收入'}分布</h3>
                <p className="text-[#717783] text-[12px]">本月分类占比</p>
              </div>
            </div>

            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    nameKey="name"
                    stroke="none"
                  >
                    {pieData.map((entry) => (
                      <Cell key={`cell-${entry.name}`} fill={entry.color} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[#717783] text-[12px]">{tab === 'expense' ? '总支出' : '总收入'}</span>
                <span className="text-[#181C1E] text-[22px] font-bold">¥{totalAmount.toLocaleString('zh-CN', { maximumFractionDigits: 0 })}</span>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                  <span className="text-[#414751] text-[12px]">{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ====== 4. 每日消费柱状图 ====== */}
          <div className="bg-white rounded-2xl p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-[#181C1E] text-[15px] font-bold">每日{tab === 'expense' ? '支出' : '收入'}</h3>
              <p className="text-[#717783] text-[12px]">查看每天的{tab === 'expense' ? '消费' : '收入'}情况</p>
            </div>
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F4F6" />
                  <XAxis
                    dataKey="day"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A0AEC0', fontSize: 10 }}
                    interval={4}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: '#A0AEC0', fontSize: 10 }}
                    tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.04)' }}
                    contentStyle={{ backgroundColor: '#181C1E', border: 'none', borderRadius: '8px', color: '#fff', fontSize: 12 }}
                    labelFormatter={(label: number) => `${selectedMonth}月${label}日`}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, tab === 'expense' ? '支出' : '收入']}
                  />
                  <Bar dataKey="amount" radius={[3, 3, 0, 0]} maxBarSize={12}>
                    {dailyData.map((entry) => (
                      <Cell
                        key={`day-${entry.day}`}
                        fill={entry.amount > 0 ? 'var(--theme-primary)' : '#F1F4F6'}
                        fillOpacity={entry.amount > 0 ? 0.85 : 0.4}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ====== 5. 6个月趋势 ====== */}
          <div className="rounded-2xl p-5 shadow-md flex flex-col gap-4 text-white" style={{ backgroundColor: 'var(--theme-primary)' }}>
            <div>
              <h3 className="text-[15px] font-bold">{tab === 'expense' ? '支出' : '收入'}趋势</h3>
              <p className="text-white/70 text-[12px]">过去 6 个月</p>
            </div>

            <div className="h-40 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                  <defs key="defs">
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop key="top" offset="5%" stopColor="#ffffff" stopOpacity={0.3} />
                      <stop key="bottom" offset="95%" stopColor="#ffffff" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis key="yaxis" hide />
                  <XAxis key="xaxis" dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#E2E8F0', fontSize: 10 }} />
                  <Tooltip
                    key="tooltip"
                    cursor={false}
                    contentStyle={{ backgroundColor: '#181C1E', border: 'none', borderRadius: '8px', color: '#fff' }}
                    formatter={(value: number) => [`¥${value.toLocaleString()}`, tab === 'expense' ? '支出' : '收入']}
                  />
                  <Area key="area" type="monotone" dataKey="value" stroke="#ffffff" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ====== 6. TOP 消费排行 ====== */}
          {topTransactions.length > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="mb-4">
                <h3 className="text-[#181C1E] text-[15px] font-bold">
                  {tab === 'expense' ? '大额支出' : '大额收入'} TOP 5
                </h3>
                <p className="text-[#717783] text-[12px]">本月单笔金额排行</p>
              </div>
              <div className="flex flex-col gap-3">
                {topTransactions.map((tx, index) => {
                  const catConf = CATEGORY_MAP[tx.category];
                  const RankIcon = index < 3 ? rankIcons[index] : null;
                  const rankColors = ['#E85D04', '#717783', '#AA6B39'];
                  return (
                    <div key={tx.id} className="flex items-center gap-3">
                      {/* 排名 */}
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{
                        backgroundColor: index < 3 ? `${rankColors[index]}15` : '#F1F4F6',
                      }}>
                        {RankIcon ? (
                          <RankIcon size={15} style={{ color: rankColors[index] }} />
                        ) : (
                          <span className="text-[12px] font-bold text-[#A0AEC0]">{index + 1}</span>
                        )}
                      </div>
                      {/* 信息 */}
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#181C1E] truncate">
                          {tx.subcategory || tx.merchant || catConf?.name || '未分类'}
                        </p>
                        <p className="text-[11px] text-[#A0AEC0]">
                          {tx.date.replace(`${selectedYear}-`, '').replace('-', '/')} · {catConf?.name || tx.category}
                        </p>
                      </div>
                      {/* 金额 */}
                      <span className="text-[14px] font-bold text-[#181C1E] shrink-0">
                        ¥{tx.amount.toFixed(2)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ====== 8. 预算进度（仅支出，放最底部） ====== */}
          {tab === 'expense' && budgetTotal > 0 && (
            <div className="bg-white rounded-2xl p-5 shadow-sm">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-[#181C1E] text-[15px] font-bold">预算使用</h3>
                <span className="text-[13px] font-semibold" style={{
                  color: summaryData.budgetPercent >= 90 ? '#E11D48' : summaryData.budgetPercent >= 70 ? '#D97706' : 'var(--theme-primary)'
                }}>
                  {summaryData.budgetPercent}%
                </span>
              </div>
              <div className="h-3 bg-[#F1F4F6] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${summaryData.budgetPercent}%`,
                    backgroundColor: summaryData.budgetPercent >= 90 ? '#E11D48' : summaryData.budgetPercent >= 70 ? '#D97706' : 'var(--theme-primary)',
                  }}
                />
              </div>
              <div className="flex justify-between mt-2 text-[12px] text-[#717783]">
                <span>已花 ¥{summaryData.monthExpense.toFixed(0)}</span>
                <span>预算 ¥{budgetTotal.toLocaleString()}</span>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Inbox size={48} className="text-[#A0AEC0]" />
          <p className="text-[#717783] text-sm">本月暂无{tab === 'expense' ? '支出' : '收入'}记录</p>
        </div>
      ))}
    </div>
  );
}

/* ====== 概览摘要卡片组件 ====== */
function SummaryCard({ icon, label, value, accent, valueColor }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  accent?: boolean;
  valueColor?: string;
}) {
  return (
    <div className={cn(
      "rounded-2xl p-4 shadow-sm flex flex-col gap-2",
      accent ? "text-white" : "bg-white"
    )} style={accent ? { backgroundColor: 'var(--theme-primary)' } : undefined}>
      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center",
        accent ? "bg-white/20" : "bg-[#F1F4F6]"
      )}>
        <span style={{ color: accent ? '#fff' : 'var(--theme-primary)' }}>{icon}</span>
      </div>
      <span className={cn("text-[11px]", accent ? "text-white/70" : "text-[#717783]")}>{label}</span>
      <span className={cn("text-[18px] font-bold", accent ? "text-white" : "text-[#181C1E]")}
        style={valueColor ? { color: valueColor } : undefined}
      >{value}</span>
    </div>
  );
}

/* ====== 分类进度卡片组件 ====== */
function CategoryProgressCard({ icon, title, txCount, amount, percent, color }: {
  icon: React.ReactNode;
  title: string;
  txCount: number;
  amount: number;
  percent: number;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between gap-4">
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <div className="flex-1 flex flex-col gap-2">
        <div className="flex justify-between items-center">
          <div>
            <h4 className="text-[#181C1E] text-[14px] font-bold">{title}</h4>
            <p className="text-[#717783] text-[11px]">{txCount} 笔交易</p>
          </div>
          <div className="text-right">
            <h4 className="text-[#181C1E] text-[14px] font-bold">¥{amount.toFixed(2)}</h4>
            <p className="text-[#717783] text-[11px]">{percent}%</p>
          </div>
        </div>
        <div className="h-1.5 w-full bg-[#E2E8F0] rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all"
            style={{ width: `${percent}%`, backgroundColor: color }}
          />
        </div>
      </div>
    </div>
  );
}
