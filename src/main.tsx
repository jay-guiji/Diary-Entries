import React from 'react';
import ReactDOM from 'react-dom/client';
import { RouterProvider } from 'react-router';
import { AppProvider } from './app/store';
import { QuickAddModal } from './app/components/QuickAdd';
import { router } from './app/routes';
import './styles/index.css';

// Capacitor 插件初始化 + SplashScreen 控制
async function initCapacitor() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { StatusBar, Style } = await import('@capacitor/status-bar');
      await StatusBar.setStyle({ style: Style.Light });
      // iOS 状态栏覆盖内容，通过 CSS safe-area 适配
      await StatusBar.setOverlaysWebView({ overlay: true });
    }
  } catch {
    // 在浏览器中运行时忽略
  }
}

// App 渲染完成后隐藏 SplashScreen
async function hideSplashScreen() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (Capacitor.isNativePlatform()) {
      const { SplashScreen } = await import('@capacitor/splash-screen');
      await SplashScreen.hide({ fadeOutDuration: 300 });
    }
  } catch {
    // 在浏览器中运行时忽略
  }
}

initCapacitor();

function App() {
  // 首次渲染完成后隐藏启动画面
  React.useEffect(() => {
    hideSplashScreen();
  }, []);

  return (
    <AppProvider>
      <RouterProvider router={router} />
      <QuickAddModal />
    </AppProvider>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
