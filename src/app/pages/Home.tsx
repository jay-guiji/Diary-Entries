import React from 'react';
import { useApp, type Transaction } from '../store';
import { cn } from '../utils/cn';
import { ArrowDownLeft, ArrowUpRight, ShoppingBag, Banknote, Car, Coffee, Utensils, Briefcase, Gift, TrendingUp, Film, Inbox } from 'lucide-react';
import { Link } from 'react-router';

export function Home() {
  const { balance, monthlyIncome, monthlyExpense, budgetTotal, budgetUsed, transactions } = useApp();

  const recentTransactions = transactions.slice(0, 3);
  const budgetPercentage = budgetTotal > 0 ? Math.min(Math.round((budgetUsed / budgetTotal) * 100), 100) : 0;
  const isOverBudget = budgetUsed > budgetTotal;

  return (
    <div className="flex flex-col gap-8 p-6 pb-32">
      {/* Hero Balances */}
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-1">
          <p className="text-[#717783] text-[11px] font-medium tracking-wide uppercase">
            本月结余
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
              <span className="text-[#006D3C] text-[11px] font-medium tracking-wide uppercase">本月收入</span>
            </div>
            <p className="text-[#181C1E] text-xl font-semibold">
              ¥{monthlyIncome.toLocaleString('zh-CN')}
            </p>
          </div>
          <div className="bg-[#F1F4F6] rounded-xl p-5 flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <ArrowUpRight className="text-[#AA2E33]" size={14} strokeWidth={3} />
              <span className="text-[#AA2E33] text-[11px] font-medium tracking-wide uppercase">本月支出</span>
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
  if (type === 'income') {
    switch (category) {
      case 'Salary': return <Briefcase className="text-[#006D3C]" size={20} />;
      case 'Bonus': return <Gift className="text-[#006D3C]" size={20} />;
      case 'Investment': return <TrendingUp className="text-[#006D3C]" size={20} />;
      default: return <Banknote className="text-[#006D3C]" size={20} />;
    }
  }
  switch (category) {
    case 'Shopping': return <ShoppingBag className="text-[#005DA7]" size={20} />;
    case 'Transport': return <Car className="text-[#AA2E33]" size={20} />;
    case 'Dining': return <Utensils className="text-[#E85D04]" size={20} />;
    case 'Entertainment': return <Film className="text-[#7C3AED]" size={20} />;
    default: return <Coffee className="text-[#717783]" size={20} />;
  }
}

function getIconBgClass(type: 'income' | 'expense', category: string) {
  if (type === 'income') return "bg-[#006D3C]/10";
  switch (category) {
    case 'Shopping': return "bg-[#005DA7]/10";
    case 'Transport': return "bg-[#AA2E33]/10";
    case 'Dining': return "bg-[#E85D04]/10";
    case 'Entertainment': return "bg-[#7C3AED]/10";
    default: return "bg-gray-100";
  }
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
  // 显示名称优先级：subcategory > merchant > category名称
  const displayName = transaction.subcategory || transaction.merchant || getCategoryName(transaction.category);
  return (
    <div className={cn(
      "rounded-xl p-4 flex items-center justify-between",
      isIncome ? "bg-white shadow-sm" : "bg-[#F1F4F6]"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", getIconBgClass(transaction.type, transaction.category))}>
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

function getCategoryName(category: string) {
  const map: Record<string, string> = {
    'Shopping': '购物',
    'Salary': '薪资',
    'Transport': '交通',
    'Dining': '餐饮',
    'Entertainment': '娱乐',
    'Bonus': '奖金',
    'Investment': '投资',
    'Other': '其他',
  };
  return map[category] || category;
}
