import * as mathUtils from './math-utils.js';

const SHUFFLE_SEED = 679389209;
export const NUM_ALPHA_BITS = 6;
export const NUM_CHAR_BITS = 8;

export class BitSeq {
    constructor(bits = '') {
        this.bits = bits;
    }

    append(str) {
        this.bits += str;
        return this;
    }

    appendNum(num, numBits = null) {
        let binary = num.toString(2);
        if (numBits) {
            binary = binary.padStart(numBits, '0');
        }
        return this.append(binary);
    }

    appendAlphas(alphas) {
        for(let c of alphas)
            this.appendNum(mathUtils.alphaToNum(c), NUM_ALPHA_BITS);
        return this;
    }

    appendChars(chars) {
        for(let c of chars)
            this.appendNum(mathUtils.charToNum(c), NUM_CHAR_BITS);
        return this;
    }

    getReader() {
        return new BitSeqReader(this.bits);
    }

    toAlphas() {
        return this.getReader().readAlphas(Math.floor(this.length() / NUM_ALPHA_BITS));
    }

    toChars() {
        return this.getReader().readChars(Math.floor(this.length() / NUM_CHAR_BITS));
    }

    get() {
        return this.bits;
    }

    length() {
        return this.bits.length;
    }

    getXOR(cipher) {
        let myLen = this.length();
        let oLen = cipher.length();
        let max = Math.max(myLen, oLen);

        let arr = this.get().split("");
        let oBits = cipher.get();

        for(let i = 0; i < max; i++)
            arr[i % myLen] = (arr[i % myLen] == oBits.charAt(i % oLen) ? '0' : '1');

        return new BitSeq(arr.join(""));
    }

    getShuffled() {
        let arr = this.bits.split("");
        let newArr = mathUtils.shuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }

    getUnshuffled() {
        let arr = this.bits.split("");
        let newArr = mathUtils.unshuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }
}

class BitSeqReader {
    constructor(bits = '') {
        this.bits = bits;
        this.ptr = 0;
    }

    read(numBits = 1) {
        let bitsLeft = this.bits.length - this.ptr;
        if(numBits == -1 || numBits > bitsLeft)
            numBits = bitsLeft;
        const str = this.bits.substring(this.ptr, this.ptr + numBits);
        this.ptr += numBits;
        return str;
    }

    readNum(numBits = 1) {
        return parseInt(this.read(numBits), 2);
    }

    readAlphas(numChars = 1) {
        let charsLeft = Math.floor(this.bits.length - this.ptr) / NUM_ALPHA_BITS;
        if(numChars == -1 || charsLeft > -1) numChars = charsLeft;
        let str = '';
        for(let i = 0; i < numChars; i++) {
            str += mathUtils.numToAlpha(this.readNum(NUM_ALPHA_BITS));
        }
        return str;
    }

    readChars(numChars = 1) {
        let charsLeft = Math.floor(this.bits.length - this.ptr) / NUM_CHAR_BITS;
        if(numChars == -1 || charsLeft > -1) numChars = charsLeft;
        let str = '';
        for(let i = 0; i < numChars; i++) {
            str += mathUtils.numToChar(this.readNum(NUM_CHAR_BITS));
        }
        return str;
    }
}
