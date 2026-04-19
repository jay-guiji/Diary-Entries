import React, { useState, useRef, useEffect } from 'react';
import {
  User,
  ChevronRight,
  ChevronLeft,
  Shield,
  Bell,
  Palette,
  CircleHelp,
  Wallet,
  TrendingUp,
  TrendingDown,
  Target,
  Trash2,
  X,
  Download,
  Upload,
  Check,
  Clock,
  BellRing,
  BellOff,
  AlertTriangle,
  BookOpen,
  MessageSquare,
  Star,
  Info,
  Pencil,
} from 'lucide-react';
import { cn } from '../utils/cn';
import { useApp, THEME_COLORS, FONT_SIZE_MAP } from '../store';
import { categoryNames as catNames } from '../utils/categories';

// ==================== 类型定义 ====================
type ModalView =
  | 'none'
  | 'budget'
  | 'backup'
  | 'reminder'
  | 'theme'
  | 'help'
  | 'clearConfirm'
  | 'profile';

// ==================== 子面板组件 ====================

/** 个人资料编辑面板 */
function ProfileEditPanel({
  nickname,
  avatarEmoji,
  onSave,
  onClose,
}: {
  nickname: string;
  avatarEmoji: string;
  onSave: (nickname: string, avatarEmoji: string) => void;
  onClose: () => void;
}) {
  const [editNickname, setEditNickname] = useState(nickname);
  const [selectedEmoji, setSelectedEmoji] = useState(avatarEmoji);

  const emojiOptions = ['😊', '😎', '🤩', '🥳', '😺', '🐻', '🦊', '🐨', '🦁', '🐯', '🐸', '🐵', '🌟', '🔥', '💎', '🎯', '🍀', '🌈'];

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="个人资料" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        {/* 头像选择 */}
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-4xl"
            style={{ backgroundColor: 'var(--theme-primary-bg)' }}
          >
            {selectedEmoji}
          </div>
          <p className="text-[#717783] text-xs">选择你的头像</p>
        </div>

        <div className="grid grid-cols-6 gap-3">
          {emojiOptions.map((emoji) => (
            <button
              key={emoji}
              onClick={() => setSelectedEmoji(emoji)}
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-all',
                selectedEmoji === emoji
                  ? 'ring-2 scale-110'
                  : 'bg-[#F7FAFC] hover:bg-[#EDF2F7]'
              )}
              style={selectedEmoji === emoji ? { ringColor: 'var(--theme-primary)', backgroundColor: 'var(--theme-primary-bg)' } : undefined}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* 昵称编辑 */}
        <div>
          <label className="text-[#181C1E] text-sm font-semibold mb-2 block">昵称</label>
          <input
            type="text"
            value={editNickname}
            onChange={(e) => setEditNickname(e.target.value)}
            className="w-full py-3 px-4 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl text-[#181C1E] text-sm outline-none transition-colors"
            style={{ borderColor: editNickname ? undefined : '#E2E8F0' }}
            placeholder="输入你的昵称"
            maxLength={20}
          />
          <p className="text-[#A0AEC0] text-xs mt-1 text-right">{editNickname.length}/20</p>
        </div>
      </div>

      {/* 保存按钮 */}
      <div className="p-5 pt-2">
        <button
          onClick={() => {
            if (editNickname.trim()) onSave(editNickname.trim(), selectedEmoji);
          }}
          disabled={!editNickname.trim()}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
            editNickname.trim()
              ? 'text-white active:opacity-80'
              : 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
          )}
          style={editNickname.trim() ? { backgroundColor: 'var(--theme-primary)' } : undefined}
        >
          保存
        </button>
      </div>
    </div>
  );
}

/** 预算管理面板 */
function BudgetPanel({
  budgetTotal,
  monthlyExpense,
  onSave,
  onClose,
}: {
  budgetTotal: number;
  monthlyExpense: number;
  onSave: (amount: number) => void;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState(String(budgetTotal));
  const presets = [1000, 3000, 5000, 8000, 10000, 20000];
  const numericAmount = Number(amount) || 0;
  const percent = numericAmount > 0 ? Math.min(100, Math.round((monthlyExpense / numericAmount) * 100)) : 0;
  const remaining = numericAmount - monthlyExpense;

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="预算管理" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div className="rounded-2xl p-4" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
          <div className="flex justify-between items-center mb-2">
            <span className="text-[#717783] text-xs">本月已支出 / 预算</span>
            <span className={cn('text-sm font-bold', percent >= 100 ? 'text-red-500' : percent >= 80 ? 'text-amber-500' : '')}
              style={percent < 80 ? { color: 'var(--theme-primary)' } : undefined}>
              {percent}%
            </span>
          </div>
          <div className="w-full h-2.5 bg-white rounded-full overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all duration-500', percent >= 100 ? 'bg-red-500' : percent >= 80 ? 'bg-amber-500' : '')}
              style={{ width: `${Math.min(100, percent)}%`, backgroundColor: percent < 80 ? 'var(--theme-primary)' : undefined }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-xs text-[#717783]">¥{monthlyExpense.toLocaleString()}</span>
            <span className="text-xs text-[#717783]">¥{numericAmount.toLocaleString()}</span>
          </div>
          {remaining >= 0 ? (
            <p className="text-xs mt-2" style={{ color: 'var(--theme-primary)' }}>还可支出 ¥{remaining.toLocaleString()}</p>
          ) : (
            <p className="text-xs text-red-500 mt-2 flex items-center gap-1">
              <AlertTriangle size={12} />
              已超支 ¥{Math.abs(remaining).toLocaleString()}
            </p>
          )}
        </div>

        <div>
          <label className="text-[#181C1E] text-sm font-semibold mb-3 block">设置月预算</label>
          <div className="flex items-center bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl overflow-hidden">
            <span className="px-4 font-bold text-lg" style={{ color: 'var(--theme-primary)' }}>¥</span>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="flex-1 py-3.5 pr-4 bg-transparent text-[#181C1E] text-lg font-bold outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              placeholder="输入预算金额"
              min={0}
              max={9999999}
            />
          </div>
        </div>

        <div>
          <label className="text-[#717783] text-xs mb-2 block">快捷设置</label>
          <div className="grid grid-cols-3 gap-2">
            {presets.map((p) => (
              <button
                key={p}
                onClick={() => setAmount(String(p))}
                className={cn(
                  'py-2.5 rounded-xl text-sm font-semibold transition-all',
                  Number(amount) === p
                    ? 'text-white'
                    : 'bg-[#F1F4F6] text-[#181C1E] hover:bg-[#E2E8F0] active:bg-[#CBD5E0]'
                )}
                style={Number(amount) === p ? { backgroundColor: 'var(--theme-primary)' } : undefined}
              >
                ¥{p.toLocaleString()}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-5 pt-2">
        <button
          onClick={() => {
            if (numericAmount > 0) onSave(numericAmount);
          }}
          disabled={numericAmount <= 0}
          className={cn(
            'w-full py-3.5 rounded-xl font-bold text-sm transition-all',
            numericAmount > 0
              ? 'text-white active:opacity-80'
              : 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
          )}
          style={numericAmount > 0 ? { backgroundColor: 'var(--theme-primary)' } : undefined}
        >
          保存预算
        </button>
      </div>
    </div>
  );
}

/** 数据备份与恢复面板 */
function BackupPanel({
  onExport,
  onExportCSV,
  onImport,
  onClose,
  transactionCount,
}: {
  onExport: () => void;
  onExportCSV: () => void;
  onImport: (file: File) => void;
  onClose: () => void;
  transactionCount: number;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="数据备份与恢复" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div className="rounded-2xl p-4 text-center" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
          <Shield size={32} className="mx-auto mb-2" style={{ color: 'var(--theme-primary)' }} />
          <p className="text-[#181C1E] font-bold text-sm">当前共 {transactionCount} 条交易记录</p>
          <p className="text-[#717783] text-xs mt-1">数据保存在浏览器本地存储中</p>
        </div>

        <button
          onClick={onExport}
          className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:bg-[#F7FAFC] active:bg-[#EDF2F7] transition-colors text-left"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
            <Download size={22} className="text-emerald-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#181C1E] text-sm font-bold">导出数据 (JSON)</span>
            <span className="text-[#717783] text-xs mt-0.5">完整备份，可用于恢复数据</span>
          </div>
        </button>

        <button
          onClick={onExportCSV}
          className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:bg-[#F7FAFC] active:bg-[#EDF2F7] transition-colors text-left"
        >
          <div className="w-12 h-12 bg-violet-50 rounded-xl flex items-center justify-center shrink-0">
            <Download size={22} className="text-violet-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#181C1E] text-sm font-bold">导出为 CSV</span>
            <span className="text-[#717783] text-xs mt-0.5">适合在 Excel / 表格中分析</span>
          </div>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 hover:bg-[#F7FAFC] active:bg-[#EDF2F7] transition-colors text-left"
        >
          <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
            <Upload size={22} className="text-blue-600" />
          </div>
          <div className="flex flex-col">
            <span className="text-[#181C1E] text-sm font-bold">导入数据</span>
            <span className="text-[#717783] text-xs mt-0.5">从 JSON 备份文件恢复数据</span>
          </div>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onImport(file);
            e.target.value = '';
          }}
        />

        <div className="bg-amber-50 rounded-xl p-3 flex gap-2">
          <AlertTriangle size={16} className="text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-700 leading-relaxed">
            <p className="font-semibold mb-1">注意事项</p>
            <p>• 导入会覆盖当前所有数据</p>
            <p>• 建议导入前先备份当前数据</p>
            <p>• 仅支持本应用导出的 JSON 文件</p>
          </div>
        </div>
      </div>
    </div>
  );
}

/** 提醒设置面板 */
function ReminderPanel({ onClose }: { onClose: () => void }) {
  const REMINDER_KEY = 'bookkeeping_reminders';

  const loadReminders = () => {
    try {
      const raw = localStorage.getItem(REMINDER_KEY);
      if (raw) return JSON.parse(raw);
    } catch { /* ignore */ }
    return { dailyReminder: true, reminderTime: '21:00', budgetAlert: true, budgetAlertPercent: 80 };
  };

  const [settings, setSettings] = useState(loadReminders);

  const saveReminders = (newSettings: typeof settings) => {
    setSettings(newSettings);
    localStorage.setItem(REMINDER_KEY, JSON.stringify(newSettings));
  };

  const timeOptions = ['08:00', '12:00', '18:00', '20:00', '21:00', '22:00'];
  const percentOptions = [50, 60, 70, 80, 90];

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="提醒设置" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center">
                {settings.dailyReminder ? <BellRing size={18} className="text-amber-600" /> : <BellOff size={18} className="text-gray-400" />}
              </div>
              <div>
                <p className="text-[#181C1E] text-sm font-semibold">每日记账提醒</p>
                <p className="text-[#717783] text-xs">定时提醒你记录今日开支</p>
              </div>
            </div>
            <ToggleSwitch
              value={settings.dailyReminder}
              onChange={(v) => saveReminders({ ...settings, dailyReminder: v })}
            />
          </div>

          {settings.dailyReminder && (
            <div className="px-4 pb-4 pt-1">
              <label className="text-[#717783] text-xs mb-2 block">提醒时间</label>
              <div className="flex flex-wrap gap-2">
                {timeOptions.map((t) => (
                  <button
                    key={t}
                    onClick={() => saveReminders({ ...settings, reminderTime: t })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      settings.reminderTime === t
                        ? 'text-white'
                        : 'bg-[#F1F4F6] text-[#181C1E] hover:bg-[#E2E8F0]'
                    )}
                    style={settings.reminderTime === t ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                  >
                    <Clock size={12} className="inline mr-1" />
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-50 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className={settings.budgetAlert ? 'text-red-500' : 'text-gray-400'} />
              </div>
              <div>
                <p className="text-[#181C1E] text-sm font-semibold">预算预警</p>
                <p className="text-[#717783] text-xs">支出达到预算一定比例时提醒</p>
              </div>
            </div>
            <ToggleSwitch
              value={settings.budgetAlert}
              onChange={(v) => saveReminders({ ...settings, budgetAlert: v })}
            />
          </div>

          {settings.budgetAlert && (
            <div className="px-4 pb-4 pt-1">
              <label className="text-[#717783] text-xs mb-2 block">预警阈值</label>
              <div className="flex flex-wrap gap-2">
                {percentOptions.map((p) => (
                  <button
                    key={p}
                    onClick={() => saveReminders({ ...settings, budgetAlertPercent: p })}
                    className={cn(
                      'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                      settings.budgetAlertPercent === p
                        ? 'bg-red-500 text-white'
                        : 'bg-[#F1F4F6] text-[#181C1E] hover:bg-[#E2E8F0]'
                    )}
                  >
                    {p}%
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="rounded-xl p-3 flex gap-2" style={{ backgroundColor: 'var(--theme-primary-bg)' }}>
          <Info size={16} className="shrink-0 mt-0.5" style={{ color: 'var(--theme-primary)' }} />
          <p className="text-xs leading-relaxed" style={{ color: 'var(--theme-primary)' }}>
            提醒设置已保存到本地。由于浏览器限制，提醒功能需要保持页面打开才能生效。
          </p>
        </div>
      </div>
    </div>
  );
}

/** 主题设置面板 - 通过 store 全局生效 */
function ThemePanel({
  currentTheme,
  onSave,
  onClose,
}: {
  currentTheme: { colorScheme: string; fontSize: string };
  onSave: (colorScheme: string, fontSize: string) => void;
  onClose: () => void;
}) {
  const [colorScheme, setColorScheme] = useState(currentTheme.colorScheme);
  const [fontSize, setFontSize] = useState(currentTheme.fontSize);

  const colorSchemes = [
    { id: 'blue', label: '经典蓝', color: '#005DA7' },
    { id: 'emerald', label: '翡翠绿', color: '#059669' },
    { id: 'violet', label: '典雅紫', color: '#7C3AED' },
    { id: 'rose', label: '玫瑰红', color: '#E11D48' },
    { id: 'amber', label: '活力橙', color: '#D97706' },
    { id: 'slate', label: '低调灰', color: '#475569' },
  ];

  const fontSizes = [
    { id: 'small', label: '小', sample: 'text-xs' },
    { id: 'medium', label: '标准', sample: 'text-sm' },
    { id: 'large', label: '大', sample: 'text-base' },
  ];

  const previewColor = THEME_COLORS[colorScheme]?.primary ?? '#005DA7';

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="主题设置" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6">
        <div>
          <label className="text-[#181C1E] text-sm font-semibold mb-3 block">主题颜色</label>
          <div className="grid grid-cols-3 gap-3">
            {colorSchemes.map((c) => (
              <button
                key={c.id}
                onClick={() => setColorScheme(c.id)}
                className={cn(
                  'flex flex-col items-center gap-2 py-3 rounded-xl border-2 transition-all',
                  colorScheme === c.id
                    ? 'bg-opacity-10'
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E0]'
                )}
                style={colorScheme === c.id ? { borderColor: c.color, backgroundColor: `${c.color}10` } : undefined}
              >
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: c.color }}
                >
                  {colorScheme === c.id && <Check size={14} className="text-white" />}
                </div>
                <span className="text-xs font-semibold text-[#181C1E]">{c.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-[#181C1E] text-sm font-semibold mb-3 block">字体大小</label>
          <div className="flex gap-3">
            {fontSizes.map((f) => (
              <button
                key={f.id}
                onClick={() => setFontSize(f.id)}
                className={cn(
                  'flex-1 py-3 rounded-xl border-2 text-center transition-all',
                  fontSize === f.id
                    ? ''
                    : 'border-[#E2E8F0] bg-white hover:border-[#CBD5E0]'
                )}
                style={fontSize === f.id ? { borderColor: previewColor, backgroundColor: `${previewColor}10` } : undefined}
              >
                <span className={cn('font-semibold text-[#181C1E]', f.sample)}>{f.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 预览 */}
        <div>
          <label className="text-[#181C1E] text-sm font-semibold mb-3 block">预览效果</label>
          <div
            className="rounded-2xl p-4 text-white"
            style={{ backgroundColor: previewColor }}
          >
            <p className={cn('font-bold mb-1', fontSize === 'small' ? 'text-sm' : fontSize === 'large' ? 'text-lg' : 'text-base')}>
              本月结余 ¥22,655
            </p>
            <p className={cn('opacity-70', fontSize === 'small' ? 'text-xs' : fontSize === 'large' ? 'text-sm' : 'text-xs')}>
              收入 ¥23,500 · 支出 ¥845
            </p>
          </div>
        </div>
      </div>

      {/* 应用按钮 */}
      <div className="p-5 pt-2">
        <button
          onClick={() => onSave(colorScheme, fontSize)}
          className="w-full py-3.5 rounded-xl font-bold text-sm text-white transition-all active:opacity-80"
          style={{ backgroundColor: previewColor }}
        >
          应用主题
        </button>
      </div>
    </div>
  );
}

/** 帮助与反馈面板 */
function HelpPanel({ onClose }: { onClose: () => void }) {
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSent, setFeedbackSent] = useState(false);

  const faqs = [
    { q: '如何添加一笔交易？', a: '点击右下角蓝色"+"按钮，选择支出或收入类型，输入金额、选择分类后保存即可。' },
    { q: '如何修改预算？', a: '进入"我的" → "预算管理"，输入或选择快捷金额后点击保存。' },
    { q: '如何备份数据？', a: '进入"我的" → "数据备份与恢复"，点击"导出数据"即可下载 JSON 备份文件。' },
    { q: '如何查看消费报表？', a: '点击底部导航"报表"，可查看饼图分类占比、月度趋势及分类明细。' },
    { q: '数据存储在哪里？', a: '所有数据保存在浏览器的 localStorage 中。清除浏览器数据会导致记录丢失，建议定期备份。' },
  ];

  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const handleSendFeedback = () => {
    if (!feedbackText.trim()) return;
    const feedbacks = JSON.parse(localStorage.getItem('bookkeeping_feedbacks') || '[]');
    feedbacks.push({ text: feedbackText, date: new Date().toISOString() });
    localStorage.setItem('bookkeeping_feedbacks', JSON.stringify(feedbacks));
    setFeedbackSent(true);
    setFeedbackText('');
    setTimeout(() => setFeedbackSent(false), 3000);
  };

  return (
    <div className="flex flex-col h-full">
      <PanelHeader title="帮助与反馈" onClose={onClose} />
      <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-5">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <BookOpen size={16} style={{ color: 'var(--theme-primary)' }} />
            <h3 className="text-[#181C1E] text-sm font-semibold">常见问题</h3>
          </div>
          <div className="flex flex-col gap-2">
            {faqs.map((faq, i) => (
              <div key={i} className="bg-white rounded-xl border border-[#E2E8F0] overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-[#F7FAFC] transition-colors"
                >
                  <span className="text-[#181C1E] text-sm font-medium pr-2">{faq.q}</span>
                  <ChevronRight
                    size={16}
                    className={cn('text-[#A0AEC0] shrink-0 transition-transform duration-200', expandedFaq === i && 'rotate-90')}
                  />
                </button>
                {expandedFaq === i && (
                  <div className="px-4 pb-3">
                    <p className="text-[#717783] text-xs leading-relaxed">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 mb-3">
            <MessageSquare size={16} style={{ color: 'var(--theme-primary)' }} />
            <h3 className="text-[#181C1E] text-sm font-semibold">意见反馈</h3>
          </div>
          {feedbackSent ? (
            <div className="bg-emerald-50 rounded-xl p-4 flex items-center gap-3">
              <Check size={20} className="text-emerald-600" />
              <div>
                <p className="text-emerald-700 text-sm font-semibold">感谢你的反馈！</p>
                <p className="text-emerald-600 text-xs">我们会认真阅读并持续改进</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              <textarea
                value={feedbackText}
                onChange={(e) => setFeedbackText(e.target.value)}
                placeholder="说说你的建议或遇到的问题..."
                className="w-full h-24 bg-[#F7FAFC] border border-[#E2E8F0] rounded-xl p-3 text-sm text-[#181C1E] placeholder-[#A0AEC0] outline-none resize-none transition-colors"
                style={{ borderColor: feedbackText ? 'var(--theme-primary)' : undefined }}
                maxLength={500}
              />
              <div className="flex items-center justify-between">
                <span className="text-[#A0AEC0] text-xs">{feedbackText.length}/500</span>
                <button
                  onClick={handleSendFeedback}
                  disabled={!feedbackText.trim()}
                  className={cn(
                    'px-5 py-2 rounded-xl text-sm font-semibold transition-all',
                    feedbackText.trim()
                      ? 'text-white active:opacity-80'
                      : 'bg-[#E2E8F0] text-[#A0AEC0] cursor-not-allowed'
                  )}
                  style={feedbackText.trim() ? { backgroundColor: 'var(--theme-primary)' } : undefined}
                >
                  提交反馈
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="bg-[#F7FAFC] rounded-xl p-4 text-center">
          <p className="text-[#181C1E] text-sm font-bold mb-1">记账本 v1.0.0</p>
          <p className="text-[#717783] text-xs">用心记录每一笔</p>
          <div className="flex items-center justify-center gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} size={14} className="text-amber-400 fill-amber-400" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== 公共小组件 ====================

function PanelHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="flex items-center gap-3 px-5 py-4 border-b border-[#F1F4F6] shrink-0">
      <button onClick={onClose} className="text-[#717783] hover:text-[#181C1E] p-1 -ml-1 transition-colors">
        <ChevronLeft size={22} />
      </button>
      <h2 className="text-[#181C1E] text-base font-bold">{title}</h2>
    </div>
  );
}

function ToggleSwitch({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!value)}
      className={cn(
        'w-12 h-7 rounded-full flex items-center px-1 transition-all duration-300 shrink-0',
        value ? 'justify-end' : 'bg-[#E2E8F0] justify-start'
      )}
      style={value ? { backgroundColor: 'var(--theme-primary)' } : undefined}
    >
      <div className="w-5 h-5 bg-white rounded-full shadow" />
    </button>
  );
}

// ==================== 主页面 ====================

export function Profile() {
  const {
    transactions, monthlyIncome, monthlyExpense, balance, budgetTotal,
    setBudgetTotal, clearAllData, importData, exportData, theme, setTheme, userProfile, setUserProfile,
  } = useApp();

  const [activeModal, setActiveModal] = useState<ModalView>('none');
  const [showToast, setShowToast] = useState('');

  // 统计
  const totalTransactions = transactions.length;
  const totalIncome = transactions.filter((tx) => tx.type === 'income').reduce((sum, tx) => sum + tx.amount, 0);
  const totalExpense = transactions.filter((tx) => tx.type === 'expense').reduce((sum, tx) => sum + tx.amount, 0);

  const daysUsed = (() => {
    if (transactions.length === 0) return 0;
    const dates = transactions.map((tx) => new Date(tx.date).getTime());
    const earliest = Math.min(...dates);
    return Math.max(1, Math.ceil((Date.now() - earliest) / (1000 * 60 * 60 * 24)));
  })();

  const handleToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(''), 2500);
  };

  // ---- 功能处理 ----
  const handleBudgetSave = (amount: number) => {
    setBudgetTotal(amount);
    setActiveModal('none');
    handleToast(`预算已设为 ¥${amount.toLocaleString()}`);
  };

  const handleExport = () => {
    const data = exportData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账本_备份_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleToast('数据已导出，请查看下载文件');
  };

  const handleExportCSV = () => {
    const headers = ['日期', '时间', '类型', '分类', '细分', '金额', '商户/来源', '备注'];
    const rows = transactions.map(tx => [
      tx.date,
      tx.time,
      tx.type === 'income' ? '收入' : '支出',
      catNames[tx.category] || tx.category,
      tx.subcategory || '',
      tx.amount.toFixed(2),
      tx.merchant || '',
      tx.note || '',
    ]);
    const csv = '\uFEFF' + [headers, ...rows].map(row =>
      row.map(cell => `"${cell}"`).join(',')
    ).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `记账本_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    handleToast('CSV 文件已导出');
  };

  const handleImport = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        if (data && Array.isArray(data.transactions)) {
          importData({
            transactions: data.transactions,
            budgetTotal: data.budgetTotal ?? 5000,
          });
          setActiveModal('none');
          handleToast(`成功导入 ${data.transactions.length} 条记录`);
        } else {
          handleToast('文件格式不正确，请选择有效的备份文件');
        }
      } catch {
        handleToast('文件解析失败，请确认文件格式');
      }
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    clearAllData();
    setActiveModal('none');
    handleToast('所有数据已清除');
  };

  const handleThemeSave = (colorScheme: string, fontSize: string) => {
    setTheme({ colorScheme, fontSize });
    setActiveModal('none');
    handleToast('主题已应用到所有页面');
  };

  const handleProfileSave = (nickname: string, avatarEmoji: string) => {
    setUserProfile({ nickname, avatarEmoji });
    setActiveModal('none');
    handleToast('个人资料已更新');
  };

  // ---- 菜单列表 ----
  const menuItems = [
    {
      icon: Target,
      label: '预算管理',
      desc: `当前月预算 ¥${budgetTotal.toLocaleString()}`,
      color: 'bg-blue-50 text-blue-600',
      modal: 'budget' as ModalView,
    },
    {
      icon: Shield,
      label: '数据备份与恢复',
      desc: `共 ${totalTransactions} 条记录`,
      color: 'bg-emerald-50 text-emerald-600',
      modal: 'backup' as ModalView,
    },
    {
      icon: Bell,
      label: '提醒设置',
      desc: '记账提醒、预算预警',
      color: 'bg-amber-50 text-amber-600',
      modal: 'reminder' as ModalView,
    },
    {
      icon: Palette,
      label: '主题设置',
      desc: '个性化显示',
      color: 'bg-purple-50 text-purple-600',
      modal: 'theme' as ModalView,
    },
    {
      icon: CircleHelp,
      label: '帮助与反馈',
      desc: '使用指南、意见反馈',
      color: 'bg-sky-50 text-sky-600',
      modal: 'help' as ModalView,
    },
  ];

  // ---- 子面板渲染 ----
  const renderModal = () => {
    if (activeModal === 'none') return null;

    return (
      <div
        className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
        onClick={() => setActiveModal('none')}
        style={{ overscrollBehavior: 'contain' }}
        onTouchMove={(e) => e.preventDefault()}
      >
        <div
          className="bg-[#F7FAFC] w-full max-w-md rounded-t-3xl max-h-[85vh] flex flex-col animate-slide-up"
          onClick={(e) => e.stopPropagation()}
          onTouchMove={(e) => e.stopPropagation()}
        >
          {activeModal === 'profile' && (
            <ProfileEditPanel
              nickname={userProfile.nickname}
              avatarEmoji={userProfile.avatarEmoji}
              onSave={handleProfileSave}
              onClose={() => setActiveModal('none')}
            />
          )}
          {activeModal === 'budget' && (
            <BudgetPanel
              budgetTotal={budgetTotal}
              monthlyExpense={monthlyExpense}
              onSave={handleBudgetSave}
              onClose={() => setActiveModal('none')}
            />
          )}
          {activeModal === 'backup' && (
            <BackupPanel
              onExport={handleExport}
              onExportCSV={handleExportCSV}
              onImport={handleImport}
              onClose={() => setActiveModal('none')}
              transactionCount={totalTransactions}
            />
          )}
          {activeModal === 'reminder' && (
            <ReminderPanel onClose={() => setActiveModal('none')} />
          )}
          {activeModal === 'theme' && (
            <ThemePanel
              currentTheme={theme}
              onSave={handleThemeSave}
              onClose={() => setActiveModal('none')}
            />
          )}
          {activeModal === 'help' && (
            <HelpPanel onClose={() => setActiveModal('none')} />
          )}
          {activeModal === 'clearConfirm' && (
            <div className="p-6 flex flex-col gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                  <AlertTriangle size={24} className="text-red-500" />
                </div>
                <div>
                  <h3 className="text-[#181C1E] font-bold text-base">确认清除所有数据？</h3>
                  <p className="text-[#717783] text-xs">此操作不可撤销</p>
                </div>
              </div>
              <p className="text-[#717783] text-sm leading-relaxed">
                将清除所有 {totalTransactions} 条交易记录、个人设置和主题配置，数据清除后不可恢复。建议先导出备份。
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setActiveModal('none')}
                  className="flex-1 py-3 bg-[#F1F4F6] text-[#181C1E] rounded-xl font-semibold text-sm hover:bg-[#E2E8F0] transition-colors"
                >
                  取消
                </button>
                <button
                  onClick={handleClearData}
                  className="flex-1 py-3 bg-[#AA2E33] text-white rounded-xl font-semibold text-sm hover:bg-[#8B2529] transition-colors"
                >
                  确认清除
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // ---- 主渲染 ----
  return (
    <div className="flex flex-col gap-5 p-4 pb-32 bg-[#F7FAFC] min-h-full">
      {/* Toast */}
      {showToast && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[60] bg-[#181C1E] text-white text-sm px-5 py-2.5 rounded-xl shadow-lg animate-fade-in">
          {showToast}
        </div>
      )}

      {/* Profile Header Card - 使用主题色 */}
      <div
        className="rounded-2xl p-5 text-white shadow-lg"
        style={{ background: `linear-gradient(135deg, var(--theme-primary), var(--theme-primary-light))` }}
      >
        <div className="flex items-center gap-4 mb-5">
          {/* 点击头像进入个人资料编辑 */}
          <button
            onClick={() => setActiveModal('profile')}
            className="relative w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center ring-2 ring-white/30 active:scale-95 transition-transform"
          >
            <span className="text-3xl">{userProfile.avatarEmoji}</span>
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow">
              <Pencil size={10} style={{ color: 'var(--theme-primary)' }} />
            </div>
          </button>
          <div className="flex flex-col">
            <h2 className="text-lg font-bold">{userProfile.nickname}</h2>
            <p className="text-white/70 text-sm">
              已记录 {totalTransactions} 笔交易 · 使用 {daysUsed} 天
            </p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Wallet size={14} className="text-white/70" />
              <span className="text-white/70 text-xs">本月结余</span>
            </div>
            <p className={cn('text-base font-bold', balance >= 0 ? 'text-white' : 'text-red-300')}>
              ¥{Math.abs(balance).toLocaleString()}
            </p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp size={14} className="text-emerald-300" />
              <span className="text-white/70 text-xs">本月收入</span>
            </div>
            <p className="text-base font-bold text-emerald-300">¥{monthlyIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingDown size={14} className="text-red-300" />
              <span className="text-white/70 text-xs">本月支出</span>
            </div>
            <p className="text-base font-bold text-red-300">¥{monthlyExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* 累计统计 */}
      <div className="bg-white rounded-2xl p-4 shadow-sm">
        <h3 className="text-[#181C1E] text-sm font-semibold mb-3">累计统计</h3>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-[#F0FDF4] rounded-xl p-3">
            <p className="text-[#717783] text-xs mb-1">累计收入</p>
            <p className="text-[#16A34A] text-lg font-bold">¥{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-[#FEF2F2] rounded-xl p-3">
            <p className="text-[#717783] text-xs mb-1">累计支出</p>
            <p className="text-[#DC2626] text-lg font-bold">¥{totalExpense.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="flex flex-col bg-white rounded-2xl shadow-sm overflow-hidden">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              onClick={() => setActiveModal(item.modal)}
              className={cn(
                'flex items-center justify-between px-4 py-3.5 hover:bg-[#F7FAFC] active:bg-[#EDF2F7] transition-colors text-left',
                idx < menuItems.length - 1 ? 'border-b border-[#F1F4F6]' : ''
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', item.color)}>
                  <Icon size={18} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[#181C1E] text-sm font-semibold">{item.label}</span>
                  <span className="text-[#717783] text-xs">{item.desc}</span>
                </div>
              </div>
              <ChevronRight size={16} className="text-[#A0AEC0]" />
            </button>
          );
        })}
      </div>

      {/* 清除数据 */}
      <button
        onClick={() => setActiveModal('clearConfirm')}
        className="flex items-center justify-center gap-2 py-3.5 bg-white rounded-2xl shadow-sm text-[#AA2E33] font-semibold text-sm hover:bg-red-50 active:bg-red-100 transition-colors"
      >
        <Trash2 size={16} />
        清除所有数据
      </button>

      {/* App Info */}
      <div className="flex flex-col items-center gap-1 py-4">
        <p className="text-[#A0AEC0] text-xs">记账本 v1.0.0</p>
        <p className="text-[#CBD5E0] text-xs">用心记录每一笔</p>
      </div>

      {/* Modal */}
      {renderModal()}
    </div>
  );
}
