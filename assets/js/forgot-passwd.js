document.addEventListener('DOMContentLoaded', () => {
    const sendBtn = document.getElementById('sendBtn')
    const emailInput = document.getElementById('emailInput')
    const spinner = sendBtn.querySelector('.spinner-border')
    const icon = sendBtn.querySelector('i')

    sendBtn.addEventListener('click', async (e) => {
        e.preventDefault()
        const email = emailInput.value.trim()

        if (!email) {
            return Toast.fire({
                icon: 'error',
                title: 'Kérlek add meg az email címed!',
            })
        }

        // Disable button + show spinner
        sendBtn.disabled = true
        spinner.classList.remove('d-none')
        icon.classList.add('d-none')

        try {
            const response = await fetch('/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                body: JSON.stringify({ email }),
            })

            const data = await response.json()

            if (response.ok) {
                Swal.fire(
                    'Sikeres küldés',
                    data.message || 'Ellenőrizd az emailed!',
                    'success'
                )
            } else {
                Swal.fire(
                    'Hiba',
                    data.message || 'Nem sikerült elküldeni az emailt.',
                    'error'
                )
            }
        } catch (err) {
            Swal.fire('Hiba', 'Valami hiba történt a kérés során.', 'error')
        } finally {
            sendBtn.disabled = false
            spinner.classList.add('d-none')
            icon.classList.remove('d-none')
        }
    })
})
