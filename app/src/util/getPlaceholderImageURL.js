let cards = [];
for (var i = 1; i < 10; i++) {
	cards.push(require(`../images/cards/pattern-${i}.png`));
}

let numberOfPlaceholderImages = 9;

export default string => {
	let count = 0;
	for (let char of string) {
		count += char.charCodeAt(0);
	}
	return cards[count % numberOfPlaceholderImages + 1];
};
