const refreshBtn = document.getElementById('refreshBtn')
const refreshIcon = document.getElementById('refreshIcon')

function isPWA() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
}

function refreshNotes() {
    // Állapot: töltés
    refreshBtn.disabled = true
    refreshBtn.classList.add('opacity-75') // ha szeretnél halványítást
    refreshIcon.classList.remove('ti-reload')
    refreshIcon.classList.add('ti-loader-2', 'spin')

    // Simulált frissítés – pl. API hívás
    setTimeout(() => {
        location.reload()
    }, 1000)
}

// Megjelenítés csak PWA-ban
if (isPWA()) {
    refreshBtn.style.display = 'inline-flex'
    refreshBtn.disabled = false
}
