import PublicGoogleSheetsParser from "../libraries/publicGoogleSheetsParser"

const sheetid = "10ygTQkZ0eCjHgATEDPtKAKVbj2UDa6kqAcZVPxj4R0I"
const bookParserDiv = document.getElementById("books-parser")
const searchBox = document.getElementById("search")
const parser = new PublicGoogleSheetsParser(sheetid)
let globalItems = null

function bookComponent(object) {
    return `
        <div id="book-${object["ID"] + 1}" class="flex flex-col w-full md:w-72 p-3 bg-neutral-800 text-white rounded-lg shadow">
            <p class="font-semibold text-xl">${sanitizeInput(object["Название"])}</p>
            <div class="text-neutral-200">
                ${object["Автор"] ? `<p class="">Автор: ${object["Автор"]}</p>` : ""} 
                <p>Год: ${sanitizeInput(object["Год"])}</p>
                <p>Состояние: ${sanitizeInput(object["Состояние"])}</p>
                ${object["Примечание"] ? `<p>Примечание: ${sanitizeInput(object["Примечание"])}</p>` : ""}
            </div>
        </div>
    `
}

function loadBooks(filter = "") {
    const items = globalItems
    bookParserDiv.innerHTML = ""
    items.filter((value) => filterBook(value, filter)).map(item => {
        bookParserDiv.innerHTML += bookComponent(item)
    })
}

function sanitizeInput(input = "") {
    return input ? input : ""
}

function filterBook(book, text = "") {
    for (const [key, value] of Object.entries(book)) {
        if (value.toString().toLowerCase().includes(text)) {
            return true
        }
    }
    return false
}

window.addEventListener("DOMContentLoaded", () => {
    parser.parse().then((items) => {
        globalItems = items
        loadBooks()
    })
})
searchBox.addEventListener("input", (e) => {
    loadBooks(e.target.value.toLowerCase())
})