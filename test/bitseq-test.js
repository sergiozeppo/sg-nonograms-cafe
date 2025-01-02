import { BitSeq } from '../js/util/bitseq.js';
import * as idParser from '../js/util/id-parser.js';

//testBitSeq();
testIdParser();

function testBitSeq() {
	let bs = new BitSeq();
	console.log(bs.get());
	bs.appendNum(25, 6);
	console.log(bs.get());
	bs.appendAlpha('F');
	bs.appendAlpha('-');
	console.log(bs.get());
	bs.prepend('101010');
	console.log(bs.get());
	bs.append('11100');
	console.log(bs.get());

	console.log('Reading');

	let reader = bs.getReader();
	console.log(reader.read(6));
	console.log(reader.readNum(2));
	console.log(reader.readNum(4));
	console.log(reader.readAlpha(2));
	console.log(reader.read(5));
}

function testIdParser() {
	let id = idParser.generateId(15, 12, 99998888, 'h3lL0');

	let {version, numRows, numCols, seed, msg} = idParser.parseId(id);
	console.log(`version: ${version}`);
	console.log(`numRows: ${numRows}`);
	console.log(`numCols: ${numCols}`);
	console.log(`seed: ${seed}`);
	console.log(`msg: ${msg}`);
}
