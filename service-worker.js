// 캐시 이름
const CACHE_NAME = 'absence-form-cache-v1';

// 캐싱할 파일 목록
const urlsToCache = [
  './',
  './index.html',
  './styles.css',
  './app.js',
  './form.js',
  './signature.js',
  './renderer.js',
  './storage.js',
  './form.png',
  './manifest.json',
  './icons/icon-192x192.png',
  './icons/icon-512x512.png'
];

// 서비스 워커 설치 시
self.addEventListener('install', event => {
  // 캐시 설치
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('캐시 열기 성공');
        return cache.addAll(urlsToCache);
      })
  );
});

// 네트워크 요청 감지
self.addEventListener('fetch', event => {
  event.respondWith(
    // 캐시에서 요청과 일치하는 것을 찾음
    caches.match(event.request)
      .then(response => {
        // 캐시에서 찾았으면 반환
        if (response) {
          return response;
        }
        
        // 캐시에 없으므로 네트워크로 요청
        return fetch(event.request)
          .then(response => {
            // 요청이 유효하지 않으면 그냥 반환
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // 응답을 복제하여 캐시에 저장
            const responseToCache = response.clone();
            
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });
            
            return response;
          });
      })
      .catch(error => {
        // 오프라인 상태일 때 폴백 페이지 반환 가능
        console.log('서비스 워커 fetch 오류:', error);
      })
  );
});

// 서비스 워커 활성화 시 이전 캐시 삭제
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheWhitelist.indexOf(cacheName) === -1) {
            // 오래된 캐시 삭제
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
