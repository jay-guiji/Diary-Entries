// Service Worker — KILL SWITCH (v5)
// 紧急修复：旧 SW 拦截主 JS 导致白屏。此版本主动卸载自己并清空所有缓存。
// 下次部署会是一个干净的新 SW。

self.addEventListener('install', (event) => {
  // 立即激活，不等待
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // 1. 清空所有缓存
      const keys = await caches.keys();
      await Promise.all(keys.map((k) => caches.delete(k)));

      // 2. 卸载自己
      await self.registration.unregister();

      // 3. 让所有控制的页面立即刷新（拿到无 SW 的原始版本）
      const clients = await self.clients.matchAll({ type: 'window' });
      clients.forEach((client) => {
        client.navigate(client.url);
      });
    })()
  );
});

// 不再拦截任何 fetch — 所有请求走网络
