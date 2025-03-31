const CACHE_NAME = 'webnotes-cache-v1'
const STATIC_ASSETS = [
    '/css/auth.css',
    '/css/custom.css',
    '/css/tabler-icons-outline.min.css',
    '/css/tabler.min.css',
    '/js/account.js',
    '/js/app.js',
    '/js/share.js',
    '/js/theme.js',
    '/js/webnotes.js',
    '/js/tabler.min.js',
    '/js/editor/hugerte.min.js',
]

// Telepítéskor: cache statikus fájlokat
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS)
        })
    )
})

// Aktiválás: régi cache-ek törlése (ha frissítés volt)
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) =>
            Promise.all(
                keys.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key)
                    }
                })
            )
        )
    )
})

// Fetch: statikus fájlokat cache-ből, minden mást csak hálózatról
self.addEventListener('fetch', (event) => {
    const request = event.request

    // Csak GET kérésekre reagálunk
    if (request.method !== 'GET') return

    // Statikus fájl? → próbáljuk cache-ből
    if (STATIC_ASSETS.some((path) => request.url.includes(path))) {
        event.respondWith(
            caches.match(request).then((cachedResponse) => {
                return cachedResponse || fetch(request)
            })
        )
    } else {
        // Egyéb (pl. API): csak hálózat
        event.respondWith(
            fetch(request).catch(() => {
                return new Response('Hálózati hiba. Kérlek csatlakozz az internethez.', {
                    status: 503,
                    headers: { 'Content-Type': 'text/plain' },
                })
            })
        )
    }
})
