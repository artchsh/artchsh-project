import PublicGoogleSheetsParser from "../libraries/publicGoogleSheetsParser.js"

const tableEl = document.getElementById('schedule')

const daysVocab = {
    M: 'Monday',
    T: 'Tuesday',
    W: 'Wednesday',
    Th: 'Thursday',
    F: 'Friday'
}

const pastelColors = ['#FFB3BA', '#FFDFBA', '#FFFFBA', '#Baffc9', '#BAE1FF', '#D4BAFF', '#FFBAF1', '#BAFFEB', '#FFD8EB', '#BAFFC9']

const coursesColors = []



window.addEventListener('DOMContentLoaded', () => {
    document.getElementById('refresh_button').onclick = loadFromInputOnClick
})

function loadFromLocalStorageOnClick(e) {
    let googleSheetsID = window.localStorage.getItem("id")
    tableEl.innerHTML = null
    createAndLoadSchedule(googleSheetsID)
}

function loadFromInputOnClick(e) {
    let googleSheetsLink = document.getElementById('google_sheets_link').value
    let googleSheetsID = googleSheetsLink.replace("https://docs.google.com/spreadsheets/d/", "").replace("/edit?usp=sharing", "")
    window.localStorage.setItem("id", googleSheetsID)
    e.target.innerText = "Refresh"
    e.target.onclick = loadFromLocalStorageOnClick
    document.getElementById('googlesheets_input_group').remove()
    createAndLoadSchedule(googleSheetsID)
}

function createAndLoadSchedule(googleSheetsID) {
    function initLoading() {
        const loadingEl = document.createElement("span")
        loadingEl.innerText = "Loading..."
        loadingEl.classList.add("font-bold", "text-2xl")
    
        return {
            start: () => {
                document.getElementById("table").style.display = "none"
                document.getElementsByTagName("body")[0].appendChild(loadingEl)
            },
            stop: () => {
                loadingEl.remove()
                document.getElementById("table").style.display = "block"
            }
        }
    }
    
    const loading = initLoading()
    
    const parser = new PublicGoogleSheetsParser(googleSheetsID)
    loading.start()
    parser.parse().then(items => createTable(items))
    function createTable(items) {
        for (let i = 9; i < 18; i++) {
            let timeRowElZeroes = document.createElement('tr')
            timeRowElZeroes.innerHTML += `<td class="font-bold bg-blue-200 text-center">${i}:00</td>`
            for (const [key, dayOfWeek] of Object.entries(daysVocab)) {
                timeRowElZeroes.innerHTML += `<td class="cell" id="${i}:00-${dayOfWeek}"></td>`
            }
            tableEl.appendChild(timeRowElZeroes)

            for (let k = 1; k < 12; k++) {
                let timeRowElFives = document.createElement('tr')
                let minutes = k * 5
                timeRowElFives.innerHTML += `<td class="font-bold bg-blue-200 text-center">${i}:${`${minutes}`.length == 1 ? `0${minutes}` : minutes}</td>`
                for (const [key, dayOfWeek] of Object.entries(daysVocab)) {
                    timeRowElFives.innerHTML += `<td id="${i}:${`${minutes}`.length == 1 ? `0${minutes}` : minutes}-${dayOfWeek}"></td>`
                }
                tableEl.appendChild(timeRowElFives)
            }
        }
        loadSchedule(items)
    }

    function loadSchedule(items) {
        items.map((item, index) => {
            if (!item.Time) {
                return
            }
            coursesColors.push([item.Title, index])
            fillBetweenTimes(item.Time, item.Days, item.Title)
            item.Time.split("-").map((time, timeIndex) => {
                item.Days.split(',').map((day, dayIndex) => {
                    if (timeIndex < 1) {
                        document.getElementById(`${time}-${daysVocab[day]}`).innerHTML = `
                        <span class="font-bold">${item.Title}</span><br>
                        <span class="font-base">Sector: ${item.Sector}<br>Hall: ${item.Hall}<br>Instructor: ${item.Instructor}</span>`
                    }
                    document.getElementById(`${time}-${daysVocab[day]}`).className = `bg-[${pastelColors[coursesColors.find(value => value[0] == item.Title)[1]]}]`

                })
            })
        })
    }

    function fillBetweenTimes(times, days, title) {
        let fromToTime = times.split('-').map((fullTime) => fullTime.split(':').map(time => {
            return parseInt(time)
        }))
        days.split(',').map((day, dayIndex) => {
            let dayOfTheWeek = daysVocab[day]
            let startHours = fromToTime[0][0]
            let startMinutes = fromToTime[0][1]
            let endHours = fromToTime[1][0]
            let endMinutes = fromToTime[1][1]

            if (endMinutes != 0 && endHours - startHours === 1) {
                while (startMinutes < 60) {
                    let elementID = `${startHours}:${`${startMinutes}`.length == 1 ? `0${startMinutes}` : startMinutes}-${dayOfTheWeek}`
                    document.getElementById(elementID).className = `bg-[${pastelColors[coursesColors.find(value => value[0] == title)[1]]}]`
                    startMinutes += 5
                }
                startMinutes = 0
                while (startMinutes < endMinutes) {
                    let elementID = `${endHours}:${`${startMinutes}`.length == 1 ? `0${startMinutes}` : startMinutes}-${dayOfTheWeek}`
                    document.getElementById(elementID).className = `bg-[${pastelColors[coursesColors.find(value => value[0] == title)[1]]}]`
                    startMinutes += 5
                }
            }

            if (endHours - startHours === 0) {
                while (startMinutes < endMinutes) {
                    let elementID = `${endHours}:${`${startMinutes}`.length == 1 ? `0${startMinutes}` : startMinutes}-${dayOfTheWeek}`
                    document.getElementById(elementID).className = `bg-[${pastelColors[coursesColors.find(value => value[0] == title)[1]]}]`
                    startMinutes += 5
                }
            }
        })
        loading.stop()
    }

}