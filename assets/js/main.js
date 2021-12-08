const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const sideMenu = $('.menu')
const menuBtn = $('#menu-btn')
const closeBtn = $('#close-btn')
const themeToggler = $('.theme-toggler')

// show sidebar
menuBtn.addEventListener('click', () => {
    sideMenu.style.display = 'block'
})

// close sidebar
closeBtn.addEventListener('click', () => {
    sideMenu.style.display = 'none'
})

//change theme
themeToggler.addEventListener('click', () => {
    document.body.classList.toggle('dark-theme-variables')

    themeToggler.querySelector('span:nth-child(1)').classList.toggle('active')
    themeToggler.querySelector('span:nth-child(2)').classList.toggle('active')
})