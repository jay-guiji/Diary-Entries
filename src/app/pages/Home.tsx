import React from 'react';
import { useApp, getBudgetPeriod, type Transaction } from '../store';
import { cn } from '../utils/cn';
import { ArrowDownLeft, ArrowUpRight, Inbox } from 'lucide-react';
import { Link } from 'react-router';
import { getCategoryName, getCategoryIconComponent, getCategoryColor, CATEGORY_MAP } from '../utils/categories';

export function Home() {
  const { balance, monthlyIncome, monthlyExpense, budgetTotal, budgetUsed, transactions, templates, useTemplate, budgetStartDay } = useApp();

  const recentTransactions = transactions.slice(0, 3);
  const budgetPercentage = budgetTotal > 0 ? Math.min(Math.round((budgetUsed / budgetTotal) * 100), 100) : 0;
  const isOverBudget = budgetUsed > budgetTotal;

  const { start, end } = getBudgetPeriod(budgetStartDay);
  const periodLabel = `${start.slice(5).replace('-', '/')} ~ ${end.slice(5).replace('-', '/')}`;

  return (
    <div className="flex flex-col gap-8 p-6 pb-32">
      {/* Hero Balances */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[#717783] text-[11px] font-medium tracking-wide uppercase">
            {budgetStartDay === 1 ? '本月结余' : '本期结余'}
          </p>
          <div className="flex items-baseline gap-1 font-extrabold tracking-tight overflow-hidden">
            <span className="text-[40px] leading-tight shrink-0" style={{ color: 'var(--theme-primary)' }}>¥</span>
            <span className={cn(
              "text-[40px] leading-tight truncate",
              balance >= 0 ? "text-[#181C1E]" : "text-[#AA2E33]"
            )}>
              {balance.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#F1F4F6] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ArrowDownLeft className="text-[#006D3C]" size={14} strokeWidth={3} />
              <span className="text-[#006D3C] text-[11px] font-medium tracking-wide uppercase">{budgetStartDay === 1 ? '本月收入' : '本期收入'}</span>
            </div>
            <p className="text-[#181C1E] text-xl font-semibold">
              ¥{monthlyIncome.toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="bg-[#F1F4F6] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="text-[#AA2E33]" size={14} strokeWidth={3} />
              <span className="text-[#AA2E33] text-[11px] font-medium tracking-wide uppercase">{budgetStartDay === 1 ? '本月支出' : '本期支出'}</span>
            </div>
            <p className="text-[#181C1E] text-xl font-semibold">
              ¥{monthlyExpense.toLocaleString('zh-CN')}
            </p>
          </div>
        </div>
      </section>

      {/* Budget Status */}
      <section className="bg-white rounded-2xl shadow-[0px_12px_32px_0px_rgba(24,28,30,0.04)] p-6 flex flex-col gap-5">
        <div className="flex items-end justify-between">
          <div className="flex flex-col gap-1">
            <h3 className="text-[#181C1E] text-[18px] font-medium">预算状态</h3>
            <p className="text-[#717783] text-xs">预算周期: {periodLabel}</p>
            <p className="text-[#414751] text-sm">
              已支出 ¥{budgetUsed.toLocaleString()} / 总计 ¥{budgetTotal.toLocaleString()}
            </p>
          </div>
          <span className={cn(
            "text-sm font-semibold",
            isOverBudget ? "text-[#AA2E33]" : "text-[#006D3C]"
          )}>
            {budgetPercentage}%
          </span>
        </div>

        <div className="h-[10px] w-full bg-[#EBEEF0] rounded-full overflow-hidden">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              isOverBudget ? "bg-[#AA2E33]" : "bg-[#006D3C]"
            )}
            style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
          />
        </div>

        <p className={cn("text-[11px] font-medium", isOverBudget ? "text-[#AA2E33]" : "text-[#717783]")}>
          {isOverBudget
            ? `⚠️ 您已超出预算 ¥${(budgetUsed - budgetTotal).toLocaleString()}，请注意控制支出！`
            : `您的支出处于理想范围内。还可支出 ¥${(budgetTotal - budgetUsed).toLocaleString()}`
          }
        </p>
      </section>

      {/* 快捷记账模板 */}
      {templates.length > 0 && (
        <section className="flex flex-col gap-3">
          <h3 className="text-[#181C1E] text-[18px] font-medium px-1">快捷记账</h3>
          <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            {templates.map(tpl => (
              <button
                key={tpl.id}
                onClick={() => useTemplate(tpl)}
                className="flex flex-col items-center gap-1.5 px-4 py-3 bg-white rounded-xl shadow-sm shrink-0 min-w-[80px] active:scale-95 transition-all border border-[#F1F4F6]"
              >
                <span className="text-[16px] font-bold" style={{ color: 'var(--theme-primary)' }}>
                  ¥{tpl.amount}
                </span>
                <span className="text-[11px] text-[#717783] font-medium">{tpl.name}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Recent Transactions */}
      <section className="flex flex-col gap-4">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-[#181C1E] text-[18px] font-medium">最近交易</h3>
          <Link to="/transactions" className="text-sm font-medium" style={{ color: 'var(--theme-primary)' }}>
            查看全部
          </Link>
        </div>

        {recentTransactions.length > 0 ? (
          <div className="flex flex-col gap-3">
            {recentTransactions.map((tx) => (
              <TransactionItem key={tx.id} transaction={tx} />
            ))}
          </div>
        ) : (
          <EmptyState />
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
      <Inbox size={48} className="text-[#A0AEC0]" />
      <p className="text-[#717783] text-sm">暂无交易记录</p>
      <p className="text-[#A0AEC0] text-xs">点击右下角 + 按钮开始记账</p>
    </div>
  );
}

function getCategoryIcon(category: string, type: 'income' | 'expense') {
  const Icon = getCategoryIconComponent(category);
  const color = type === 'income' ? '#006D3C' : (getCategoryColor(category));
  return <Icon className={`text-[${color}]`} size={20} style={{ color }} />;
}

function formatRelativeDate(dateStr: string, time: string): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return `今天 ${time}`;
  if (dateStr === yesterdayStr) return `昨天 ${time}`;

  // 格式化为 M月D日
  const [, month, day] = dateStr.split('-');
  return `${parseInt(month)}月${parseInt(day)}日 ${time}`;
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const isIncome = transaction.type === 'income';
  const displayName = transaction.subcategory || transaction.merchant || getCategoryName(transaction.category);
  const iconColor = isIncome ? '#006D3C' : getCategoryColor(transaction.category);
  return (
    <div className={cn(
      "rounded-xl p-4 flex items-center justify-between",
      isIncome ? "bg-white shadow-sm" : "bg-[#F1F4F6]"
    )}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full flex items-center justify-center"
          style={{ backgroundColor: `${iconColor}15` }}
        >
          {getCategoryIcon(transaction.category, transaction.type)}
        </div>
        <div className="flex flex-col">
          <span className="text-[#181C1E] text-base font-medium">{displayName}</span>
          <span className="text-[#717783] text-[11px] tracking-wide">
            {formatRelativeDate(transaction.date, transaction.time)} · {getCategoryName(transaction.category)}
          </span>
        </div>
      </div>
      <span className={cn(
        "text-base font-semibold",
        isIncome ? "text-[#006D3C]" : "text-[#AA2E33]"
      )}>
        {isIncome ? '+' : '-'}¥{transaction.amount.toFixed(2)}
      </span>
    </div>
  );
}
