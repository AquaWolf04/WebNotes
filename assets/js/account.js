document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('emailChangeForm')
    const submitBtn = document.getElementById('changeEmailBtn')
    const verifyBtn = document.getElementById('verifyCodeBtn')

    form.addEventListener('submit', async (e) => {
        e.preventDefault()

        const email = document.getElementById('newEmail').value.trim()
        const password = document.getElementById(
            'currentPasswordForChangeEmail'
        ).value

        if (!email || !password) {
            Swal.fire({
                icon: 'error',
                title: 'Hiba történt!',
                text: 'Az összes mező kitöltése kötelező!',
            })
            return
        }

        submitBtn.disabled = true
        submitBtn.innerHTML = `<i class="ti ti-loader-2 spinner-rotate me-1"></i> Küldés...`

        try {
            const res = await fetch('/account/check-details', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                body: JSON.stringify({ email, password }),
            })

            const data = await res.json()

            if (data.success) {
                // Modal 1 bezárása
                const modal1 = bootstrap.Modal.getInstance(
                    document.getElementById('modal-change-email')
                )
                modal1.hide()

                // 6 számjegyű mezők generálása Tabler stílusban
                const codeInputs = document.getElementById('code-inputs')
                codeInputs.innerHTML = [...Array(6)]
                    .map(
                        () => `
                  <input
                    type="text"
                    maxlength="1"
                    class="form-control form-control-lg text-center px-3 py-3 code-input"
                    inputmode="numeric"
                    pattern="[0-9]*"
                    autocomplete="one-time-code"
                  />
                `
                    )
                    .join('')

                // Modal 2 megnyitása
                const modal2El = document.getElementById('modal-code-verify')
                const modal2 = new bootstrap.Modal(modal2El)
                modal2.show()

                // Input viselkedés
                const inputs = modal2El.querySelectorAll('.code-input')
                inputs.forEach((input, i) => {
                    input.addEventListener('input', () => {
                        if (input.value.length === 1 && i < inputs.length - 1) {
                            inputs[i + 1].focus()
                        }
                    })

                    input.addEventListener('keydown', (e) => {
                        if (
                            e.key === 'Backspace' &&
                            input.value === '' &&
                            i > 0
                        ) {
                            inputs[i - 1].focus()
                        }
                    })
                })

                // Első mezőre fókusz
                setTimeout(() => inputs[0].focus(), 300)

                // Előző űrlap törlése
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
            submitBtn.disabled = false
            submitBtn.innerHTML = `<i class="ti ti-send me-1"></i> Küldés`
        }
    })

    // Modal 2: Kód validálása
    verifyBtn.addEventListener('click', async () => {
        const inputs = document.querySelectorAll('.code-input')
        const code = Array.from(inputs)
            .map((i) => i.value)
            .join('')

        if (code.length !== 6 || !/^\d{6}$/.test(code)) {
            Swal.fire({
                icon: 'error',
                title: 'Hibás kód!',
                text: 'Pontosan 6 számjegyet adj meg!',
            })
            return
        }

        const btn = document.getElementById('verifyCodeBtn')
        btn.disabled = true
        const originalHtml = btn.innerHTML
        btn.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Ellenőrzés...`

        try {
            const res = await fetch('/account/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-Token': document
                        .querySelector('meta[name="csrf-token"]')
                        .getAttribute('content'),
                },
                body: JSON.stringify({ code }),
            })

            const data = await res.json()

            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Kód elfogadva!',
                    text: 'Elküldtük a megerősítő linket az új email címre.',
                })

                const modal2 = bootstrap.Modal.getInstance(
                    document.getElementById('modal-code-verify')
                )
                modal2.hide()
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Hiba',
                    text: data.message || 'Hibás kód.',
                })
            }
        } catch (err) {
            console.error(err)
            Swal.fire({
                icon: 'error',
                title: 'Hálózati hiba',
                text: 'Kérlek, próbáld újra később.',
            })
        } finally {
            btn.disabled = false
            btn.innerHTML = originalHtml
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
            'X-CSRF-Token': document
                .querySelector('meta[name="csrf-token"]')
                .getAttribute('content'),
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
