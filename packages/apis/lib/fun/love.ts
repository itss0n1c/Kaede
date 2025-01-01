export function get(name1: string, name2: string) {
	const combined = name1.toLowerCase() + name2.toLowerCase();
	let score = 0;
	for (let i = 0; i < combined.length; i++) {
		score += combined.charCodeAt(i);
	}
	return score % 101; // Return a score between 0 and 100
}

export const hearts = (love: number) => {
	const loveIndex = Math.floor(love / 10);
	return '❤️'.repeat(loveIndex) + '♡'.repeat(10 - loveIndex);
};
