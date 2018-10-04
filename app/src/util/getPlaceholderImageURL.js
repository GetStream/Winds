const cards = [];
const squareCards = [];
const numberOfImages = 9;

for (let i = 1; i <= numberOfImages; i++) {
	cards.push(require(`../images/cards/pattern-${i}.png`));
	squareCards.push(require(`../images/cards/pattern-${i}-square.png`));
}

export default (stringId, square = false) => {
	let count = 0;
	for (const char of stringId) count += char.charCodeAt(0);

	if (square) return squareCards[count % numberOfImages];
	return cards[count % numberOfImages];
};
