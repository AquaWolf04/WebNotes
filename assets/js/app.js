$(document).ready(() => {
    const TOKEN_REFRESH_THRESHOLD = 60 // 1 perccel a lejárat előtt frissít
    const CHECK_INTERVAL = 30000 // 30 másodpercenként ellenőrizzük

    const getToken = () => localStorage.getItem('accessToken')
    const getRefreshToken = () => localStorage.getItem('refreshToken')

    const decodeToken = (token) => {
        try {
            return JSON.parse(atob(token.split('.')[1])) // Base64 dekódolás
        } catch (e) {
            console.warn('🔴 Hibás token dekódolás:', e)
            return null
        }
    }

    const fetchProfile = async () => {
        try {
            const response = await $.ajax({
                type: 'GET',
                url: '/profile',
                headers: { Authorization: `Bearer ${getToken()}` },
            })

            if (response.success) {
                console.log('🟢 Profil betöltve:', response.user)
                updateUserUI(response.user)
            } else {
                console.warn('🔴 Profil betöltése sikertelen!')
            }
        } catch (error) {
            console.warn('🔴 Profil betöltése sikertelen!', error)
        }
    }

    const updateUserUI = (user) => {
        if (!user) return

        document.getElementById('user-avatar').textContent = user.username.charAt(0).toUpperCase()
        document.getElementById('user-name').textContent = user.name || user.username
        document.getElementById('user-email').textContent = user.email

        const roleIcon = document.getElementById('user-role-icon')
        if (user.role === 'admin') {
            roleIcon.className = 'ti ti-crown'
        } else if (user.role === 'premium') {
            roleIcon.className = 'ti ti-star'
        } else {
            roleIcon.className = '' // Alapértelmezett, ha nincs speciális rang
        }
    }

    const checkTokenExpiration = () => {
        const token = getToken()
        if (!token) return redirectToLogin()

        const decoded = decodeToken(token)
        if (!decoded || !decoded.exp) return redirectToLogin()

        const timeLeft = decoded.exp - Math.floor(Date.now() / 1000)
        console.log(`🕒 Token lejár: ${timeLeft} másodperc múlva`)

        if (timeLeft < TOKEN_REFRESH_THRESHOLD) refreshAccessToken()
    }

    const refreshAccessToken = async () => {
        const refreshToken = getRefreshToken()
        if (!refreshToken) return redirectToLogin()

        try {
            const response = await $.ajax({
                type: 'POST',
                url: '/refresh',
                contentType: 'application/json',
                data: JSON.stringify({ refreshToken }),
            })

            if (response.success) {
                localStorage.setItem('accessToken', response.accessToken)
                console.log('🔄 Token frissítve! Új lejárati idő: 15 perc')
            } else {
                console.warn('🔴 Token frissítés sikertelen!')
                redirectToLogin()
            }
        } catch (error) {
            console.warn('🔴 Token frissítés sikertelen!', error)
            redirectToLogin()
        }
    }

    const redirectToLogin = () => {
        localStorage.removeItem('accessToken')
        localStorage.removeItem('refreshToken')
        Swal.fire({
            icon: 'error',
            title: 'A munkamenet lejárt!',
            text: 'Kérlek, jelentkezz be újra.',
        }).then(() => (window.location.href = '/login'))
    }

    const setupTokenRefresh = () => {
        checkTokenExpiration()
        setInterval(checkTokenExpiration, CHECK_INTERVAL)
    }

    // ✅ Indítás
    setupTokenRefresh()
    fetchProfile()
})
