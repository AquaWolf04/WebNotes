if (localStorage.getItem('theme') === 'dark') {
    document.body.setAttribute('data-bs-theme', 'dark')
    document.body.style.backgroundImage = "url('/img/bg/login-dark.png')"
    document.querySelector('.hide-theme-dark').style.display = 'none'
    document.querySelector('.hide-theme-light').style.display = 'block'
} else {
    document.body.removeAttribute('data-bs-theme')
    document.body.style.backgroundImage = "url('/img/bg/login-light.png')"
    document.querySelector('.hide-theme-light').style.display = 'none'
    document.querySelector('.hide-theme-dark').style.display = 'block'
}

const themeToggle = document.querySelector('.theme-toggle')
const themeDark = document.querySelector('.hide-theme-dark')
const themeLight = document.querySelector('.hide-theme-light')

themeDark.addEventListener('click', () => {
    document.body.setAttribute('data-bs-theme', 'dark')
    document.body.style.backgroundImage = "url('/img/bg/login-dark.png')"
    localStorage.setItem('theme', 'dark')
    themeDark.style.display = 'none'
    themeLight.style.display = 'block'
})

themeLight.addEventListener('click', () => {
    document.body.removeAttribute('data-bs-theme')
    document.body.style.backgroundImage = "url('/img/bg/login-light.png')"
    localStorage.setItem('theme', 'light')
    themeLight.style.display = 'none'
    themeDark.style.display = 'block'
})
