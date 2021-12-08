const summaryAPI = 'https://api.covid19api.com/summary'
const countriesAPI = 'https://restcountries.com/v2/all'

// function to get data from API
async function getDatas() {
    try {
        let response = await fetch(summaryAPI);
        return await response.json();
    } catch (error) {
        console.log(error);
    }
}

// function to format number: ex: 10000 -> 10,000
function formatNums(num, sep, dec, u) {
    sep=sep||',';
    u=u||'\\d';
    if(typeof num!='string') {
        num=String(num);
        if( dec && dec!='.') num=num.replace('.',dec);
    }
    return num.replace(RegExp('\\'+(dec||'.')+u+'+|'+u+'(?=(?:'+u+'{3})+(?!'+u+'))','g'),function(a) {return a.length==1 ? a+sep : a})
}



// function to render dashboard data
async function renderDashboard() {
    let data = await getDatas();

    const totalComfirmed = document.getElementById('comfirmed-number')
    const numberOfDeaths = document.getElementById('death-number')
    const numberOfRecovered = document.getElementById('recovered-number')
    const dateStatistics = document.querySelectorAll('#date__statistics')
    
    totalComfirmed.innerHTML = formatNums(data.Global.NewConfirmed)
    numberOfDeaths.innerHTML = formatNums(data.Global.NewDeaths)
    numberOfRecovered.innerHTML = formatNums(data.Global.NewRecovered)

    dateStatistics.forEach(date => {
        date.innerHTML = data.Global.Date
    }) 
}

// function return a number countries: 
// ex: getListCountries(5) -> return list of 5 countries
async function getListCountries(num) {
    let data = await getDatas();

    let countryList = []
    for(let i = 0; i < num; i++) {
        countryList.push(data.Countries[i])
    }

    return countryList
}

// render global list of country info
function renderGlobal(callback) {
    callback.then(countries => {
        countries.forEach(country => {
           
                const tr = document.createElement('tr')
                const trContent = `
                                    <td>${country.Country}</td>
                                    <td class="${country.NewConfirmed > 10000 ? 'danger' : 'success'}">${country.NewConfirmed}</td>
                                    <td >${country.NewDeaths}</td>
                                    <td>${country.NewRecovered}</td>
                                    <td><span class="material-icons-sharp book-mark__icon">favorite_border</span></td>
                                    `
                tr.innerHTML = trContent

                document.querySelector('table tbody').appendChild(tr)
            
        });
    })
}

// return an object info of country most total comfirmed cases
async function mostTotalComfirmed() {
    let data = await getDatas();

    let numCountries = data.Countries.length
    let max = 0
    let countryName = ''

    for(let i = 0; i < numCountries; i++) {
        if(data.Countries[i].TotalConfirmed > max) {
            max = data.Countries[i].TotalConfirmed
            countryName = data.Countries[i].Country
        }
    }
    
    return {
        country: countryName,
        total: max
    }
}

// return an object info of country most total deaths cases
async function mostTotalDeath() {
    let data = await getDatas();

    let numCountries = data.Countries.length
    let max = 0
    let countryName = ''

    for(let i = 0; i < numCountries; i++) {
        if(data.Countries[i].TotalDeaths > max) {
            max = data.Countries[i].TotalDeaths
            countryName = data.Countries[i].Country
        }
    }
    
    return {
        country: countryName,
        total: max
    }
}

// return an object info of country least total recovered cases
async function leastTotalRecovered() {
    let data = await getDatas();

    let numCountries = data.Countries.length
    let min = data.Countries[1].TotalRecovered
    let countryName = data.Countries[1].Country

    for(let i = 0; i < numCountries; i++) {
        if(data.Countries[i].TotalDeaths < min) {
            min = data.Countries[i].TotalDeaths
            countryName = data.Countries[i].Country
        }
    }
    
    return {
        country: countryName,
        total: min
    }
}

const mostComfirmed = document.querySelector('#most-comfirmed')
const mostDeath = document.querySelector('#most-death')
const leastRecovered = document.querySelector('#least-recovered')

// function to render most affected countries
function renderMostAffected() {
    // most total comfirmed cases
    mostTotalComfirmed().then(data => {
        mostComfirmed.innerHTML = data.country
        document.querySelector('.number-cases.comfirmed').innerHTML = formatNums(data.total)
    })

    // most total death cases
    mostTotalDeath().then(data => {
        mostDeath.innerHTML = data.country
        document.querySelector('.number-cases.death').innerHTML = formatNums(data.total)
    })

    // least recovered case
    // ex: return 1 country
    leastTotalRecovered().then(data => {
        leastRecovered.innerHTML = data.country
        document.querySelector('.number-cases.recovered').innerHTML = formatNums(data.total)
    })
}


// create new request for contry flag
function renderFlag() {
    let xhttp = new XMLHttpRequest()
    let respJSON = []
    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            resp = this.responseText
            respJSON = JSON.parse(resp)

            const confirmedFlag = document.getElementById('comfirmed-flag')
            const deathFlag = document.getElementById('death-flag')
            const recoveredFlag = document.getElementById('recovered-flag')

            for(let i = 0; i < respJSON.length; i++) {
                if(respJSON[i].name == mostComfirmed.innerText) {
                    confirmedFlag.src = respJSON[i].flag
                } 

                if(respJSON[i].name == mostDeath.innerText) {
                    deathFlag.src = respJSON[i].flag
                }
                
                if(respJSON[i].name == leastRecovered.innerText) {
                    recoveredFlag.src = respJSON[i].flag
                }
            }
        }
    }
    xhttp.open('GET', countriesAPI, true)
    xhttp.send()
}


// load a list of country to select when document first load
document.addEventListener('DOMContentLoaded', () => {
    const selectDrop = document.getElementById('countries')

    fetch(countriesAPI)
        .then(res => res.json())
        .then(data => {
            let html = ''
            data.forEach(country => {
                html += `<option value=${country.name}>${country.name}</option>`
            })

            selectDrop.innerHTML = html
        }).catch(err => {
            console.log(err)
        })
})

const updates = document.querySelectorAll('.update')
const showCountryInfo = document.querySelector('.show-info')

// click to see info of the most affected country 
function showPopup() {
    updates.forEach(update => {
        update.addEventListener('click', () => {
            const country = update.querySelector('b').innerText
    
            const name = document.querySelector('.info__item .name')
            const flag = document.querySelector('.info__item .flag')
            const capital = document.querySelector('.info__item .capital')
            const region = document.querySelector('.info__item .region')
            const subregion = document.querySelector('.info__item .subregion')
            const population = document.querySelector('.info__item .population')
            
            let xhttp = new XMLHttpRequest()
            let respJSON = []
            xhttp.onreadystatechange = function() {
                if(this.readyState == 4 && this.status == 200) {
                    resp = this.responseText
                    respJSON = JSON.parse(resp)
                    let respJSONLength = respJSON.length
                    
                    // loop to find relevant country information
                    for(let i = 0; i < respJSONLength; i++) {
                        if(respJSON[i].name == country) {
                            name.innerHTML = respJSON[i].name
                            flag.src = respJSON[i].flag
                            capital.innerHTML = respJSON[i].capital
                            region.innerHTML = respJSON[i].region
                            subregion.innerHTML = respJSON[i].subregion
                            population.innerHTML = formatNums(respJSON[i].population)
                        }
                    }
                }
            }
            xhttp.open('GET', countriesAPI, true)
            xhttp.send()
            
            // handle show/ hide popup
            if(showCountryInfo.style.display == 'block') {
                showCountryInfo.style.display = 'none'
            } else {
                showCountryInfo.style.display = 'block'
            }
        })
    })
}

function handleShowAllContries() {
    const showAll = document.getElementById('show-all')

    showAll.addEventListener('click', () => {
        renderGlobal(getListCountries(193))
    })
}


// App render
renderDashboard()
renderGlobal(getListCountries(10))
renderFlag()
renderMostAffected()
showPopup()
handleShowAllContries()