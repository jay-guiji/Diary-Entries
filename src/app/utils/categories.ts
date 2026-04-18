import {
  Utensils, Car, ShoppingBag, Film, Banknote,
  Briefcase, Gift, TrendingUp, MoreHorizontal,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface CategoryInfo {
  id: string;
  name: string;
  shortName: string;  // 短名称用于筛选/标签
  icon: LucideIcon;
  color: string;
  type: 'expense' | 'income';
}

// 全部分类（支出 + 收入），唯一数据源
export const ALL_CATEGORIES: CategoryInfo[] = [
  // 支出
  { id: 'Dining',        name: '餐饮美食', shortName: '餐饮', icon: Utensils,        color: '#005DA7', type: 'expense' },
  { id: 'Transport',     name: '交通出行', shortName: '交通', icon: Car,             color: '#AA2E33', type: 'expense' },
  { id: 'Shopping',      name: '购物消费', shortName: '购物', icon: ShoppingBag,     color: '#006D3C', type: 'expense' },
  { id: 'Entertainment', name: '娱乐休闲', shortName: '娱乐', icon: Film,            color: '#7C3AED', type: 'expense' },
  { id: 'OtherExpense',  name: '其他支出', shortName: '其他', icon: MoreHorizontal,  color: '#717783', type: 'expense' },
  // 收入
  { id: 'Salary',        name: '薪资收入', shortName: '薪资', icon: Briefcase,       color: '#006D3C', type: 'income' },
  { id: 'Bonus',         name: '奖金',     shortName: '奖金', icon: Gift,            color: '#E85D04', type: 'income' },
  { id: 'Investment',    name: '投资收益', shortName: '投资', icon: TrendingUp,      color: '#005DA7', type: 'income' },
  { id: 'Other',         name: '其他收入', shortName: '其他', icon: Banknote,        color: '#717783', type: 'income' },
];

// 便捷查询映射
export const CATEGORY_MAP: Record<string, CategoryInfo> =
  Object.fromEntries(ALL_CATEGORIES.map(c => [c.id, c]));

// 分类名称映射（短名称，用于筛选/流水列表）
export const categoryNames: Record<string, string> =
  Object.fromEntries(ALL_CATEGORIES.map(c => [c.id, c.shortName]));

// 按类型筛选
export const EXPENSE_CATEGORIES = ALL_CATEGORIES.filter(c => c.type === 'expense');
export const INCOME_CATEGORIES = ALL_CATEGORIES.filter(c => c.type === 'income');

// 获取分类短名称（安全回退）
export function getCategoryName(categoryId: string): string {
  return CATEGORY_MAP[categoryId]?.shortName || categoryId;
}

// 获取分类全名（用于报表）
export function getCategoryFullName(categoryId: string): string {
  return CATEGORY_MAP[categoryId]?.name || categoryId;
}

// 获取分类颜色
export function getCategoryColor(categoryId: string): string {
  return CATEGORY_MAP[categoryId]?.color || '#717783';
}

// 获取分类图标组件
export function getCategoryIconComponent(categoryId: string): LucideIcon {
  return CATEGORY_MAP[categoryId]?.icon || Banknote;
}
