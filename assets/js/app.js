$(document).ready(() => {
    $.ajax({
        url: '/me',
        type: 'GET',
        success: (response) => {
            if (response.user) {
                $('#user-avatar').text(response.user.username.charAt(0).toUpperCase())

                $('#user-name').text(response.user.username)

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

                $('#user-email').text(response.user.email)
            }
        },
        error: (xhr, status, error) => {
            console.error('Hiba történt:', error)
        },
    })
})

function upgradeToPro() {
    alert('Jelenlen nincs lehetőség a Pro csomagra való frissítésre.')
}
