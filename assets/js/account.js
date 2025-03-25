document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailChangeForm')
    const submitBtn = document.getElementById('changeEmailBtn') // Gomb lekérése

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('newEmail').value.trim()
        const password = document.getElementById('currentPasswordForChangeEmail').value

        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Hiba történt!',
                text: 'Az összes mező kitöltése kötelező!',
            })
            return
        }

        if (submitBtn) {
            submitBtn.disabled = true
            submitBtn.innerHTML = `<i class="ti ti-loader-2 spinner-rotate me-1"></i> Küldés...`
        }

        try {
            const res = await fetch('/account/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Ki küldtünk egy megerősítő e-mailt!',
                    showConfirmButton: false,
                    timer: 1500,
                })

                // Modál bezárása
                const modalEl = document.getElementById('modal-change-email')
                const modal = bootstrap.Modal.getInstance(modalEl)
                modal.hide()

                // Űrlap törlése (ha kell)
                form.reset()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hiba történt!',
                    text: data.message,
                })
            }
        } catch (err) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Hiba történt!',
                text: 'Kérlek próbáld újra később!',
            })
        } finally {
            // Gomb visszaállítása
            if (submitBtn) {
                submitBtn.disabled = false
                submitBtn.innerHTML = `<i class="ti ti-send me-1"></i> Küldés`
            }
        }
    })
})

function savePasswordChange() {
    console.log('clicked')

    const form = document.getElementById('passwordChangeForm')
    const submitBtn = document.getElementById('changePasswordBtn')

    const currentPassword = document.getElementById('currentPassword').value
    const newPassword = document.getElementById('newPassword').value
    const confirmPassword = document.getElementById('confirmPassword').value

    if (!currentPassword || !newPassword || !confirmPassword) {
        Swal.fire({
            icon: 'error',
            title: 'Hiba történt!',
            text: 'Az összes mező kitöltése kötelező!',
        })
        return
    }

    // Gomb disable + spinner
    if (submitBtn) {
        submitBtn.disabled = true
        submitBtn.innerHTML = `<i class="ti ti-loader-2 spinner-rotate"></i> Mentés...`
    }

    fetch('/account/change-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRF-Token': document.querySelector('meta[name="csrf-token"]').getAttribute('content'),
        },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
    })
        .then((res) => res.json())
        .then((data) => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Sikeres jelszóváltoztatás!',
                    showConfirmButton: false,
                    timer: 1500,
                })
                form.reset()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hiba történt!',
                    text: data.message,
                })
            }
        })
        .catch((err) => {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Hiba történt!',
                text: 'Kérlek próbáld újra később!',
            })
        })
        .finally(() => {
            if (submitBtn) {
                submitBtn.disabled = false
                submitBtn.innerHTML = `<i class="ti ti-lock-check me-1"></i> Jelszó mentése`
            }
        })
}
