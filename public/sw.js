// Service Worker — 智能缓存策略 (v3)
// 优化：预缓存核心资源 + Navigation Preload + 更快的首屏响应
const CACHE_VERSION = 'v3';
const STATIC_CACHE = `bookkeeping-static-${CACHE_VERSION}`;
const HTML_CACHE = `bookkeeping-html-${CACHE_VERSION}`;

// 静态资源匹配：JS、CSS、字体、图片
function isStaticAsset(url) {
  return /\.(js|css|woff2?|ttf|eot|png|jpe?g|gif|svg|ico|webp)(\?.*)?$/.test(url);
}

// 安装时预缓存核心页面
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(HTML_CACHE).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
      ]);
    })
  );
  // 跳过等待，立即激活
  self.skipWaiting();
});

// 激活时清理旧缓存 + 启用 Navigation Preload
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      // 清理旧版本缓存
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => {
              return (name.startsWith('bookkeeping-') &&
                      name !== STATIC_CACHE &&
                      name !== HTML_CACHE);
            })
            .map((name) => caches.delete(name))
        );
      }),
      // 启用 Navigation Preload（加速页面导航）
      self.registration.navigationPreload
        ? self.registration.navigationPreload.enable()
        : Promise.resolve(),
    ])
  );
  self.clients.claim();
});

// 请求拦截 — 分策略处理
self.addEventListener('fetch', (event) => {
  // 只处理 GET 请求
  if (event.request.method !== 'GET') return;

  // 跳过非同源请求和浏览器扩展请求
  if (!event.request.url.startsWith(self.location.origin)) return;

  const url = new URL(event.request.url);

  // 策略一：静态资源 — Cache First（带哈希的文件名天然支持缓存失效）
  if (isStaticAsset(url.pathname)) {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        if (cached) return cached;
        return fetch(event.request).then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(STATIC_CACHE).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return response;
        }).catch(() => {
          return new Response('', { status: 503, statusText: 'Offline' });
        });
      })
    );
    return;
  }

  // 策略二：导航请求 — Cache First + 后台更新
  // 优化：优先用缓存（秒开），同时后台获取最新版本供下次使用
  if (event.request.mode === 'navigate' || url.pathname.endsWith('.html') || url.pathname === '/') {
    event.respondWith(
      caches.match(event.request).then((cached) => {
        // 后台获取最新版本（不阻塞响应）
        const networkUpdate = (event.preloadResponse || fetch(event.request))
          .then((response) => {
            if (response && response.ok) {
              const clone = response.clone();
              caches.open(HTML_CACHE).then((cache) => {
                cache.put(event.request, clone);
              });
            }
            return response;
          })
          .catch(() => null);

        // 有缓存 → 立即返回缓存（秒开）
        if (cached) {
          return cached;
        }

        // 无缓存 → 等网络，2秒超时回退到离线页
        return Promise.race([
          networkUpdate,
          new Promise((resolve) => {
            setTimeout(() => {
              resolve(caches.match('/index.html').then(c => c || new Response(
                '<!DOCTYPE html><html><body style="display:flex;align-items:center;justify-content:center;height:100vh;font-family:sans-serif;color:#666"><p>加载中，请检查网络连接...</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              )));
            }, 2000);
          }),
        ]);
      })
    );
    return;
  }

  // 策略三：其他请求 — Stale While Revalidate
  event.respondWith(
    caches.match(event.request).then((cached) => {
      const fetchPromise = fetch(event.request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(STATIC_CACHE).then((cache) => {
            cache.put(event.request, clone);
          });
        }
        return response;
      }).catch(() => cached || new Response('', { status: 503 }));

      return cached || fetchPromise;
    })
  );
});
