import { BitSeq, NUM_ALPHA_BITS } from './bitseq.js';

const VERSION = 1;

export function parseId(id) {
	const bitSeq = new BitSeq().appendAlpha(id).getUnshuffled();

	const reader = bitSeq.getReader();
	const version = 1 + reader.readNum(6);

	let numRows = '';
	let numCols = '';
	let seed = '';
	let msgType = '';
	let msg = '';

	switch(version) {
		case 1:
			numRows = reader.readNum(5);
			numCols = reader.readNum(5);
			seed = reader.readNum(31);
			msgType = reader.readNum(1);
			msg = reader.readAlphas(5);
			break;
		default:
	}
    
	return { version, numRows, numCols, seed, msgType, msg };
}

export function generateId(numRows, numCols, seed, msg, msgType, version = VERSION) {
	let bitSeq = new BitSeq();
	bitSeq.appendNum(version - 1, 6);

	switch(version) {
		case 1: 
			bitSeq.appendNum(numRows, 5);
			bitSeq.appendNum(numCols, 5);
			bitSeq.appendNum(seed, 31);
			bitSeq.appendNum(msgType, 1);
			bitSeq.appendAlpha(msg);
			break;
		default:
	}

	return bitSeq.getShuffled().toAlphas();
}
