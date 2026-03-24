import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router';
import { Home, BarChart2, Receipt, User, Plus } from 'lucide-react';
import { useApp } from '../store';
import { cn } from '../utils/cn';

export function Layout() {
  const { setQuickAddOpen } = useApp();
  const location = useLocation();

  const getTitle = () => {
    if (location.pathname === '/reports') return '统计报表';
    if (location.pathname === '/transactions') return '交易记录';
    if (location.pathname === '/profile') return '个人中心';
    return '记账本';
  };

  return (
    <div className="flex flex-col h-screen bg-[#F7FAFC] overflow-hidden w-full max-w-md mx-auto relative shadow-2xl">
      {/* Top App Bar */}
      <div
        className="flex items-center justify-center px-6 py-4 bg-[#FAFAFA] shrink-0 z-10 border-b border-[#F5F5F5]"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <h1 className="text-xl font-bold tracking-tight" style={{ color: 'var(--theme-primary)' }}>{getTitle()}</h1>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <Outlet />
        {/* Padding for bottom nav */}
        <div className="h-[120px]" />
      </div>

      {/* Floating Action Button */}
      <div className="absolute bottom-[100px] right-6 z-20" style={{ marginBottom: 'env(safe-area-inset-bottom)' }}>
        <button
          onClick={() => setQuickAddOpen(true)}
          className="flex items-center justify-center w-16 h-16 text-white rounded-2xl shadow-lg hover:opacity-90 active:scale-95 transition-all"
          style={{ backgroundColor: 'var(--theme-primary)', boxShadow: '0px 12px 32px 0px rgba(0,0,0,0.15)' }}
          aria-label="新增记账"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>

      {/* Bottom Navigation */}
      <div
        className="absolute bottom-4 left-4 right-4 h-16 bg-white rounded-[28px] shadow-[0px_12px_32px_0px_rgba(24,28,30,0.06)] z-10 flex items-center justify-between px-2"
        style={{ marginBottom: 'env(safe-area-inset-bottom)' }}
      >
        <NavItem to="/" icon={<Home size={20} />} label="首页" />
        <NavItem to="/reports" icon={<BarChart2 size={20} />} label="报表" />
        <NavItem to="/transactions" icon={<Receipt size={20} />} label="流水" />
        <NavItem to="/profile" icon={<User size={20} />} label="我的" />
      </div>
    </div>
  );
}

function NavItem({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center justify-center h-10 px-4 rounded-2xl transition-all duration-300 relative",
          isActive ? "text-white" : "text-[#64748B] hover:text-[#005DA7]"
        )
      }
      style={({ isActive }) => isActive ? { backgroundColor: 'var(--theme-primary)' } : undefined}
    >
      {({ isActive }) => (
        <div className="flex items-center gap-2">
          {icon}
          {isActive && (
            <span className="text-[11px] font-semibold tracking-wider">
              {label}
            </span>
          )}
        </div>
      )}
    </NavLink>
  );
}
