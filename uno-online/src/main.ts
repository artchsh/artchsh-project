import UnoCard from './components/uno-card.js'
import { generateCards, unoCard } from './lib/data.js'
import { shuffle } from './lib/utils.js'

const unoApp = document.getElementById('uno')!

// ! PLEASE CHANGE THIS TO LOCALSTORAGE OR API
let userCards: unoCard[] = []
let enemyCards: unoCard[] = []
let gameStack: unoCard[] = []
let gameTable: unoCard[] = []
let lastCardOnTable: HTMLDivElement | null = null
let layout: LayoutType
let isItMyTurn = false

interface LayoutType {
	user: {
		section: HTMLDivElement
		cards: HTMLDivElement
		stats: HTMLDivElement
	}
	game: {
		section: HTMLDivElement
		table: HTMLDivElement
		stack: HTMLDivElement
	}
	enemy: {
		section: HTMLDivElement
		cards: HTMLDivElement
		stats: HTMLDivElement
	}
    cardStack: {
        count: HTMLParagraphElement
        text: HTMLParagraphElement
    }
}

function initializeLayout(): LayoutType {
	// create elements and then append them
	const userSection = document.createElement('div')
	const userCards = document.createElement('div')
	const userStats = document.createElement('div')
	userSection.appendChild(userCards)
	userSection.appendChild(userStats)

	const enemySection = document.createElement('div')
	const enemyCards = document.createElement('div')
	const enemyStats = document.createElement('div')
	enemySection.appendChild(enemyCards)
	enemySection.appendChild(enemyStats)

	const stackOfCards = document.createElement('div')
	const gameTable = document.createElement('div')
	const gameSection = document.createElement('div')
	gameSection.appendChild(stackOfCards)
	gameSection.appendChild(gameTable)

	unoApp.appendChild(enemySection)
	unoApp.appendChild(gameSection)
	unoApp.appendChild(userSection)

	// style them
	enemySection.classList.add('flex', 'flex-col', 'w-full', 'h-48', 'bg-black/40', 'absolute', 'top-0', 'items-center')
	enemyCards.classList.add('flex', 'gap-2', 'p-2')
	userSection.classList.add('flex', 'flex-col', 'w-full', 'h-48', 'bg-black/40', 'absolute', 'bottom-0', 'items-center')
	userCards.classList.add('flex', 'gap-2', 'p-2')
	gameSection.classList.add('flex', 'gap-5', 'gameSection')
    enemyCards.classList.add('flex','text-white','text-3xl','font-semibold')

	const lt = {
		user: {
			section: userSection,
			cards: userCards,
			stats: userStats
		},
		game: {
			section: gameSection,
			table: gameTable,
			stack: stackOfCards
		},
		enemy: {
			section: enemySection,
			cards: enemyCards,
			stats: enemyStats
		},
        cardStack: {
            count: document.createElement('p'),
            text: document.createElement('p')
        }
	}
	layout = lt
	return lt
}

function initalizeGame() {
	// style card stack
	layout.game.stack.classList.add('bg-black', 'cursor-pointer', 'hover:bg-zinc-600', 'text-white', 'transition-all', 'duration-150', 'ease-in-out', 'active:scale-95', 'p-4', 'font-bold', 'text-2xl', 'h-48', 'w-48', 'flex-col', 'flex-col', 'gap-2')
    // append text and counter to card stack
    layout.game.stack.appendChild(layout.cardStack.text)
    layout.game.stack.appendChild(layout.cardStack.count)

    // change the count to card stack length
    layout.cardStack.count.innerText = `${gameStack.length}`
    // change text inside card stack
    layout.cardStack.text.innerText = 'Take card'
    // assign an onclick function
	layout.game.stack.onclick = function (e) {
        // if card stack is not empty
		if (gameStack.length !== 0) {
			// take  the last card from stack
			let cardPopped = gameStack.pop()!
			// push it to users cards
			userCards.push(cardPopped)
            // update counter
            layout.cardStack.count.innerText = `${gameStack.length}`
			// create html uno card
			let HTMLUnoCard = UnoCard(cardPopped[0], cardPopped[1])
			// assign onclick function to html uno card
			HTMLUnoCard.onclick = () => {
				placeCardOnTable(cardPopped, true, HTMLUnoCard)
			}
			// append html uno card to html user cards
			layout.user.cards.appendChild(HTMLUnoCard)
            // send info about everything to another player
            sendToServer({
				type: 'update',
				onTable: gameTable,
				enemyCards: userCards,
                cardStack: gameStack
			})
		} else {
            // if card stack is empty then no action on click and change the text
			layout.game.stack.onclick = null
			layout.cardStack.text.innerText = 'Empty'
		}
	}

	// start button
	const startButton = document.createElement('button')
	startButton.classList.add('bg-emerald-200', 'hover:bg-emerald-400', 'transition-all', 'duration-150', 'ease-in-out', 'active:scale-95', 'px-3', 'py-2', 'font-semibold', 'text-4xl', 'rounded-lg', 'uppercase')
	startButton.innerText = 'Start Game'
	startButton.onclick = (e) => {
		startGame()
		startButton.remove()
	}
    // @ts-expect-error
    window.startButton = startButton
	layout.game.table.appendChild(startButton)
}

function startGame(sendThisToServer = true) {
	// send to another player that we are starting the game
    if (sendThisToServer) {
        sendToServer({ type: 'start' })
        isItMyTurn = true
    }
    // generate cards, give them to players
	const shuffledCards = shuffle(generateCards())
	for (let i = 0; i < 7; i++) {
		userCards.push(shuffledCards.pop())
		enemyCards.push(shuffledCards.pop())
	}
    // assign to global variable of game stack
	gameStack = shuffledCards
    // change the counter of cards locally
    layout.cardStack.count.innerText = `${gameStack.length}`
	// "show" these cards to user
	for (let card of userCards) {
		let HTMLUnoCard = UnoCard(card[0], card[1])
		layout.user.cards.appendChild(HTMLUnoCard)
		HTMLUnoCard.onclick = () => {
			placeCardOnTable(card, false, HTMLUnoCard, true)
		}
	}
	setInterval(() => {
		sendToServer({
			type: 'update',
			onTable: gameTable,
			enemyCards: userCards,
			cardStack: gameStack
		})
	}, 1000)
}

function placeCardOnTable(card: unoCard, table = false, htmlUnoCard?: HTMLDivElement, sendThisToServer = false) {
	// check cards
	if (checkCombinationOfCards(gameTable[gameTable.length - 1], card)) {
        // if we have html uno card at users bar then remove it
		if (htmlUnoCard) {
			htmlUnoCard.remove()
		}
        // find the index of the card we need to remove from users cards
		let indexOfCardRemove = userCards.findIndex((item) => item[0] === card[0] && item[1] === card[1])
        // remove it
		userCards.splice(indexOfCardRemove, 1)
        // push that card to table
		gameTable.push(card)
		let HTMLCard = htmlUnoCard ? htmlUnoCard : UnoCard(card[0], card[1], table)
        // if we have card on a table remove it
		if (lastCardOnTable) {
			layout.game.table.removeChild(lastCardOnTable)
		}
        // then append the new card that we removed from users bar
		layout.game.table.appendChild(HTMLCard)
        // assign the new card to global var
		lastCardOnTable = HTMLCard
        // if wee ned to send this to another player => send it
		if (sendThisToServer) {
			sendToServer({
				type: 'update',
				onTable: gameTable,
                myTurn: true,
				enemyCards: userCards,
                cardStack: gameStack
			})
            // also dont forget to turn off out turn
            isItMyTurn = false
		}
	}
}

function checkCombinationOfCards(cardOnTable: unoCard | undefined, userCard: unoCard): boolean {
	if (isItMyTurn) {
		if (cardOnTable == undefined) return true
		const player = {
			value: userCard[1],
			color: userCard[0]
		}
		const onTable = {
			value: cardOnTable[1],
			color: cardOnTable[0]
		}
		if (player.value === 'color_change') return true
		if (player.color === onTable.color) {
			switch (typeof player.value) {
				case 'string':
					return true
				case 'number':
					if (typeof onTable.value === 'string') {
						return true
					} else {
						if (player.value >= onTable.value) {
							return true
						}
						return false
					}
			}
		}
        if (player.color !== onTable.color) {
            switch (typeof player.value) {
                case 'string':
					if (typeof onTable.value === 'string' && onTable.value === player.value) return true
                    return false
                case 'number':
                    if (typeof onTable.value === 'number') if (player.value >= onTable.value) return true
                    return false
            }
        }
        return false
	} else return false
}

function updateGame(data: { onTable: unoCard[]; enemyCards: unoCard[], myTurn: boolean, cardStack: unoCard[] }) {
    // decide if thats your turn
    if (data.myTurn) isItMyTurn = data.myTurn
    // place whatever last card another player have on table
	if (data.onTable.length != 0) placeCardOnTable(data.onTable.pop()!, true)
    // update the counter on card stack
    layout.cardStack.count.innerText = `${data.cardStack.length}`
    // sync the card stack
    gameStack = data.cardStack
    // change the counter of enemy cards
    layout.enemy.cards.innerText = `Enemy Cards: ${data.enemyCards.length}`
	debugger
    // syns left outs
    enemyCards = data.enemyCards
}

// Connect to the WebSocket server
const socket = new WebSocket(`ws://${window.origin.replace('http://', '')}:3000/ws/uno`)

socket.onmessage = function (event) {
	var reader = new FileReader()
	reader.onload = function () {
		let data
		try {
			data = JSON.parse(reader.result as string)
		} catch (error) {
			console.error('Error parsing JSON', error)
			return
		}

		// Now data is an object that contains your game data.
        switch (data.type) {
            case 'update':
                updateGame(data)
                break
            case 'start':
                // @ts-expect-error
                window.startButton.remove()
                startGame(false)
                break
            case 'stop':
                location.reload()
                break
        }
	}

	reader.readAsText(event.data)
}
// Function to send data to the server
function sendToServer(data: { [key: string]: any }) {
	socket.send(JSON.stringify(data))
}



window.addEventListener('DOMContentLoaded', function () {
	initializeLayout()
	initalizeGame()
})
