import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useApp, type SubcategoryItem } from '../store';
import { cn } from '../utils/cn';
import { PenLine, Delete, Plus, X, ChevronDown, GripVertical, Trash2 } from 'lucide-react';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';

const MAX_AMOUNT = 9999999.99;
const MAX_DECIMAL_PLACES = 2;

// 自定义分类时可选的 emoji 图标
const EMOJI_OPTIONS = [
  // 餐饮相关
  '🍔', '🍕', '🍜', '🍣', '🧋', '🍦', '🍰', '🍩',
  '🍪', '🥤', '🍺', '🍷', '🥗', '🌮', '🍝', '🥘',
  // 生活购物
  '🛍️', '👟', '💊', '🧴', '🧹', '📦', '🎒', '👔',
  // 交通出行
  '🚗', '🏍️', '⛽', '🚌', '🚁', '🛴', '🚢', '🏖️',
  // 娱乐休闲
  '🎬', '🎮', '🎵', '📖', '🎨', '🎳', '🏄', '⛷️',
  // 工作学习
  '💻', '📝', '🎓', '💼', '📊', '🏢', '📚', '✏️',
  // 健康运动
  '🏃', '🧘', '💪', '🏥', '💉', '🏋️', '🚴', '⚽',
  // 家居生活
  '🏠', '🛋️', '💡', '🔧', '🧺', '🌱', '🐶', '🐱',
  // 情感社交
  '🎁', '💝', '🤝', '🎂', '💐', '🧧', '✨', '📌',
];

export function QuickAddModal() {
  const { isQuickAddOpen, setQuickAddOpen, addTransaction, updateTransaction, editingTransaction, setEditingTransaction, addTemplate, getSubcategories, addCustomSubcategory, removeCustomSubcategory, removeDefaultSubcategory, customSubcategories, setSubcategoryOrder } = useApp();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  const [amount, setAmount] = useState('0');
  const [selectedCategory, setSelectedCategory] = useState('Dining');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [selectedDate, setSelectedDate] = useState<'today' | 'yesterday' | 'custom'>('today');
  const [customDate, setCustomDate] = useState('');
  const [note, setNote] = useState('');
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customEmoji, setCustomEmoji] = useState('📌');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [longPressTarget, setLongPressTarget] = useState<string | null>(null);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const customInputRef = useRef<HTMLInputElement>(null);

  const categories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const subcategories = getSubcategories(selectedCategory);
  
  // 收起时默认显示的数量
  const COLLAPSED_COUNT = 5;
  const visibleSubs = isExpanded ? subcategories : subcategories.slice(0, COLLAPSED_COUNT);
  const hasMore = subcategories.length > COLLAPSED_COUNT;

  // 当自定义输入框出现时自动聚焦
  useEffect(() => {
    if (showCustomInput && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [showCustomInput]);

  const handleClose = () => {
    setQuickAddOpen(false);
    setEditingTransaction(null);
    setTimeout(() => {
      setAmount('0');
      setType('expense');
      setSelectedCategory('Dining');
      setSelectedSubcategory(null);
      setSelectedDate('today');
      setCustomDate('');
      setNote('');
      setShowNoteInput(false);
      setShowCustomInput(false);
      setCustomName('');
      setCustomEmoji('📌');
      setShowEmojiPicker(false);
      setIsExpanded(false);
      setIsReordering(false);
      setLongPressTarget(null);
    }, 300);
  };

  const handleTypeChange = (newType: 'expense' | 'income') => {
    setType(newType);
    const firstCat = newType === 'expense' ? 'Dining' : 'Salary';
    setSelectedCategory(firstCat);
    setSelectedSubcategory(null);
    setShowCustomInput(false);
    setCustomName('');
    setCustomEmoji('📌');
    setShowEmojiPicker(false);
    setIsExpanded(false);
    setIsReordering(false);
  };

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    setSelectedSubcategory(null);
    setShowCustomInput(false);
    setCustomName('');
    setCustomEmoji('📌');
    setShowEmojiPicker(false);
    setIsExpanded(false);
    setIsReordering(false);
    setLongPressTarget(null);
  };

  const handleSubcategorySelect = (sub: string) => {
    setSelectedSubcategory(prev => prev === sub ? null : sub);
  };

  const handleAddCustom = () => {
    const trimmed = customName.trim();
    if (trimmed) {
      addCustomSubcategory(selectedCategory, trimmed, customEmoji);
      setSelectedSubcategory(trimmed);
      setCustomName('');
      setCustomEmoji('📌');
      setShowCustomInput(false);
      setShowEmojiPicker(false);
    }
  };

  // 长按删除逻辑
  const handleLongPressStart = useCallback((subName: string) => {
    if (isReordering) return;
    longPressTimer.current = setTimeout(() => {
      setLongPressTarget(subName);
    }, 600);
  }, [isReordering]);

  const handleLongPressEnd = useCallback(() => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  }, []);

  const handleDeleteSubcategory = useCallback((subName: string) => {
    const custom = customSubcategories[selectedCategory] || [];
    if (custom.includes(subName)) {
      removeCustomSubcategory(selectedCategory, subName);
    } else {
      removeDefaultSubcategory(selectedCategory, subName);
    }
    if (selectedSubcategory === subName) {
      setSelectedSubcategory(null);
    }
    setLongPressTarget(null);
  }, [selectedCategory, customSubcategories, removeCustomSubcategory, removeDefaultSubcategory, selectedSubcategory]);

  // 拖拽排序逻辑
  const handleDragStart = useCallback((index: number) => {
    setDraggedIndex(index);
  }, []);

  const handleDragOver = useCallback((index: number) => {
    setDragOverIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    if (draggedIndex !== null && dragOverIndex !== null && draggedIndex !== dragOverIndex) {
      const items = [...subcategories];
      const [moved] = items.splice(draggedIndex, 1);
      items.splice(dragOverIndex, 0, moved);
      setSubcategoryOrder(selectedCategory, items.map(s => s.name));
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [draggedIndex, dragOverIndex, subcategories, selectedCategory, setSubcategoryOrder]);

  // 触摸排序逻辑
  const touchStartY = useRef(0);
  const touchStartIndex = useRef<number | null>(null);

  const handleTouchMoveReorder = useCallback((e: React.TouchEvent, _index: number) => {
    if (!isReordering || touchStartIndex.current === null) return;
    const touch = e.touches[0];
    const el = document.elementFromPoint(touch.clientX, touch.clientY);
    if (el) {
      const btn = el.closest('[data-sub-index]');
      if (btn) {
        const overIdx = parseInt(btn.getAttribute('data-sub-index') || '-1', 10);
        if (overIdx >= 0) setDragOverIndex(overIdx);
      }
    }
  }, [isReordering]);

  const handleTouchEndReorder = useCallback(() => {
    if (touchStartIndex.current !== null && dragOverIndex !== null && touchStartIndex.current !== dragOverIndex) {
      const items = [...subcategories];
      const [moved] = items.splice(touchStartIndex.current, 1);
      items.splice(dragOverIndex, 0, moved);
      setSubcategoryOrder(selectedCategory, items.map(s => s.name));
    }
    touchStartIndex.current = null;
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, [dragOverIndex, subcategories, selectedCategory, setSubcategoryOrder]);

  const handleNumpad = (key: string) => {
    if (key === 'delete') {
      setAmount(prev => prev.length > 1 ? prev.slice(0, -1) : '0');
      return;
    }

    if (key === '.') {
      if (!amount.includes('.')) {
        setAmount(prev => prev + '.');
      }
      return;
    }

    // 数字键 0-9
    setAmount(prev => {
      const next = prev === '0' ? key : prev + key;
      // 检查小数位数限制
      const dotIndex = next.indexOf('.');
      if (dotIndex !== -1 && next.length - dotIndex - 1 > MAX_DECIMAL_PLACES) {
        return prev;
      }
      // 检查金额上限
      const numValue = parseFloat(next);
      if (numValue > MAX_AMOUNT) {
        return prev;
      }
      return next;
    });
  };

  const getDateString = (): string => {
    if (selectedDate === 'custom' && customDate) {
      return customDate;
    }
    const now = new Date();
    if (selectedDate === 'yesterday') {
      now.setDate(now.getDate() - 1);
    }
    return now.toISOString().split('T')[0];
  };

  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const handleSave = () => {
    const numAmount = parseFloat(amount);
    if (numAmount > 0) {
      const categoryName = categories.find(c => c.id === selectedCategory)?.shortName || '未分类';
      const txData = {
        type,
        amount: numAmount,
        category: selectedCategory,
        subcategory: selectedSubcategory || undefined,
        date: getDateString(),
        time: editingTransaction ? editingTransaction.time : new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
        merchant: selectedSubcategory || categoryName,
        note: note || undefined,
      };

      if (editingTransaction) {
        updateTransaction(editingTransaction.id, txData);
      } else {
        addTransaction(txData);
        // 保存为模板
        if (saveAsTemplate) {
          addTemplate({
            name: selectedSubcategory || categoryName,
            type,
            amount: numAmount,
            category: selectedCategory,
            subcategory: selectedSubcategory || undefined,
            note: note || undefined,
          });
        }
      }
      handleClose();
    }
  };

  return (
    <AnimatePresence>
      {isQuickAddOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 max-w-md mx-auto"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 w-full max-w-md mx-auto bg-white rounded-t-3xl z-50 shadow-2xl flex flex-col pt-2"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)', maxHeight: '92vh' }}
          >
            {/* Header: Drag Handle + Close Button */}
            <div className="flex items-center justify-between px-4 pt-1 pb-0 shrink-0">
              <div className="w-8" />
              <div className="w-12 h-1.5 bg-gray-200 rounded-full" />
              <button
                onClick={handleClose}
                className="w-8 h-8 rounded-full bg-[#F1F4F6] flex items-center justify-center text-[#717783] hover:bg-[#E2E8F0] transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="flex flex-col gap-5 p-6 pt-3 overflow-y-auto flex-1">
              {/* Tabs & Date */}
              <div className="flex items-center justify-between">
                <div className="flex bg-[#F1F4F6] p-1 rounded-full w-40">
                  <button
                    onClick={() => handleTypeChange('expense')}
                    className={cn("flex-1 py-1.5 text-sm font-semibold rounded-full transition-all", type === 'expense' ? "text-white shadow-sm" : "text-[#717783]")}
                    style={type === 'expense' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                  >
                    支出
                  </button>
                  <button
                    onClick={() => handleTypeChange('income')}
                    className={cn("flex-1 py-1.5 text-sm font-semibold rounded-full transition-all", type === 'income' ? "text-white shadow-sm" : "text-[#717783]")}
                    style={type === 'income' ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                  >
                    收入
                  </button>
                </div>
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedDate('today')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-semibold rounded-full transition-all",
                      selectedDate === 'today' ? "bg-[#E2EAF1]" : "bg-[#F1F4F6] text-[#717783]"
                    )}
                    style={selectedDate === 'today' ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    今天
                  </button>
                  <button
                    onClick={() => setSelectedDate('yesterday')}
                    className={cn(
                      "px-4 py-1.5 text-sm font-semibold rounded-full transition-all",
                      selectedDate === 'yesterday' ? "bg-[#E2EAF1]" : "bg-[#F1F4F6] text-[#717783]"
                    )}
                    style={selectedDate === 'yesterday' ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    昨天
                  </button>
                  <label className={cn(
                    "relative px-3 py-1.5 text-sm font-semibold rounded-full transition-all cursor-pointer",
                    selectedDate === 'custom' ? "bg-[#E2EAF1]" : "bg-[#F1F4F6] text-[#717783]"
                  )}
                    style={selectedDate === 'custom' ? { color: 'var(--theme-primary)' } : undefined}
                  >
                    {selectedDate === 'custom' && customDate
                      ? `${parseInt(customDate.split('-')[1])}/${parseInt(customDate.split('-')[2])}`
                      : '选日期'}
                    <input
                      type="date"
                      value={customDate}
                      onChange={(e) => {
                        setSelectedDate('custom');
                        setCustomDate(e.target.value);
                      }}
                      max={new Date().toISOString().split('T')[0]}
                      className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Amount Input */}
              <div className="flex flex-col items-center justify-center gap-2 my-1">
                <div className="flex items-baseline text-[#181C1E] font-bold max-w-full overflow-hidden">
                  <span className="text-2xl mr-1" style={{ color: 'var(--theme-primary)' }}>¥</span>
                  <span className="text-[48px] leading-none tracking-tight truncate">{amount}</span>
                </div>
                {showNoteInput ? (
                  <input
                    type="text"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="输入备注..."
                    className="text-center text-sm text-[#414751] bg-[#F1F4F6] rounded-lg px-4 py-2 w-48 outline-none focus:ring-2"
                    style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
                    autoFocus
                    onBlur={() => { if (!note) setShowNoteInput(false); }}
                  />
                ) : (
                  <button
                    onClick={() => setShowNoteInput(true)}
                    className="flex items-center gap-1 text-[#717783] text-sm transition-colors"
                  >
                    <PenLine size={14} /> {note || '添加备注'}
                  </button>
                )}
              </div>

              {/* Category Selection */}
              <div className="flex gap-4 px-2 overflow-x-auto scrollbar-hide pb-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {categories.map(cat => {
                  const Icon = cat.icon;
                  const isSelected = selectedCategory === cat.id;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => handleCategorySelect(cat.id)}
                      className="flex flex-col items-center gap-2 group shrink-0"
                    >
                      <div className={cn(
                        "w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all duration-300",
                        isSelected ? "text-white shadow-lg scale-105" : "bg-[#F1F4F6] text-[#A0AEC0]"
                      )}
                        style={isSelected ? { backgroundColor: 'var(--theme-primary)', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' } : undefined}
                      >
                        <Icon size={26} />
                      </div>
                      <span className={cn("text-xs font-semibold", isSelected ? "" : "text-[#717783]")}
                        style={isSelected ? { color: 'var(--theme-primary)' } : undefined}
                      >
                        {cat.shortName}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Subcategory Tags — 带 emoji 图标、展开/收起、排序、长按删除 */}
              <AnimatePresence mode="wait">
                {subcategories.length > 0 && (
                  <motion.div
                    key={selectedCategory}
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2, ease: 'easeOut' }}
                    className="overflow-hidden"
                  >
                    {/* 标题行：排序/展开控制 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] text-[#717783] font-medium">细分</span>
                        {!isReordering && (
                          <button
                            onClick={() => { setIsReordering(true); setIsExpanded(true); }}
                            className="text-[11px] px-2 py-0.5 rounded-md bg-[#F1F4F6] text-[#717783] hover:text-[#414751] transition-colors"
                          >
                            排序
                          </button>
                        )}
                        {isReordering && (
                          <button
                            onClick={() => setIsReordering(false)}
                            className="text-[11px] px-2 py-0.5 rounded-md text-white transition-colors"
                            style={{ backgroundColor: 'var(--theme-primary)' }}
                          >
                            完成
                          </button>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {!showCustomInput && !isReordering && (
                          <button
                            onClick={() => setShowCustomInput(true)}
                            className="shrink-0 w-6 h-6 rounded-full bg-[#F1F4F6] flex items-center justify-center text-[#717783] hover:bg-[#E2E8F0] transition-colors"
                          >
                            <Plus size={13} />
                          </button>
                        )}
                        {hasMore && !isReordering && (
                          <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center gap-0.5 text-[12px] text-[#717783] hover:text-[#414751] transition-colors"
                          >
                            {isExpanded ? '收起' : `展开(${subcategories.length})`}
                            <ChevronDown size={13} className={cn("transition-transform duration-200", isExpanded && "rotate-180")} />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* 子分类网格 */}
                    <motion.div
                      layout
                      className="flex flex-wrap gap-2"
                    >
                      {visibleSubs.map((sub, index) => {
                        const isSelected = selectedSubcategory === sub.name;
                        const isDragged = draggedIndex === index;
                        const isDragOver = dragOverIndex === index;
                        const isLongPressed = longPressTarget === sub.name;

                        return (
                          <div key={sub.name} className="relative">
                            <motion.button
                              layout
                              data-sub-index={index}
                              onClick={() => {
                                if (!isReordering && !longPressTarget) handleSubcategorySelect(sub.name);
                              }}
                              draggable={isReordering}
                              onDragStart={() => isReordering && handleDragStart(index)}
                              onDragOver={(e) => {
                                e.preventDefault();
                                if (isReordering) handleDragOver(index);
                              }}
                              onDragEnd={() => isReordering && handleDragEnd()}
                              onMouseDown={() => handleLongPressStart(sub.name)}
                              onMouseUp={handleLongPressEnd}
                              onMouseLeave={handleLongPressEnd}
                              onTouchStart={() => {
                                handleLongPressStart(sub.name);
                                if (isReordering) {
                                  touchStartIndex.current = index;
                                  setDraggedIndex(index);
                                }
                              }}
                              onTouchMove={(e) => {
                                handleLongPressEnd();
                                if (isReordering) handleTouchMoveReorder(e, index);
                              }}
                              onTouchEnd={() => {
                                handleLongPressEnd();
                                if (isReordering) handleTouchEndReorder();
                              }}
                              onContextMenu={(e) => e.preventDefault()}
                              className={cn(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[13px] font-medium transition-all duration-200 border select-none",
                                isReordering && "cursor-grab active:cursor-grabbing",
                                isDragged && "opacity-50 scale-95",
                                isDragOver && !isDragged && "ring-2",
                                isLongPressed && "ring-2 ring-red-300 scale-95",
                                isSelected && !isReordering
                                  ? "text-white border-transparent shadow-sm"
                                  : "bg-white text-[#414751] border-[#E2E8F0] hover:border-[#CBD5E1]"
                              )}
                              style={{
                                ...(isSelected && !isReordering ? { backgroundColor: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' } : {}),
                                ...(isDragOver && !isDragged ? { '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties : {}),
                              }}
                            >
                              {isReordering && <GripVertical size={12} className="text-[#A0AEC0] -ml-1" />}
                              <span className="text-[14px] leading-none">{sub.emoji}</span>
                              <span>{sub.name}</span>
                            </motion.button>

                            {/* 长按删除确认气泡 */}
                            <AnimatePresence>
                              {isLongPressed && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0.8, y: 4 }}
                                  animate={{ opacity: 1, scale: 1, y: 0 }}
                                  exit={{ opacity: 0, scale: 0.8, y: 4 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute -top-11 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white rounded-lg shadow-lg border border-[#E2E8F0] px-2 py-1.5"
                                >
                                  <button
                                    onClick={() => handleDeleteSubcategory(sub.name)}
                                    className="flex items-center gap-1 text-[11px] text-red-500 font-medium hover:bg-red-50 rounded px-1.5 py-0.5 transition-colors"
                                  >
                                    <Trash2 size={12} />
                                    删除
                                  </button>
                                  <div className="w-px h-4 bg-[#E2E8F0]" />
                                  <button
                                    onClick={() => setLongPressTarget(null)}
                                    className="text-[11px] text-[#717783] font-medium hover:bg-gray-50 rounded px-1.5 py-0.5 transition-colors"
                                  >
                                    取消
                                  </button>
                                  {/* 小三角 */}
                                  <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-r border-b border-[#E2E8F0] rotate-45" />
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        );
                      })}
                    </motion.div>

                    {/* 自定义输入框（带 emoji 选择器） */}
                    <AnimatePresence>
                      {showCustomInput && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.15 }}
                          className="overflow-hidden"
                        >
                          <div className="flex items-center gap-2 mt-2">
                            {/* Emoji 选择按钮 */}
                            <button
                              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                              className={cn(
                                "h-9 w-9 rounded-lg flex items-center justify-center text-lg shrink-0 border-2 transition-all",
                                showEmojiPicker ? "border-transparent shadow-sm" : "border-[#E2E8F0] bg-[#F1F4F6]"
                              )}
                              style={showEmojiPicker ? { borderColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-bg, #F0F7FF)' } : undefined}
                              title="选择图标"
                            >
                              {customEmoji}
                            </button>
                            <input
                              ref={customInputRef}
                              type="text"
                              value={customName}
                              onChange={(e) => setCustomName(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') handleAddCustom();
                                if (e.key === 'Escape') { setShowCustomInput(false); setCustomName(''); setCustomEmoji('📌'); setShowEmojiPicker(false); }
                              }}
                              placeholder="输入自定义细分..."
                              maxLength={10}
                              className="flex-1 h-9 bg-[#F1F4F6] rounded-lg px-3 text-sm text-[#181C1E] outline-none focus:ring-2 transition-all"
                              style={{ '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties}
                            />
                            <button
                              onClick={handleAddCustom}
                              disabled={!customName.trim()}
                              className={cn(
                                "h-9 px-4 rounded-lg text-sm font-medium text-white transition-all",
                                customName.trim() ? "shadow-sm" : "opacity-40 cursor-not-allowed"
                              )}
                              style={{ backgroundColor: 'var(--theme-primary)' }}
                            >
                              添加
                            </button>
                            <button
                              onClick={() => { setShowCustomInput(false); setCustomName(''); setCustomEmoji('📌'); setShowEmojiPicker(false); }}
                              className="h-9 w-9 rounded-lg bg-[#F1F4F6] flex items-center justify-center text-[#717783] hover:bg-[#E2E8F0] transition-colors shrink-0"
                            >
                              <X size={16} />
                            </button>
                          </div>

                          {/* Emoji 选择网格 */}
                          <AnimatePresence>
                            {showEmojiPicker && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.15 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-2 p-3 bg-[#F7FAFC] rounded-xl border border-[#E2E8F0]">
                                  <div className="text-xs text-[#717783] mb-2 font-medium">选择图标</div>
                                  <div className="grid grid-cols-7 gap-1.5">
                                    {EMOJI_OPTIONS.map(emoji => (
                                      <button
                                        key={emoji}
                                        onClick={() => { setCustomEmoji(emoji); setShowEmojiPicker(false); }}
                                        className={cn(
                                          "aspect-square rounded-lg flex items-center justify-center text-2xl hover:bg-white hover:shadow-sm transition-all",
                                          customEmoji === emoji ? "bg-white shadow-sm ring-2" : ""
                                        )}
                                        style={customEmoji === emoji ? { '--tw-ring-color': 'var(--theme-primary)' } as React.CSSProperties : undefined}
                                      >
                                        {emoji}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* 保存为模板选项 */}
              {!editingTransaction && (
                <button
                  onClick={() => setSaveAsTemplate(!saveAsTemplate)}
                  className="flex items-center gap-2 self-start"
                >
                  <div className={cn(
                    "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                    saveAsTemplate ? "border-transparent" : "border-[#CBD5E0]"
                  )}
                    style={saveAsTemplate ? { backgroundColor: 'var(--theme-primary)', borderColor: 'var(--theme-primary)' } : undefined}
                  >
                    {saveAsTemplate && <span className="text-white text-[10px] leading-none">✓</span>}
                  </div>
                  <span className="text-[12px] text-[#717783]">同时保存为快捷模板</span>
                </button>
              )}

              {/* Numpad — +/- 已移除，不再作为金额输入键 */}
              <div className="grid grid-cols-4 gap-3 bg-white mt-2">
                {['1', '2', '3'].map(k => <NumpadKey key={k} value={k} onClick={() => handleNumpad(k)} />)}
                <NumpadKey value="delete" icon={<Delete size={20} />} bg="bg-[#E2E8F0]" onClick={() => handleNumpad('delete')} />

                {['4', '5', '6'].map(k => <NumpadKey key={k} value={k} onClick={() => handleNumpad(k)} />)}
                <NumpadKey value="00" onClick={() => { handleNumpad('0'); handleNumpad('0'); }} bg="bg-[#E2E8F0]" />

                {['7', '8', '9'].map(k => <NumpadKey key={k} value={k} onClick={() => handleNumpad(k)} />)}
                <NumpadKey value="." onClick={() => handleNumpad('.')} bg="bg-[#E2E8F0]" />

                <NumpadKey value="0" onClick={() => handleNumpad('0')} />
                <button
                  onClick={handleSave}
                  disabled={parseFloat(amount) <= 0}
                  className={cn(
                    "col-span-3 h-14 rounded-2xl text-xl font-medium shadow-md transition-all active:scale-95",
                    parseFloat(amount) > 0
                      ? "text-white"
                      : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                  )}
                  style={parseFloat(amount) > 0 ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                >
                  {editingTransaction ? '更新' : '保存'}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function NumpadKey({ value, icon, bg = "bg-[#F7FAFC]", onClick }: { value: string; icon?: React.ReactNode; bg?: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "h-14 rounded-2xl flex items-center justify-center text-[22px] font-semibold text-[#181C1E] active:scale-95 transition-all shadow-sm",
        bg
      )}
    >
      {icon || value}
    </button>
  );
}
