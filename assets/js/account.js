document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailChangeForm')

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
                const modalEl = document.getElementById('modal-change-email')
                const modal = bootstrap.Modal.getInstance(modalEl)
                modal.hide()
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
        }
    })
})
