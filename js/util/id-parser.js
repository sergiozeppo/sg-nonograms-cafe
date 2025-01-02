import { BitSeq, NUM_CHAR_BITS, NUM_ALPHA_BITS } from './bitseq.js';

const VERSION = 1;

export function parseId(id) {
	const bitSeq = new BitSeq().appendAlphas(id).getUnshuffled();

	console.log(`Read ${bitSeq.length()} bits`);

	const reader = bitSeq.getReader();
	const version = 1 + reader.readNum(6);

	let numRows = '';
	let numCols = '';
	let seed = '';
	let msgType = '';
	let enc = null;

	switch(version) {
		case 1:
			let gap = reader.readNum(3);
			//console.log(`Read len: ${bitSeq.length()-gap}, gap: ${gap}`);
			reader.readNum(gap);
			numRows = reader.readNum(5);
			numCols = reader.readNum(5);
			seed = reader.readNum(31);
			msgType = reader.readNum(1);
			//console.log('Lft: ' + reader.left())
			enc = new BitSeq(reader.read());
			break;
		default:
	}
    
	return { version, numRows, numCols, seed, msgType, enc };
}

export function generateId(numRows, numCols, seed, enc, msgType = 0, version = VERSION) {
	//console.log(`%j`, {version, numRows, numCols, seed, enc, msgType})
	let bitSeq = new BitSeq();
	bitSeq.appendNum(version - 1, 6);

	switch(version) {
		case 1: 
			const len = 6 + 3 + 5 + 5 + 31 + 1 + enc.length();
			const gap = (NUM_ALPHA_BITS - len % NUM_ALPHA_BITS) % NUM_ALPHA_BITS;
			//console.log(`Len: ${len}, gap: ${gap}`);
			//console.log(`Enc: ` + enc.get());
			
			bitSeq.appendNum(gap, 3);
			bitSeq.appendNum(0, gap);
			bitSeq.appendNum(numRows, 5);
			bitSeq.appendNum(numCols, 5);
			bitSeq.appendNum(seed, 31);
			bitSeq.appendNum(msgType, 1);
			bitSeq.append(enc.get());
			break;
		default:
	}

	//console.log(`Write ${bitSeq.length()} bits`);
	return bitSeq.getShuffled().toAlphas();
}
