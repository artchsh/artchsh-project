const colorVocab = {
    r: 'red',
    y: 'yellow',
    b: 'blue',
    g: 'green'
};
export default function UnoCard(color, value, table = false) {
    const mainFrame = document.createElement('div');
    const innerFrame = document.createElement('div');
    mainFrame.classList.add('p-3', 'bg-white');
    mainFrame.appendChild(innerFrame);
    if (!table) {
        innerFrame.classList.add('w-36', 'h-36', `bg-${colorVocab[color]}-500`, 'flex', 'items-center', 'justify-center', `hover:bg-${colorVocab[color]}-300`, 'transition-all', 'duration-150', 'ease-in-out', 'active:scale-95', 'cursor-pointer', 'text-2xl', 'font-bold');
    }
    else {
        innerFrame.classList.add('w-36', 'h-36', `bg-${colorVocab[color]}-500`, 'flex', 'items-center', 'justify-center', 'text-2xl', 'font-bold');
    }
    innerFrame.innerText = `${value}`;
    return mainFrame;
}
