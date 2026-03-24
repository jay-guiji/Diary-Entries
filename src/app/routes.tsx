import React, { lazy, Suspense } from 'react';
import { createHashRouter } from "react-router";
import { Layout } from "./components/Layout";
import { ErrorBoundary } from "./components/ErrorBoundary";

// 路由懒加载 — 首屏只加载 Home，其余按需加载
const Home = lazy(() => import("./pages/Home").then(m => ({ default: m.Home })));
const Transactions = lazy(() => import("./pages/Transactions").then(m => ({ default: m.Transactions })));
const Reports = lazy(() => import("./pages/Reports").then(m => ({ default: m.Reports })));
const Profile = lazy(() => import("./pages/Profile").then(m => ({ default: m.Profile })));

// 页面加载时的骨架屏
function PageSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-6 animate-pulse">
      <div className="h-8 w-32 bg-[#E2E8F0] rounded-lg" />
      <div className="h-40 bg-[#E2E8F0] rounded-2xl" />
      <div className="flex gap-3">
        <div className="h-24 flex-1 bg-[#E2E8F0] rounded-xl" />
        <div className="h-24 flex-1 bg-[#E2E8F0] rounded-xl" />
      </div>
      <div className="h-12 bg-[#E2E8F0] rounded-xl" />
      <div className="h-12 bg-[#E2E8F0] rounded-xl" />
      <div className="h-12 bg-[#E2E8F0] rounded-xl" />
    </div>
  );
}

// 用 Suspense 包裹懒加载组件
function LazyPage({ Component }: { Component: React.LazyExoticComponent<React.ComponentType> }) {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <Component />
    </Suspense>
  );
}

export const router = createHashRouter([
  {
    path: "/",
    Component: Layout,
    ErrorBoundary: ErrorBoundary,
    children: [
      { index: true, element: <LazyPage Component={Home} /> },
      { path: "transactions", element: <LazyPage Component={Transactions} /> },
      { path: "reports", element: <LazyPage Component={Reports} /> },
      { path: "profile", element: <LazyPage Component={Profile} /> },
      { path: "*", Component: NotFound },
    ],
  },
]);

function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-4 p-6 text-center">
      <span className="text-6xl">🔍</span>
      <h2 className="text-xl font-bold text-[#181C1E]">页面未找到</h2>
      <p className="text-[#717783] text-sm">您访问的页面不存在</p>
      <a href="#/" className="font-semibold text-sm hover:underline" style={{ color: 'var(--theme-primary)' }}>
        返回首页
      </a>
    </div>
  );
}
