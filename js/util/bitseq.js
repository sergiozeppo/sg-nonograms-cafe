class BitSequence {
    constructor() {
        this.bits = 0n; // Using BigInt to handle large sequences of bits
        this.length = 0; // Length of the bit sequence
    }

    // Concatenates another BitSequence to this one
    addSeq(otherBitSeq) {
        if (!(otherBitSeq instanceof BitSequence)) {
            throw new Error("Argument must be an instance of BitSequence");
        }
        this.bits = (this.bits << BigInt(otherBitSeq.length)) | otherBitSeq.bits;
        this.length += otherBitSeq.length;
    }

    // Converts a number to bits and adds them to the sequence
    addNum(num) {
        if (typeof num !== 'number' || num < 0) {
            throw new Error("Argument must be a non-negative integer");
        }

        let numBits = num.toString(2); // Convert number to binary string
        let numLength = numBits.length;
        
        this.bits = (this.bits << BigInt(numLength)) | BigInt(`0b${numBits}`);
        this.length += numLength;
    }

    // Reads a certain number of bits and returns them as an integer
    read(num) {
        if (typeof num !== 'number' || num < 0 || num > this.length) {
            throw new Error("Argument must be a non-negative integer within the sequence length");
        }

        let mask = (1n << BigInt(num)) - 1n; // Create a mask of `num` bits
        let result = Number((this.bits >> BigInt(this.length - num)) & mask); // Extract the bits
        this.bits &= ~(mask << BigInt(this.length - num)); // Remove the read bits from the sequence
        this.length -= num;

        return result;
    }

    // Helper to represent the sequence as a binary string
    toString() {
        return this.bits.toString(2).padStart(this.length, '0');
    }
}
/*
// Example Usage
let seq1 = new BitSequence();
seq1.addNum(5); // Adds 101 to the sequence
console.log(seq1.toString()); // "101"

let seq2 = new BitSequence();
seq2.addNum(3); // Adds 11 to the sequence
console.log(seq2.toString()); // "11"

seq1.addSeq(seq2);
console.log(seq1.toString()); // "10111"

let readValue = seq1.read(3); // Reads the first 3 bits (101)
console.log(readValue); // 5
console.log(seq1.toString()); // "11"
*/
