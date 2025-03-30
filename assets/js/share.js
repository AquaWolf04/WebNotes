function shareModal(noteID) {
    Toast.fire({
        icon: 'info',
        text: 'A megosztás funkció még fejlesztés alatt áll, kérjük, hogy ne használja!',
    })

    /*
    const modalEl = document.getElementById('shareModal')
    const modal = new bootstrap.Modal(modalEl)
    const expiryType = document.getElementById('expiryType')
    const timeOptions = document.getElementById('timeOptions')
    const viewsOptions = document.getElementById('viewsOptions')
    const passwordOptions = document.getElementById('passwordOptions')
    const shareLink = document.getElementById('shareLink')
    const copyLinkBtn = document.getElementById('copyLinkBtn')

    // reset mezők
    expiryType.value = 'none'
    timeOptions.classList.add('d-none')
    viewsOptions.classList.add('d-none')
    passwordOptions.classList.add('d-none')

    // 🔄 Link generálás vagy visszatöltés
    $.ajax({
        url: `/notes/share/${noteID}/init`,
        method: 'POST',
        headers: {
            'X-CSRF-Token': $('meta[name="csrf-token"]').attr('content'),
        },
        success: (res) => {
            shareLink.value = `https://webnotes.hu/shared/${res.token}`
        },
        error: () => {
            shareLink.value = 'Hiba a link betöltésekor'
        },
    })

    // 🔐 PRO státusz lekérés
    $.ajax({
        url: '/api/me',
        method: 'GET',
        success: (response) => {
            const isPro = response.user?.isPro === true

            // Opciók frissítése PRO alapján
            for (const option of expiryType.options) {
                const value = option.value
                const isProOnly = ['time', 'views', 'password'].includes(value)

                if (isProOnly) {
                    option.disabled = !isPro
                    if (!isPro && !option.text.includes(' – csak PRO')) {
                        option.text += ' – csak PRO'
                    }
                }
            }

            // Dropdown változás figyelés
            expiryType.addEventListener('change', () => {
                const selected = expiryType.value
                const isProOnly = ['time', 'views', 'password'].includes(
                    selected
                )

                if (!isPro && isProOnly) {
                    Swal.fire({
                        icon: 'info',
                        title: 'Pro funkciók',
                        text: 'A megosztás időkorlátja, megtekintési szám és jelszó beállítása csak Pro felhasználóknak érhető el. Frissíts Pro-ra a további lehetőségekhez!',
                        showCancelButton: true,
                        confirmButtonText: 'Frissítés Pro-ra',
                        cancelButtonText: 'Mégsem',
                    }).then((result) => {
                        if (result.isConfirmed) {
                            upgradeToPro()
                        } else {
                            expiryType.value = 'none'
                            hideAllOptions()
                        }
                    })
                    return
                }

                timeOptions.classList.toggle('d-none', selected !== 'time')
                viewsOptions.classList.toggle('d-none', selected !== 'views')
                passwordOptions.classList.toggle(
                    'd-none',
                    selected !== 'password'
                )
            })
        },
        error: (xhr, status, error) => {
            console.error('Hiba a /api/me hívásnál:', error)
        },
    })

    // 📋 Másolás gomb
    copyLinkBtn.addEventListener('click', () => {
        navigator.clipboard.writeText(shareLink.value).then(() => {
            alert('Link vágólapra másolva!')
        })
    })

    // 🧹 Segédfüggvény a mezők elrejtéséhez
    function hideAllOptions() {
        timeOptions.classList.add('d-none')
        viewsOptions.classList.add('d-none')
        passwordOptions.classList.add('d-none')
    }

    // 💬 Modal megnyitása
    modal.show()
    */
}
