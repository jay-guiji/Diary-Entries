import React, { createContext, useContext, useState, useCallback, useEffect, useMemo, ReactNode } from 'react';

export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  date: string;
  time: string;
  note?: string;
  merchant?: string;
}

export interface ThemeSettings {
  colorScheme: string;
  fontSize: string;
}

export interface UserProfile {
  nickname: string;
  avatarEmoji: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  type: TransactionType;
  amount: number;
  category: string;
  subcategory?: string;
  note?: string;
}

export interface AppState {
  transactions: Transaction[];
  budgetTotal: number;
  isQuickAddOpen: boolean;
  editingTransaction: Transaction | null;
  templates: TransactionTemplate[];
  theme: ThemeSettings;
  userProfile: UserProfile;
}

interface ComputedState {
  balance: number;
  monthlyIncome: number;
  monthlyExpense: number;
  budgetUsed: number;
}

interface AppContextType extends AppState, ComputedState {
  setQuickAddOpen: (open: boolean) => void;
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  updateTransaction: (id: string, updates: Partial<Omit<Transaction, 'id'>>) => void;
  setEditingTransaction: (tx: Transaction | null) => void;
  setBudgetTotal: (amount: number) => void;
  clearAllData: () => void;
  importData: (data: { transactions: Transaction[]; budgetTotal: number }) => void;
  exportData: () => { transactions: Transaction[]; budgetTotal: number };
  setTheme: (theme: ThemeSettings) => void;
  setUserProfile: (profile: UserProfile) => void;
  // 细分标签管理
  customSubcategories: Record<string, string[]>;
  addCustomSubcategory: (categoryId: string, name: string, emoji?: string) => void;
  removeCustomSubcategory: (categoryId: string, name: string) => void;
  removeDefaultSubcategory: (categoryId: string, name: string) => void;
  removedDefaults: Record<string, string[]>;
  getSubcategories: (categoryId: string) => SubcategoryItem[];
  // 细分标签排序
  subcategoryOrder: Record<string, string[]>;
  setSubcategoryOrder: (categoryId: string, orderedNames: string[]) => void;
  // 自定义 emoji
  customEmojis: Record<string, string>;
  setCustomEmoji: (subcategoryName: string, emoji: string) => void;
  // 记账模板
  addTemplate: (tpl: Omit<TransactionTemplate, 'id'>) => void;
  deleteTemplate: (id: string) => void;
  useTemplate: (tpl: TransactionTemplate) => void;
}

// --- localStorage 持久化 ---
const STORAGE_KEY = 'bookkeeping_data';
const THEME_KEY = 'bookkeeping_theme';
const PROFILE_KEY = 'bookkeeping_profile';
const TEMPLATES_KEY = 'bookkeeping_templates';
const SUBCATEGORIES_KEY = 'bookkeeping_subcategories';
const SUBCATEGORY_ORDER_KEY = 'bookkeeping_subcategory_order';
const CUSTOM_EMOJIS_KEY = 'bookkeeping_custom_emojis';
const REMOVED_DEFAULTS_KEY = 'bookkeeping_removed_defaults';

// 子分类数据结构（带 emoji 图标）
export interface SubcategoryItem {
  name: string;
  emoji: string;
}

// 预设细分标签（带 emoji 图标）
export const DEFAULT_SUBCATEGORIES: Record<string, SubcategoryItem[]> = {
  Dining: [
    { name: '早餐', emoji: '🥐' },
    { name: '午餐', emoji: '🍱' },
    { name: '晚餐', emoji: '🍽️' },
    { name: '饮料', emoji: '🧋' },
    { name: '零食', emoji: '🍿' },
    { name: '咖啡', emoji: '☕' },
    { name: '外卖', emoji: '🛵' },
    { name: '水果', emoji: '🍎' },
    { name: '火锅', emoji: '🍲' },
    { name: '烧烤', emoji: '🍖' },
    { name: '甜点', emoji: '🍰' },
    { name: '夜宵', emoji: '🌙' },
    { name: '奶茶', emoji: '🧋' },
  ],
  Transport: [
    { name: '打车', emoji: '🚕' },
    { name: '公交地铁', emoji: '🚇' },
    { name: '高铁', emoji: '🚄' },
    { name: '飞机', emoji: '✈️' },
    { name: '加油', emoji: '⛽' },
    { name: '停车费', emoji: '🅿️' },
    { name: '共享单车', emoji: '🚲' },
    { name: '过路费', emoji: '🛣️' },
    { name: '保养维修', emoji: '🔧' },
    { name: '车险', emoji: '🛡️' },
  ],
  Shopping: [
    { name: '日用品', emoji: '🧴' },
    { name: '衣服鞋包', emoji: '👗' },
    { name: '数码电子', emoji: '📱' },
    { name: '家居', emoji: '🏠' },
    { name: '美妆', emoji: '💄' },
    { name: '零食饮料', emoji: '🛒' },
    { name: '母婴', emoji: '🍼' },
    { name: '宠物', emoji: '🐾' },
    { name: '图书', emoji: '📚' },
    { name: '礼物', emoji: '🎁' },
  ],
  Entertainment: [
    { name: '电影', emoji: '🎬' },
    { name: '游戏', emoji: '🎮' },
    { name: '聚会', emoji: '🥳' },
    { name: '旅行', emoji: '✈️' },
    { name: '运动', emoji: '🏃' },
    { name: '唱歌KTV', emoji: '🎤' },
    { name: '演出展览', emoji: '🎭' },
    { name: '健身', emoji: '💪' },
    { name: '棋牌桌游', emoji: '♟️' },
    { name: '摄影', emoji: '📷' },
  ],
  Salary: [
    { name: '工资', emoji: '💰' },
    { name: '兼职', emoji: '💼' },
    { name: '副业', emoji: '🔨' },
    { name: '加班费', emoji: '⏰' },
    { name: '补贴', emoji: '📋' },
  ],
  Bonus: [
    { name: '年终奖', emoji: '🏆' },
    { name: '绩效', emoji: '📈' },
    { name: '红包', emoji: '🧧' },
    { name: '奖励', emoji: '🎖️' },
    { name: '提成', emoji: '💎' },
  ],
  Investment: [
    { name: '股票', emoji: '📊' },
    { name: '基金', emoji: '📉' },
    { name: '理财', emoji: '🏦' },
    { name: '利息', emoji: '💹' },
    { name: '房租收入', emoji: '🏘️' },
    { name: '数字货币', emoji: '₿' },
  ],
  OtherExpense: [
    { name: '医疗', emoji: '🏥' },
    { name: '教育', emoji: '🎓' },
    { name: '话费', emoji: '📱' },
    { name: '水电燃气', emoji: '💡' },
    { name: '房租房贷', emoji: '🏠' },
    { name: '保险', emoji: '🛡️' },
    { name: '人情往来', emoji: '🤝' },
    { name: '维修', emoji: '🔧' },
    { name: '捐赠', emoji: '💝' },
    { name: '罚款', emoji: '📋' },
    { name: '快递', emoji: '📦' },
    { name: '其他杂项', emoji: '📎' },
  ],
  Other: [
    { name: '退款', emoji: '↩️' },
    { name: '报销', emoji: '🧾' },
    { name: '转账', emoji: '💸' },
    { name: '人情往来', emoji: '🤝' },
    { name: '医疗', emoji: '🏥' },
    { name: '教育', emoji: '🎓' },
    { name: '话费', emoji: '📱' },
    { name: '水电燃气', emoji: '💡' },
    { name: '房租房贷', emoji: '🏠' },
    { name: '保险', emoji: '🛡️' },
  ],
};

// 获取子分类名称的 emoji（兼容旧数据）
export function getSubcategoryEmoji(categoryId: string, subcategoryName: string): string {
  const defaults = DEFAULT_SUBCATEGORIES[categoryId] || [];
  const found = defaults.find(s => s.name === subcategoryName);
  return found?.emoji || '📌';
}

function loadCustomSubcategories(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SUBCATEGORIES_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') return data;
    }
  } catch { /* ignore */ }
  return {};
}

function saveCustomSubcategories(data: Record<string, string[]>) {
  try {
    localStorage.setItem(SUBCATEGORIES_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadSubcategoryOrder(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(SUBCATEGORY_ORDER_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') return data;
    }
  } catch { /* ignore */ }
  return {};
}

function saveSubcategoryOrder(data: Record<string, string[]>) {
  try {
    localStorage.setItem(SUBCATEGORY_ORDER_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadCustomEmojis(): Record<string, string> {
  try {
    const raw = localStorage.getItem(CUSTOM_EMOJIS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') return data;
    }
  } catch { /* ignore */ }
  return {};
}

function saveCustomEmojis(data: Record<string, string>) {
  try {
    localStorage.setItem(CUSTOM_EMOJIS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

function loadRemovedDefaults(): Record<string, string[]> {
  try {
    const raw = localStorage.getItem(REMOVED_DEFAULTS_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && typeof data === 'object') return data;
    }
  } catch { /* ignore */ }
  return {};
}

function saveRemovedDefaults(data: Record<string, string[]>) {
  try {
    localStorage.setItem(REMOVED_DEFAULTS_KEY, JSON.stringify(data));
  } catch { /* ignore */ }
}

// 主题色映射表
export const THEME_COLORS: Record<string, { primary: string; primaryDark: string; primaryLight: string; primaryBg: string }> = {
  blue:    { primary: '#005DA7', primaryDark: '#004A86', primaryLight: '#0078D4', primaryBg: '#F0F7FF' },
  emerald: { primary: '#059669', primaryDark: '#047857', primaryLight: '#10B981', primaryBg: '#ECFDF5' },
  violet:  { primary: '#7C3AED', primaryDark: '#6D28D9', primaryLight: '#8B5CF6', primaryBg: '#F5F3FF' },
  rose:    { primary: '#E11D48', primaryDark: '#BE123C', primaryLight: '#F43F5E', primaryBg: '#FFF1F2' },
  amber:   { primary: '#D97706', primaryDark: '#B45309', primaryLight: '#F59E0B', primaryBg: '#FFFBEB' },
  slate:   { primary: '#475569', primaryDark: '#334155', primaryLight: '#64748B', primaryBg: '#F8FAFC' },
};

export const FONT_SIZE_MAP: Record<string, string> = {
  small: '14px',
  medium: '16px',
  large: '18px',
};

function applyThemeToDOM(theme: ThemeSettings) {
  const colors = THEME_COLORS[theme.colorScheme] || THEME_COLORS.blue;
  const root = document.documentElement;
  root.style.setProperty('--theme-primary', colors.primary);
  root.style.setProperty('--theme-primary-dark', colors.primaryDark);
  root.style.setProperty('--theme-primary-light', colors.primaryLight);
  root.style.setProperty('--theme-primary-bg', colors.primaryBg);
  root.style.setProperty('--font-size', FONT_SIZE_MAP[theme.fontSize] || '16px');
}

function loadTheme(): ThemeSettings {
  try {
    const raw = localStorage.getItem(THEME_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.colorScheme) return data;
    }
  } catch { /* ignore */ }
  return { colorScheme: 'blue', fontSize: 'medium' };
}

function loadProfile(): UserProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && data.nickname) return data;
    }
  } catch { /* ignore */ }
  return { nickname: '我的账本', avatarEmoji: '😊' };
}

function loadFromStorage(): { transactions: Transaction[]; budgetTotal: number } | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      if (data && Array.isArray(data.transactions)) {
        return { transactions: data.transactions, budgetTotal: data.budgetTotal ?? 5000 };
      }
    }
  } catch {
    // 存储损坏则忽略
  }
  return null;
}

function saveToStorage(transactions: Transaction[], budgetTotal: number) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ transactions, budgetTotal }));
  } catch {
    // 存储满则忽略
  }
}

// --- Mock 数据（仅首次使用） ---
const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 284.50,
    category: 'Shopping',
    merchant: '盒马鲜生',
    date: '2026-03-22',
    time: '14:30',
  },
  {
    id: '2',
    type: 'income',
    amount: 15000.00,
    category: 'Salary',
    merchant: '工资收入',
    date: '2026-03-21',
    time: '09:00',
  },
  {
    id: '3',
    type: 'expense',
    amount: 42.00,
    category: 'Transport',
    merchant: '滴滴出行',
    date: '2026-03-20',
    time: '18:45',
  },
  {
    id: '4',
    type: 'expense',
    amount: 45.00,
    category: 'Dining',
    merchant: '午餐',
    date: '2026-03-22',
    time: '12:30',
  },
  {
    id: '5',
    type: 'expense',
    amount: 128.50,
    category: 'Shopping',
    merchant: '日用品',
    date: '2026-03-19',
    time: '10:15',
  },
  {
    id: '6',
    type: 'income',
    amount: 8500.00,
    category: 'Salary',
    merchant: '兼职收入',
    date: '2026-03-15',
    time: '09:00',
  },
  {
    id: '7',
    type: 'expense',
    amount: 320.00,
    category: 'Transport',
    merchant: '加油',
    date: '2026-03-15',
    time: '18:45',
  },
  {
    id: '8',
    type: 'expense',
    amount: 25.00,
    category: 'Dining',
    merchant: '咖啡',
    date: '2026-03-14',
    time: '08:30',
  },
];

// --- 工具函数 ---
function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

function getCurrentMonth(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

function computeMonthlyStats(transactions: Transaction[]): ComputedState & { budgetUsed: number } {
  const currentMonth = getCurrentMonth();
  let totalIncome = 0;
  let totalExpense = 0;

  for (const tx of transactions) {
    const txMonth = tx.date.substring(0, 7);
    if (txMonth === currentMonth) {
      if (tx.type === 'income') {
        totalIncome += tx.amount;
      } else {
        totalExpense += tx.amount;
      }
    }
  }

  return {
    monthlyIncome: totalIncome,
    monthlyExpense: totalExpense,
    balance: totalIncome - totalExpense,
    budgetUsed: totalExpense,
  };
}

// --- Context ---
const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const stored = loadFromStorage();
    return stored ? stored.transactions : mockTransactions;
  });

  const [budgetTotal, setBudgetTotal] = useState<number>(() => {
    const stored = loadFromStorage();
    return stored ? stored.budgetTotal : 5000;
  });

  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [editingTransaction, setEditingTransactionState] = useState<Transaction | null>(null);
  const [templates, setTemplates] = useState<TransactionTemplate[]>(() => {
    try {
      const raw = localStorage.getItem(TEMPLATES_KEY);
      if (raw) { const data = JSON.parse(raw); if (Array.isArray(data)) return data; }
    } catch { /* ignore */ }
    return [];
  });

  const [theme, setThemeState] = useState<ThemeSettings>(loadTheme);
  const [userProfile, setUserProfileState] = useState<UserProfile>(loadProfile);
  const [customSubcategories, setCustomSubcategories] = useState<Record<string, string[]>>(loadCustomSubcategories);
  const [subcategoryOrder, setSubcategoryOrderState] = useState<Record<string, string[]>>(loadSubcategoryOrder);
  const [customEmojis, setCustomEmojisState] = useState<Record<string, string>>(loadCustomEmojis);
  const [removedDefaults, setRemovedDefaultsState] = useState<Record<string, string[]>>(loadRemovedDefaults);

  // 初始化时应用主题到 DOM
  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  // 持久化到 localStorage
  useEffect(() => {
    saveToStorage(transactions, budgetTotal);
  }, [transactions, budgetTotal]);

  // 计算月度统计（从交易数据动态计算，不再硬编码）
  const computed = useMemo(() => computeMonthlyStats(transactions), [transactions]);

  const setQuickAddOpen = useCallback((open: boolean) => {
    setIsQuickAddOpen(open);
    if (!open) setEditingTransactionState(null);
  }, []);

  const setEditingTransaction = useCallback((tx: Transaction | null) => {
    setEditingTransactionState(tx);
    if (tx) setIsQuickAddOpen(true);
  }, []);

  const addTemplate = useCallback((tpl: Omit<TransactionTemplate, 'id'>) => {
    setTemplates(prev => {
      const next = [...prev, { ...tpl, id: generateId() }];
      try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const deleteTemplate = useCallback((id: string) => {
    setTemplates(prev => {
      const next = prev.filter(t => t.id !== id);
      try { localStorage.setItem(TEMPLATES_KEY, JSON.stringify(next)); } catch { /* ignore */ }
      return next;
    });
  }, []);

  const useTemplate = useCallback((tpl: TransactionTemplate) => {
    const newTx: Transaction = {
      id: generateId(),
      type: tpl.type,
      amount: tpl.amount,
      category: tpl.category,
      subcategory: tpl.subcategory,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      merchant: tpl.subcategory || tpl.name,
      note: tpl.note,
    };
    setTransactions(prev => [newTx, ...prev]);
  }, []);

  const addTransaction = useCallback((tx: Omit<Transaction, 'id'>) => {
    const newTx: Transaction = { ...tx, id: generateId() };
    setTransactions(prev => [newTx, ...prev]);
    setIsQuickAddOpen(false);
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(tx => tx.id !== id));
  }, []);

  const updateTransaction = useCallback((id: string, updates: Partial<Omit<Transaction, 'id'>>) => {
    setTransactions(prev =>
      prev.map(tx => (tx.id === id ? { ...tx, ...updates } : tx))
    );
  }, []);

  const handleSetBudgetTotal = useCallback((amount: number) => {
    setBudgetTotal(amount);
  }, []);

  const clearAllData = useCallback(() => {
    setTransactions(mockTransactions);
    setBudgetTotal(5000);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const importData = useCallback((data: { transactions: Transaction[]; budgetTotal: number }) => {
    setTransactions(data.transactions);
    setBudgetTotal(data.budgetTotal);
  }, []);

  const exportData = useCallback(() => {
    return { transactions, budgetTotal };
  }, [transactions, budgetTotal]);

  const setTheme = useCallback((newTheme: ThemeSettings) => {
    setThemeState(newTheme);
    localStorage.setItem(THEME_KEY, JSON.stringify(newTheme));
    applyThemeToDOM(newTheme);
  }, []);

  const setUserProfile = useCallback((profile: UserProfile) => {
    setUserProfileState(profile);
    localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, []);

  const addCustomSubcategory = useCallback((categoryId: string, name: string, emoji?: string) => {
    setCustomSubcategories(prev => {
      const existing = prev[categoryId] || [];
      // 检查是否已存在于预设或自定义中
      const defaults = DEFAULT_SUBCATEGORIES[categoryId] || [];
      if (defaults.some(s => s.name === name) || existing.includes(name)) return prev;
      const next = { ...prev, [categoryId]: [...existing, name] };
      saveCustomSubcategories(next);
      return next;
    });
    // 如果提供了自定义 emoji，存储它
    if (emoji) {
      setCustomEmojisState(prev => {
        const next = { ...prev, [name]: emoji };
        saveCustomEmojis(next);
        return next;
      });
    }
  }, []);

  const removeCustomSubcategory = useCallback((categoryId: string, name: string) => {
    setCustomSubcategories(prev => {
      const existing = prev[categoryId] || [];
      if (!existing.includes(name)) return prev;
      const next = { ...prev, [categoryId]: existing.filter(n => n !== name) };
      saveCustomSubcategories(next);
      return next;
    });
  }, []);

  const removeDefaultSubcategory = useCallback((categoryId: string, name: string) => {
    setRemovedDefaultsState(prev => {
      const existing = prev[categoryId] || [];
      if (existing.includes(name)) return prev;
      const next = { ...prev, [categoryId]: [...existing, name] };
      saveRemovedDefaults(next);
      return next;
    });
  }, []);

  const getSubcategories = useCallback((categoryId: string): SubcategoryItem[] => {
    const defaults = DEFAULT_SUBCATEGORIES[categoryId] || [];
    const custom = customSubcategories[categoryId] || [];
    const removed = removedDefaults[categoryId] || [];
    // 合并：预设在前（过滤掉已删除的），自定义在后（去重）
    const filteredDefaults = defaults.filter(s => !removed.includes(s.name));
    const defaultNames = filteredDefaults.map(s => s.name);
    const allItems: SubcategoryItem[] = [
      ...filteredDefaults,
      ...custom
        .filter(c => !defaultNames.includes(c))
        .map(c => ({ name: c, emoji: customEmojis[c] || '📌' })),
    ];
    // 如果有自定义排序，应用排序
    const order = subcategoryOrder[categoryId];
    if (order && order.length > 0) {
      const orderMap = new Map(order.map((name, index) => [name, index]));
      allItems.sort((a, b) => {
        const aIdx = orderMap.get(a.name);
        const bIdx = orderMap.get(b.name);
        if (aIdx !== undefined && bIdx !== undefined) return aIdx - bIdx;
        if (aIdx !== undefined) return -1;
        if (bIdx !== undefined) return 1;
        return 0;
      });
    }
    return allItems;
  }, [customSubcategories, customEmojis, subcategoryOrder, removedDefaults]);

  const setSubcategoryOrder = useCallback((categoryId: string, orderedNames: string[]) => {
    setSubcategoryOrderState(prev => {
      const next = { ...prev, [categoryId]: orderedNames };
      saveSubcategoryOrder(next);
      return next;
    });
  }, []);

  const setCustomEmoji = useCallback((subcategoryName: string, emoji: string) => {
    setCustomEmojisState(prev => {
      const next = { ...prev, [subcategoryName]: emoji };
      saveCustomEmojis(next);
      return next;
    });
  }, []);

  const contextValue = useMemo<AppContextType>(
    () => ({
      transactions,
      budgetTotal,
      isQuickAddOpen,
      editingTransaction,
      templates,
      theme,
      userProfile,
      ...computed,
      setQuickAddOpen,
      addTransaction,
      deleteTransaction,
      updateTransaction,
      setEditingTransaction,
      addTemplate,
      deleteTemplate,
      useTemplate,
      setBudgetTotal: handleSetBudgetTotal,
      clearAllData,
      importData,
      exportData,
      setTheme,
      setUserProfile,
      customSubcategories,
      addCustomSubcategory,
      removeCustomSubcategory,
      removeDefaultSubcategory,
      removedDefaults,
      getSubcategories,
      subcategoryOrder,
      setSubcategoryOrder,
      customEmojis,
      setCustomEmoji,
    }),
    [transactions, budgetTotal, isQuickAddOpen, editingTransaction, templates, theme, userProfile, computed, setQuickAddOpen, addTransaction, deleteTransaction, updateTransaction, setEditingTransaction, addTemplate, deleteTemplate, useTemplate, handleSetBudgetTotal, clearAllData, importData, exportData, setTheme, setUserProfile, customSubcategories, addCustomSubcategory, removeCustomSubcategory, removeDefaultSubcategory, removedDefaults, getSubcategories, subcategoryOrder, setSubcategoryOrder, customEmojis, setCustomEmoji]
  );

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
