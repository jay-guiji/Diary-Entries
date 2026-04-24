import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Search, ChevronDown, Trash2, Inbox, Check, X, Pencil, List, CalendarDays } from 'lucide-react';
import { useApp, type Transaction } from '../store';
import { cn } from '../utils/cn';
import { categoryNames, ALL_CATEGORIES, CATEGORY_MAP } from '../utils/categories';
import { CalendarView } from '../components/CalendarView';

type FilterCategory = 'all' | string;
type FilterType = 'all' | 'income' | 'expense';

export function Transactions() {
  const { transactions, deleteTransaction } = useApp();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<FilterCategory>('all');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showCategoryFilter, setShowCategoryFilter] = useState(false);
  const [showTypeFilter, setShowTypeFilter] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [minAmount, setMinAmount] = useState('');
  const [maxAmount, setMaxAmount] = useState('');
  const [showAmountFilter, setShowAmountFilter] = useState(false);

  const categoryBtnRef = useRef<HTMLButtonElement>(null);
  const typeBtnRef = useRef<HTMLButtonElement>(null);
  const categoryDropRef = useRef<HTMLDivElement>(null);
  const typeDropRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      const target = e.target as Node;
      if (showCategoryFilter && categoryBtnRef.current && !categoryBtnRef.current.contains(target) && categoryDropRef.current && !categoryDropRef.current.contains(target)) {
        setShowCategoryFilter(false);
      }
      if (showTypeFilter && typeBtnRef.current && !typeBtnRef.current.contains(target) && typeDropRef.current && !typeDropRef.current.contains(target)) {
        setShowTypeFilter(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside as any);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside as any);
    };
  }, [showCategoryFilter, showTypeFilter]);

  // 搜索和筛选
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // 搜索过滤
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(tx =>
        tx.date.includes(term) ||
        (tx.merchant && tx.merchant.toLowerCase().includes(term)) ||
        (tx.note && tx.note.toLowerCase().includes(term)) ||
        (tx.subcategory && tx.subcategory.toLowerCase().includes(term)) ||
        tx.category.toLowerCase().includes(term) ||
        (categoryNames[tx.category] && categoryNames[tx.category].includes(term)) ||
        tx.amount.toString().includes(term)
      );
    }

    // 分类筛选
    if (filterCategory !== 'all') {
      result = result.filter(tx => tx.category === filterCategory);
    }

    // 收支类型筛选
    if (filterType !== 'all') {
      result = result.filter(tx => tx.type === filterType);
    }

    // 金额范围筛选
    if (minAmount) {
      const min = Number(minAmount);
      if (!isNaN(min)) result = result.filter(tx => tx.amount >= min);
    }
    if (maxAmount) {
      const max = Number(maxAmount);
      if (!isNaN(max)) result = result.filter(tx => tx.amount <= max);
    }

    return result;
  }, [transactions, searchTerm, filterCategory, filterType, minAmount, maxAmount]);

  // Group transactions by date
  const grouped = useMemo(() => {
    const acc: Record<string, Transaction[]> = {};
    for (const tx of filteredTransactions) {
      if (!acc[tx.date]) acc[tx.date] = [];
      acc[tx.date].push(tx);
    }
    return acc;
  }, [filteredTransactions]);

  const sortedDates = Object.keys(grouped).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const handleDelete = (id: string) => {
    deleteTransaction(id);
  };

  return (
    <div className="flex flex-col gap-6 p-6 pb-32 bg-[#F7FAFC] min-h-full">
      {/* Search & Filters */}
      <div className="flex flex-col gap-4 sticky top-0 bg-[#F7FAFC] z-10 py-2">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="搜索交易记录..."
            className="w-full h-12 bg-white rounded-xl pl-12 pr-4 text-[14px] text-[#181C1E] shadow-sm outline-none border border-transparent focus:ring-2 transition-all"
            style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          {/* 分类筛选按钮 */}
          <button
            ref={categoryBtnRef}
            onClick={() => { setShowCategoryFilter(!showCategoryFilter); setShowTypeFilter(false); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full shrink-0 transition-all text-[13px] font-medium",
              filterCategory !== 'all' ? "text-white shadow-sm" : "bg-[#E2E8F0] text-[#414751]"
            )}
            style={filterCategory !== 'all' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
          >
            {filterCategory === 'all' ? '全部分类' : categoryNames[filterCategory] || filterCategory}
            <ChevronDown size={14} className={cn("transition-transform", showCategoryFilter && "rotate-180")} />
          </button>

          {/* 收支类型筛选按钮 */}
          <button
            ref={typeBtnRef}
            onClick={() => { setShowTypeFilter(!showTypeFilter); setShowCategoryFilter(false); }}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full shrink-0 transition-all text-[13px] font-medium",
              filterType !== 'all' ? "text-white shadow-sm" : "bg-[#E2E8F0] text-[#414751]"
            )}
            style={filterType !== 'all' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
          >
            {filterType === 'all' ? '收支' : filterType === 'income' ? '收入' : '支出'}
            <ChevronDown size={14} className={cn("transition-transform", showTypeFilter && "rotate-180")} />
          </button>

          {/* 金额筛选按钮 */}
          <button
            onClick={() => setShowAmountFilter(!showAmountFilter)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2 rounded-full shrink-0 transition-all text-[13px] font-medium",
              (minAmount || maxAmount) ? "text-white shadow-sm" : "bg-[#E2E8F0] text-[#414751]"
            )}
            style={(minAmount || maxAmount) ? { backgroundColor: 'var(--theme-primary)' } : undefined}
          >
            ¥ 金额
            <ChevronDown size={14} className={cn("transition-transform", showAmountFilter && "rotate-180")} />
          </button>

          {/* 清除筛选 */}
          {(filterCategory !== 'all' || filterType !== 'all' || searchTerm || minAmount || maxAmount) && (
            <button
              onClick={() => { setFilterCategory('all'); setFilterType('all'); setSearchTerm(''); setMinAmount(''); setMaxAmount(''); setShowCategoryFilter(false); setShowTypeFilter(false); setShowAmountFilter(false); }}
              className="flex items-center gap-1 px-3 py-2 bg-[#AA2E33]/10 text-[#AA2E33] rounded-full shrink-0"
            >
              <X size={13} />
              <span className="text-[13px] font-medium">清除</span>
            </button>
          )}

          {/* 视图切换 */}
          <div className="flex ml-auto shrink-0 bg-[#E2E8F0] rounded-full p-0.5">
            <button
              onClick={() => setViewMode('list')}
              className={cn("p-1.5 rounded-full transition-all", viewMode === 'list' ? "bg-white shadow-sm" : "")}
            >
              <List size={14} style={viewMode === 'list' ? { color: 'var(--theme-primary)' } : { color: '#717783' }} />
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={cn("p-1.5 rounded-full transition-all", viewMode === 'calendar' ? "bg-white shadow-sm" : "")}
            >
              <CalendarDays size={14} style={viewMode === 'calendar' ? { color: 'var(--theme-primary)' } : { color: '#717783' }} />
            </button>
          </div>
        </div>

        {/* 分类下拉菜单（独立层级，不受 overflow 影响） */}
        {showCategoryFilter && (
          <div
            ref={categoryDropRef}
            className="absolute left-6 top-[7.5rem] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 min-w-[160px] animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <DropdownOption
              label="全部分类"
              selected={filterCategory === 'all'}
              onClick={() => { setFilterCategory('all'); setShowCategoryFilter(false); }}
            />
            <div className="h-px bg-[#F1F4F6] mx-3 my-1" />
            {Object.entries(categoryNames).map(([key, name]) => (
              <DropdownOption
                key={key}
                label={name}
                selected={filterCategory === key}
                onClick={() => { setFilterCategory(key as FilterCategory); setShowCategoryFilter(false); }}
              />
            ))}
          </div>
        )}

        {/* 收支类型下拉菜单 */}
        {showTypeFilter && (
          <div
            ref={typeDropRef}
            className="absolute left-28 top-[7.5rem] bg-white rounded-2xl shadow-xl border border-[#E2E8F0] py-2 z-50 min-w-[120px] animate-in fade-in slide-in-from-top-2 duration-150"
          >
            <DropdownOption
              label="全部"
              selected={filterType === 'all'}
              onClick={() => { setFilterType('all'); setShowTypeFilter(false); }}
            />
            <div className="h-px bg-[#F1F4F6] mx-3 my-1" />
            <DropdownOption
              label="支出"
              selected={filterType === 'expense'}
              onClick={() => { setFilterType('expense'); setShowTypeFilter(false); }}
            />
            <DropdownOption
              label="收入"
              selected={filterType === 'income'}
              onClick={() => { setFilterType('income'); setShowTypeFilter(false); }}
            />
          </div>
        )}
      </div>

      {/* 金额范围筛选面板 */}
      {showAmountFilter && (
        <div className="flex items-center gap-2 -mt-2">
          <span className="text-[12px] text-[#717783] shrink-0">金额</span>
          <input
            type="number"
            placeholder="最低"
            value={minAmount}
            onChange={(e) => setMinAmount(e.target.value)}
            className="flex-1 h-9 bg-white rounded-lg px-3 text-[13px] text-[#181C1E] outline-none border border-[#E2E8F0] focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
          />
          <span className="text-[#A0AEC0] text-sm">—</span>
          <input
            type="number"
            placeholder="最高"
            value={maxAmount}
            onChange={(e) => setMaxAmount(e.target.value)}
            className="flex-1 h-9 bg-white rounded-lg px-3 text-[13px] text-[#181C1E] outline-none border border-[#E2E8F0] focus:ring-1 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
          />
        </div>
      )}

      {/* 日历视图 */}
      {viewMode === 'calendar' ? (
        <CalendarView
          transactions={filteredTransactions}
          onDayClick={(date) => {
            setSearchTerm(date);
            setViewMode('list');
          }}
        />
      ) : (
      /* 列表视图 - Transaction List */
      sortedDates.length > 0 ? (
        <div className="flex flex-col gap-8">
          {sortedDates.map((date) => {
            const dayTransactions = grouped[date];
            const totalAmount = dayTransactions.reduce((sum, tx) =>
              tx.type === 'income' ? sum + tx.amount : sum - tx.amount, 0
            );

            return (
              <div key={date} className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                  <span className="text-[#717783] text-[13px] font-bold tracking-wide">
                    {formatDateLabel(date)}
                  </span>
                  <span className={cn(
                    "text-[14px] font-bold",
                    totalAmount > 0 ? "text-[#006D3C]" : "text-[#AA2E33]"
                  )}>
                    {totalAmount > 0 ? '+' : ''}¥{Math.abs(totalAmount).toFixed(2)}
                  </span>
                </div>
                <div className="flex flex-col gap-3">
                  {dayTransactions.map(tx => (
                    <TransactionCard key={tx.id} transaction={tx} onDelete={handleDelete} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
          <Inbox size={48} className="text-[#A0AEC0]" />
          <p className="text-[#717783] text-sm">
            {searchTerm || filterCategory !== 'all' || filterType !== 'all' || minAmount || maxAmount
              ? '没有找到匹配的交易记录'
              : '暂无交易记录'
            }
          </p>
        </div>
      ))}
    </div>
  );
}

function DropdownOption({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full px-4 py-2.5 text-left text-[13px] transition-colors flex items-center justify-between gap-3 hover:bg-[#F7FAFC]",
        selected ? "font-semibold" : "text-[#414751]"
      )}
      style={selected ? { color: 'var(--theme-primary)' } : undefined}
    >
      <span>{label}</span>
      {selected && <Check size={15} style={{ color: 'var(--theme-primary)' }} />}
    </button>
  );
}

function formatDateLabel(dateStr: string): string {
  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];

  if (dateStr === todayStr) return '今天';
  if (dateStr === yesterdayStr) return '昨天';

  const [year, month, day] = dateStr.split('-').map(Number);
  const currentYear = today.getFullYear();

  if (year === currentYear) {
    return `${month}月${day}日`;
  }
  return `${year}年${month}月${day}日`;
}

function TransactionCard({ transaction, onDelete }: { transaction: Transaction; onDelete: (id: string) => void }) {
  const isIncome = transaction.type === 'income';
  const [showActions, setShowActions] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const confirmTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { setEditingTransaction } = useApp();
  const displayName = transaction.subcategory || transaction.merchant || transaction.category;
  const subtitle = transaction.subcategory
    ? `${categoryNames[transaction.category] || transaction.category}${transaction.note ? ' · ' + transaction.note : ''}`
    : (transaction.note || categoryNames[transaction.category] || transaction.category);

  // 滑动删除
  const [swipeX, setSwipeX] = useState(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);
  const isSwipingRef = useRef(false);
  const isScrollingRef = useRef(false);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
    touchStartYRef.current = e.touches[0].clientY;
    isSwipingRef.current = false;
    isScrollingRef.current = false;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    const dx = e.touches[0].clientX - touchStartXRef.current;
    const dy = e.touches[0].clientY - touchStartYRef.current;
    if (!isSwipingRef.current && !isScrollingRef.current) {
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 5) { isScrollingRef.current = true; return; }
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 10) isSwipingRef.current = true;
    }
    if (isScrollingRef.current) return;
    if (isSwipingRef.current) setSwipeX(Math.max(Math.min(dx + (swipeX < 0 ? swipeX : 0), 0), -120));
  };

  const handleTouchEnd = () => {
    if (swipeX < -50) { setSwipeX(-120); } else { setSwipeX(0); setConfirmDelete(false); }
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirmDelete) {
      if (confirmTimer.current) clearTimeout(confirmTimer.current);
      onDelete(transaction.id);
    } else {
      setConfirmDelete(true);
      confirmTimer.current = setTimeout(() => setConfirmDelete(false), 3000);
    }
  };

  const handleCardClick = () => {
    if (isSwipingRef.current) return;
    if (swipeX < 0) { setSwipeX(0); setConfirmDelete(false); }
    else { setShowActions(!showActions); setConfirmDelete(false); }
  };

  const catColor = isIncome ? '#006D3C' : (CATEGORY_MAP[transaction.category]?.color || '#AA2E33');

  return (
    <div className="relative overflow-hidden rounded-xl">
      {/* 滑动露出的操作区 */}
      <div className="absolute right-0 top-0 bottom-0 w-[120px] flex items-center justify-end gap-1 pr-3">
        <button
          onClick={(e) => { e.stopPropagation(); setEditingTransaction(transaction); setSwipeX(0); }}
          className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
          style={{ backgroundColor: 'var(--theme-primary)' }}
        >
          <Pencil size={16} />
        </button>
        <button
          onClick={handleDeleteClick}
          className={cn("h-10 rounded-xl flex items-center justify-center transition-all",
            confirmDelete ? "px-3 bg-[#AA2E33] text-white" : "w-10 bg-[#AA2E33]/10 text-[#AA2E33]"
          )}
        >
          {confirmDelete ? <span className="text-[12px] font-semibold">确认</span> : <Trash2 size={16} />}
        </button>
      </div>
      {/* 前景卡片 */}
      <div
        className="bg-white rounded-xl p-4 flex items-center justify-between shadow-[0px_2px_8px_rgba(0,0,0,0.02)] relative"
        style={{ transform: `translateX(${swipeX}px)`, transition: isSwipingRef.current ? 'none' : 'transform 0.25s ease-out' }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCardClick}
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: `${catColor}15`, color: catColor }}>
            <span className="font-bold text-base">{displayName[0]}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[#181C1E] text-[16px] font-medium">{displayName}</span>
            <span className="text-[#717783] text-[12px]">{subtitle}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col items-end gap-1">
            <span className={cn("text-[16px] font-bold", isIncome ? "text-[#006D3C]" : "text-[#AA2E33]")}>
              {isIncome ? '+' : '-'}¥{transaction.amount.toFixed(2)}
            </span>
            <span className="text-[#717783] text-[11px]">{transaction.time}</span>
          </div>
          {showActions && swipeX === 0 && (
            <div className="flex items-center gap-1">
              <button onClick={(e) => { e.stopPropagation(); setEditingTransaction(transaction); }}
                className="p-2 hover:bg-[#005DA7]/10 rounded-lg transition-colors" style={{ color: 'var(--theme-primary)' }}>
                <Pencil size={16} />
              </button>
              {confirmDelete ? (
                <button onClick={handleDeleteClick} className="px-3 py-1.5 text-[12px] font-semibold text-white bg-[#AA2E33] rounded-lg active:scale-95">确认删除</button>
              ) : (
                <button onClick={handleDeleteClick} className="p-2 text-[#AA2E33] hover:bg-[#AA2E33]/10 rounded-lg transition-colors"><Trash2 size={16} /></button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
