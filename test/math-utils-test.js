import * as mathUtils from '../js/util/math-utils.js';

testAlpha();
testChar();

function testAlpha() {
	console.log(mathUtils.ALPHAS.length);

	let al = 'A';
	let num = mathUtils.alphaToNum(al);
	console.log(al);
	console.log(num);
	console.log(mathUtils.numToAlpha(num));
}

function testChar() {
	console.log(mathUtils.ALPHAS.length);

	let ch = 'À';
	let num = mathUtils.charToNum(ch);
	console.log(ch);
	console.log(num);
	console.log(mathUtils.numToChar(num));
}
