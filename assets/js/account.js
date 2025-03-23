document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailChangeForm')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('newEmail').value.trim()
        const password = document.getElementById(
            'currentPasswordForChangeEmail'
        ).value

        if (!email || !password) {
            alert('Minden mezőt ki kell tölteni!')
            return
        }

        try {
            const res = await fetch('/account/change-email', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': $('#csrf_token').val(),
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Az email címed sikeresen megváltozott!',
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
