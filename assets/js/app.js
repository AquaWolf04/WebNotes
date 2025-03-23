// Felhasználó adatok lekérése és megjelenítése a felhasználói felületen
$(document).ready(() => {
    $.ajax({
        url: '/api/me',
        type: 'GET',
        success: (response) => {
            if (response.user) {
                $('#user-avatar').text(response.user.username.charAt(0).toUpperCase())

                if (response.user.role !== 'admin') {
                    document.getElementById('dev').src = 'https://cdn.jsdelivr.net/npm/disable-devtool'
                }

                $('#username').text(response.user.username)
                $('#defusername').val(response.user.username)

                let roleIcon = ''
                switch (response.user.role) {
                    case 'admin':
                        roleIcon = '<i class="ti ti-shield-check text-danger"></i>'
                        break
                    case 'moderator':
                        roleIcon = '<i class="ti ti-user-check text-warning"></i>'
                        break
                    default:
                        roleIcon = '<i class="ti ti-user text-muted"></i>'
                }
                $('#user-role-icon').html(roleIcon)

                $('#email').text(response.user.email)
                $('#defemail').val(response.user.email)
            }
        },
        error: (xhr, status, error) => {
            console.error('Hiba történt:', error)
        },
    })
})

// SweetAlert2 Toast konfiguráció
const Toast = Swal.mixin({
    toast: true,
    position: 'top-end',
    showConfirmButton: false,
    timer: 3000,
    timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer
        toast.onmouseleave = Swal.resumeTimer
    },
})

// Pro funkciókhoz tartozó Toast
function upgradeToPro() {
    Toast.fire({
        icon: 'error',
        title: 'A funkció jelenleg nem elérhető!',
    })
}

// Alkalmazás verzió lekérése és megjelenítése a felhasználói felületen
$(document).ready(() => {
    $.ajax({
        url: '/api/version',
        type: 'GET',
        success: (response) => {
            $('#app-version').text(response.version)
        },
        error: (xhr, status, error) => {
            console.error('Hiba történt:', error)
        },
    })
})

document.addEventListener('DOMContentLoaded', function () {
    // Téma preferencia mentése
    const saveTheme = (theme) => {
        localStorage.setItem('theme', theme)
        document.body.setAttribute('data-bs-theme', theme)
    }

    // Témaváltó linkek kezelése
    document.querySelectorAll('[href^="?theme="]').forEach((link) => {
        link.addEventListener('click', (e) => {
            e.preventDefault()
            const theme = e.currentTarget.href.includes('dark') ? 'dark' : 'light'
            saveTheme(theme)
        })
    })

    // Mentett téma betöltése
    const savedTheme = localStorage.getItem('theme') || 'light'
    document.body.setAttribute('data-bs-theme', savedTheme)
})
