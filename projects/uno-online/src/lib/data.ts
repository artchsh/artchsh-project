const cardColors: cardColor[] = ['r','y','b','g']
type cardColor = 'r' | 'y' | 'b' | 'g'

const cardValues: cardValue[] = [0,1,2,3,4,5,6,7,8,9,'skip','+2','color_change']
type cardValue = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 'skip' | '+2' | 'color_change'

export type unoCard = [cardColor, cardValue]

export function generateCards() : unoCard[] {
    let unoCards: unoCard[] = []
    for (let color of cardColors) {
        for (let value of cardValues) {
            unoCards.push([color, value])
        }
    }
    return unoCards
}