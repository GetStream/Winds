const cards = [];
const squareCards = [];
const numberOfImages = 9;

for (let i = 1; i <= numberOfImages; i++) {
	cards.push(require(`../images/cards/pattern-${i}.png`));
	squareCards.push(require(`../images/cards/pattern-${i}-square.png`));
}

export default (square = false) => {
	const random = Math.floor(Math.random() * numberOfImages);

	if (square) return squareCards[random];
	return cards[random];
};
