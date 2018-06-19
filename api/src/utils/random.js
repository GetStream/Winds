// returns a random number from 2**1, 2**2, ..., 2**n-1, 2**n
// 2 is two time more likely to be returned than 4, 4 than 8 and so until 2**n
export default function weightedRandom(n = 6) {
	const exp = n;
	let rand = Math.floor(Math.random() * 2 ** exp);
	let b;
	for (b of [...Array(exp).keys()].reverse()) {
		if (rand >= 2 ** b - 1) {
			break;
		}
	}
	return 2 ** (exp - b);
}
