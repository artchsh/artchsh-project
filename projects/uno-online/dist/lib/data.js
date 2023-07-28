const cardColors = ['r', 'y', 'b', 'g'];
const cardValues = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 'skip', '+2', 'color_change'];
export function generateCards() {
    let unoCards = [];
    for (let color of cardColors) {
        for (let value of cardValues) {
            unoCards.push([color, value]);
        }
    }
    return unoCards;
}
