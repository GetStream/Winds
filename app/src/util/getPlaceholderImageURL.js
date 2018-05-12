let cards = [];
let squareCards = [];
for (var i = 1; i < 10; i++) {
	cards.push(require(`../images/cards/pattern-${i}.png`));
	squareCards.push(require(`../images/cards/pattern-${i}-square.png`));
}

let numberOfPlaceholderImages = 9;

export default (string, opts) => {
	let count = 0;
	for (let char of string) {
		count += char.charCodeAt(0);
	}
	if (opts && opts.square) {
		return squareCards[count % numberOfPlaceholderImages];
	} else {
		return cards[count % numberOfPlaceholderImages];
	}
};
