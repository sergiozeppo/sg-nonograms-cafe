import { BitSeq } from '../js/util/bitseq.js';

testBinSeq();

function testBinSeq() {
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


