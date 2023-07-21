import UnoCard from './components/uno-card.js';
import { generateCards } from './lib/data.js';
import { shuffle } from './lib/utils.js';
const unoApp = document.getElementById('uno');
let userCards = [];
let enemyCards = [];
let gameStack = [];
let gameTable = [];
let lastCardOnTable = null;
let layout;
let isItMyTurn = false;
function initializeLayout() {
    const userSection = document.createElement('div');
    const userCards = document.createElement('div');
    const userStats = document.createElement('div');
    userSection.appendChild(userCards);
    userSection.appendChild(userStats);
    const enemySection = document.createElement('div');
    const enemyCards = document.createElement('div');
    const enemyStats = document.createElement('div');
    enemySection.appendChild(enemyCards);
    enemySection.appendChild(enemyStats);
    const stackOfCards = document.createElement('div');
    const gameTable = document.createElement('div');
    const gameSection = document.createElement('div');
    gameSection.appendChild(stackOfCards);
    gameSection.appendChild(gameTable);
    unoApp.appendChild(enemySection);
    unoApp.appendChild(gameSection);
    unoApp.appendChild(userSection);
    enemySection.classList.add('flex', 'flex-col', 'w-full', 'h-48', 'bg-black/40', 'absolute', 'top-0', 'items-center');
    enemyCards.classList.add('flex', 'gap-2', 'p-2');
    userSection.classList.add('flex', 'flex-col', 'w-full', 'h-48', 'bg-black/40', 'absolute', 'bottom-0', 'items-center');
    userCards.classList.add('flex', 'gap-2', 'p-2');
    gameSection.classList.add('flex', 'gap-5', 'gameSection');
    enemyCards.classList.add('flex', 'text-white', 'text-3xl', 'font-semibold');
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
    };
    layout = lt;
    return lt;
}
function initalizeGame() {
    layout.game.stack.classList.add('bg-black', 'cursor-pointer', 'hover:bg-zinc-600', 'text-white', 'transition-all', 'duration-150', 'ease-in-out', 'active:scale-95', 'p-4', 'font-bold', 'text-2xl', 'h-48', 'w-48', 'flex-col', 'flex-col', 'gap-2');
    layout.game.stack.appendChild(layout.cardStack.text);
    layout.game.stack.appendChild(layout.cardStack.count);
    layout.cardStack.count.innerText = `${gameStack.length}`;
    layout.cardStack.text.innerText = 'Take card';
    layout.game.stack.onclick = function (e) {
        if (gameStack.length !== 0) {
            let cardPopped = gameStack.pop();
            userCards.push(cardPopped);
            layout.cardStack.count.innerText = `${gameStack.length}`;
            let HTMLUnoCard = UnoCard(cardPopped[0], cardPopped[1]);
            HTMLUnoCard.onclick = () => {
                placeCardOnTable(cardPopped, true, HTMLUnoCard);
            };
            layout.user.cards.appendChild(HTMLUnoCard);
            sendToServer({
                type: 'update',
                onTable: gameTable,
                enemyCards: userCards,
                cardStack: gameStack
            });
        }
        else {
            layout.game.stack.onclick = null;
            layout.cardStack.text.innerText = 'Empty';
        }
    };
    const startButton = document.createElement('button');
    startButton.classList.add('bg-emerald-200', 'hover:bg-emerald-400', 'transition-all', 'duration-150', 'ease-in-out', 'active:scale-95', 'px-3', 'py-2', 'font-semibold', 'text-4xl', 'rounded-lg', 'uppercase');
    startButton.innerText = 'Start Game';
    startButton.onclick = (e) => {
        startGame();
        startButton.remove();
    };
    window.startButton = startButton;
    layout.game.table.appendChild(startButton);
}
function startGame(sendThisToServer = true) {
    if (sendThisToServer) {
        sendToServer({ type: 'start' });
        isItMyTurn = true;
    }
    const shuffledCards = shuffle(generateCards());
    for (let i = 0; i < 7; i++) {
        userCards.push(shuffledCards.pop());
        enemyCards.push(shuffledCards.pop());
    }
    gameStack = shuffledCards;
    layout.cardStack.count.innerText = `${gameStack.length}`;
    for (let card of userCards) {
        let HTMLUnoCard = UnoCard(card[0], card[1]);
        layout.user.cards.appendChild(HTMLUnoCard);
        HTMLUnoCard.onclick = () => {
            placeCardOnTable(card, false, HTMLUnoCard, true);
        };
    }
    setInterval(() => {
        sendToServer({
            type: 'update',
            onTable: gameTable,
            enemyCards: userCards,
            cardStack: gameStack
        });
    }, 1000);
}
function placeCardOnTable(card, table = false, htmlUnoCard, sendThisToServer = false) {
    if (checkCombinationOfCards(gameTable[gameTable.length - 1], card)) {
        if (htmlUnoCard) {
            htmlUnoCard.remove();
        }
        let indexOfCardRemove = userCards.findIndex((item) => item[0] === card[0] && item[1] === card[1]);
        userCards.splice(indexOfCardRemove, 1);
        gameTable.push(card);
        let HTMLCard = htmlUnoCard ? htmlUnoCard : UnoCard(card[0], card[1], table);
        if (lastCardOnTable) {
            layout.game.table.removeChild(lastCardOnTable);
        }
        layout.game.table.appendChild(HTMLCard);
        lastCardOnTable = HTMLCard;
        if (sendThisToServer) {
            sendToServer({
                type: 'update',
                onTable: gameTable,
                myTurn: true,
                enemyCards: userCards,
                cardStack: gameStack
            });
            isItMyTurn = false;
        }
    }
}
function checkCombinationOfCards(cardOnTable, userCard) {
    if (isItMyTurn) {
        if (cardOnTable == undefined)
            return true;
        const player = {
            value: userCard[1],
            color: userCard[0]
        };
        const onTable = {
            value: cardOnTable[1],
            color: cardOnTable[0]
        };
        if (player.value === 'color_change')
            return true;
        if (player.color === onTable.color) {
            switch (typeof player.value) {
                case 'string':
                    return true;
                case 'number':
                    if (typeof onTable.value === 'string') {
                        return true;
                    }
                    else {
                        if (player.value >= onTable.value) {
                            return true;
                        }
                        return false;
                    }
            }
        }
        if (player.color !== onTable.color) {
            switch (typeof player.value) {
                case 'string':
                    if (typeof onTable.value === 'string' && onTable.value === player.value)
                        return true;
                    return false;
                case 'number':
                    if (typeof onTable.value === 'number')
                        if (player.value >= onTable.value)
                            return true;
                    return false;
            }
        }
        return false;
    }
    else
        return false;
}
function updateGame(data) {
    if (data.myTurn)
        isItMyTurn = data.myTurn;
    if (data.onTable.length != 0)
        placeCardOnTable(data.onTable.pop(), true);
    layout.cardStack.count.innerText = `${data.cardStack.length}`;
    gameStack = data.cardStack;
    layout.enemy.cards.innerText = `Enemy Cards: ${data.enemyCards.length}`;
    debugger;
    enemyCards = data.enemyCards;
}
const socket = new WebSocket(`ws://${window.origin.replace('http://', '')}:3000/ws/uno`);
socket.onmessage = function (event) {
    var reader = new FileReader();
    reader.onload = function () {
        let data;
        try {
            data = JSON.parse(reader.result);
        }
        catch (error) {
            console.error('Error parsing JSON', error);
            return;
        }
        switch (data.type) {
            case 'update':
                updateGame(data);
                break;
            case 'start':
                window.startButton.remove();
                startGame(false);
                break;
            case 'stop':
                location.reload();
                break;
        }
    };
    reader.readAsText(event.data);
};
function sendToServer(data) {
    socket.send(JSON.stringify(data));
}
window.addEventListener('DOMContentLoaded', function () {
    initializeLayout();
    initalizeGame();
});
