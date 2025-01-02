export const MAX_HASH = 0x7FFFFFFF;

// https://stackoverflow.com/a/29450606
export function getRandomizer(seed) {
    var mask = 0xffffffff;
    var m_w  = (123456789 + seed) & mask;
    var m_z  = (987654321 - seed) & mask;

    return function() {
      m_z = (36969 * (m_z & 65535) + (m_z >>> 16)) & mask;
      m_w = (18000 * (m_w & 65535) + (m_w >>> 16)) & mask;

      var result = ((m_z << 16) + (m_w & 65535)) >>> 0;
      result /= 4294967296;
      return result;
    }
}

export function hash(vals) {
    // Convert the values to a single number using bitwise operations
    let hash = 0;

    // Mix the values with shifts and XOR
    for (let i = 0; i < vals.length; i++) {
        hash ^= (vals[i] << (i * 5));  // Shift each value by a different number of bits
    }

    // You can apply further mixing here, such as rotating bits or using more XORs
    hash = (hash ^ (hash >>> 16)) * 0x45d9f3b;
    hash = (hash ^ (hash >>> 16)) * 0x45d9f3b;
    hash = hash ^ (hash >>> 16);

    // Final hash as a 31-bit integer
    hash &= MAX_HASH;

    return hash;
}

export function toAlpha(num) {
	return num == 62 ? '-' : // 62 is -
		num == 63 ? '_' : // 63 is _
		num < 26 ? String.fromCharCode('a'.charCodeAt(0) + num) : // 0-25 for a-z
		num < 52 ? String.fromCharCode('A'.charCodeAt(0) + num - 26) : // 26-51 for A-Z
		String.fromCharCode('0'.charCodeAt(0) + num - 52); // 52-61 for 0-9
}

export function toNum(alpha) {
	return alpha == '-' ?  62 :
		(alpha >= 'a' && alpha <= 'z') ? alpha.charCodeAt(0) - 'a'.charCodeAt(0) : // 0-25 for a-z
		(alpha >= 'A' && alpha <= 'Z') ? alpha.charCodeAt(0) - 'A'.charCodeAt(0) + 26 : // 26-51 for A-Z
		(alpha >= '0' && alpha <= '9') ? alpha.charCodeAt(0) - '0'.charCodeAt(0) + 52 : // 52-61 for 0-9
		63; // 63 is _
}

export function shuffle(arr, seed) {
		const rng = getRandomizer(seed);
		const newArr = [...arr];
		const rngNums = [];
		const len = newArr.length;

		for(let i = 1; i < len; i++)
			rngNums.push(rng());

		for (let i = 1; i < len; i++) {
			const j = Math.floor(rngNums[len - i - 1] * (i + 1));
			[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
		}

		return newArr;
	}

	export function unshuffle(arr, seed = 42) {
		const rng = getRandomizer(seed);
		const newArr = [...arr];
	
		for (let i = newArr.length - 1; i > 0; i--) {
			const j = Math.floor(rng() * (i + 1));
			[newArr[i], newArr[j]] = [newArr[j], newArr[i]];
		}
		
		return newArr;
	}