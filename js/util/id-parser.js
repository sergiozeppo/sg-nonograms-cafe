import { BitSeq, NUM_ALPHA_BITS } from './bitseq.js';

const VERSION = 1;

export function parseId(id) {
	const bitSeq = new BitSeq().appendAlpha(id).getUnshuffled();

	const reader = bitSeq.getReader();
	const version = 1 + reader.readNum(6);

	let numRows = '';
	let numCols = '';
	let seed = '';
	let msg = '';

	switch(version) {
		case 1:
			numRows = reader.readNum(6) + 5;
			numCols = reader.readNum(6) + 5;
			seed = reader.readNum(30);
			msg = reader.readAlpha(5);
			break;
		default:
	}
    
	return { version, numRows, numCols, seed, msg };
}

export function generateId(numRows, numCols, seed, msg, version = VERSION) {
	let bitSeq = new BitSeq();
	bitSeq.appendNum(version - 1, 6);

	switch(version) {
		case 1: 
			bitSeq.appendNum(numRows - 5, 6);
			bitSeq.appendNum(numCols - 5, 6);
			bitSeq.appendNum(seed, 30);
			bitSeq.appendAlpha(msg);
			break;
		default:
	}

	const len = bitSeq.get().length;
	if(len % NUM_ALPHA_BITS != 0) {
		console.log('Len: ' + len)
		bitSeq.appendNum(0, NUM_ALPHA_BITS - (len % NUM_ALPHA_BITS));
	}

	return bitSeq.getShuffled().toAlpha();
}
