import * as mu from './math-utils.js';

const SHUFFLE_SEED = 679389209;
const NUM_ALPHA_BITS = 6;

export class BitSeq {
    constructor(bits = '') {
        this.bits = bits;
    }

    append(str) {
        this.bits += str;
    }

    appendNum(num, numBits = null) {
        let binary = num.toString(2);
        if (numBits) {
            binary = binary.padStart(numBits, '0');
        }
        this.append(binary);
    }

    appendAlpha(alpha) {
        for(let c of alpha)
            this.appendNum(mu.toNum(c), NUM_ALPHA_BITS);
    }

    prepend(str) {
        this.bits = str + this.bits;
    }

    prependNum(num, numBits) {
        let binary = num.toString(2);
        if (numBits) {
            binary = binary.padStart(numBits, '0');
        }
        this.prepend(binary);
    }

    prependAlpha(alpha) {
        this.prependNum(mu.toNum(alpha));
    }

    getReader() {
        return new BitSeqReader(this.bits);
    }

    get() {
        return this.bits;
    }

    length() {
        return this.bits.length;
    }

    getXOR(cipher) {

    }

    getShuffled() {
        let arr = this.bits.split("");
        let newArr = mu.shuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }

    getUnshuffled() {
        let arr = this.bits.split("");
        let newArr = mu.unshuffle(arr, SHUFFLE_SEED);
        return new BitSeq(newArr.join(""));
    }
}

class BitSeqReader {
    constructor(bits = '') {
        this.bits = bits;
        this.ptr = 0;
    }

    read(numBits = 1) {
        const str = this.bits.substring(this.ptr, this.ptr + numBits);
        this.ptr += numBits;
        return str;
    }

    readNum(numBits = 1) {
        return parseInt(this.read(numBits), 2);
    }

    readAlpha(numChars = 1) {
        let str = '';
        for(let i = 0; i < numChars; i++) {
            str += mu.toAlpha(this.readNum(NUM_ALPHA_BITS));
        }
        return str;
    }
}
