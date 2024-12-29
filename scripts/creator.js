

// Takes in a secret code and sizes
// Returns an id
function generateNonogram(numRows, numCols, message) {

}

function getPlayerFromId(id) {
    // TODO FROM ID
    // Extract seed
    // Extract numRows
    // Extract numCols
    // Extract encoded

    let numRows = 8;
    let numCols = 12;

    const seed = getSeedFromValues(numRows, numCols, id);
    const infos = generateHints(numRows, numCols, seed);

    return {
        numRows: numRows,
        numCols: numCols,
        encoded: 'blah',
        horHints: infos.horHints,
        verHints: infos.verHints
    };
}

function getSeedFromValues(numRows, numCols, code) {
    console.log(`Generating for ${numRows}, ${numCols}, ${code}`)
    let vals = Array.from(code).map(c => {
        if (c >= 'a' && c <= 'z') {
            return c.charCodeAt(0) - 'a'.charCodeAt(0);  // 0-25 for a-z
        } else if (c >= 'A' && c <= 'Z') {
            return c.charCodeAt(0) - 'A'.charCodeAt(0) + 26;  // 26-51 for A-Z
        } else if (c >= '0' && c <= '9') {
            return c.charCodeAt(0) - '0'.charCodeAt(0) + 52;  // 52-61 for 0-9
        } else {
            return 62;  // Any other character gets 62
        }
    });
    vals.push(numRows);
    vals.push(numCols);

    console.log(vals);

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

    // Final hash as a 32-bit integer
    hash &= 0xFFFFFFFF;

    console.log(hash);
    
    return hash;
}

// Takes in a seed and sizes
// Returns hints
function generateHints(numRows, numCols, seed) {
    const grid = generateGrid(numRows, numCols, seed);
    let horHints = [];
    let verHints = [];

    for(let row = 0; row < numRows; row++) {
        let hints = [];

        let count = 0;
        for(let col = 0; col <= numCols; col++) {
            if(col == numCols || grid[row][col] != 1) {
                if(count > 0) {
                    hints.push(count);
                    count = 0;
                }
            } else {
                count++;
            }
        }
        horHints.push(hints);
    }

    for(let col = 0; col < numCols; col++) {
        let hints = [];

        let count = 0;
        for(let row = 0; row <= numRows; row++) {
            if(row == numRows || grid[row][col] != 1) {
                if(count > 0) {
                    hints.push(count);
                    count = 0;
                }
            } else {
                count++;
            }
        }
        verHints.push(hints);
    }

    return {horHints, verHints};
}

function generateGrid(numRows, numCols, seed) {
    const rd = Math.seed(seed);

    const ratio = 0.5 + 0.25 * rd(); // 50% to 75%
    const totalCells = numRows * numCols;
    const numOnes = Math.round(totalCells * ratio);
    const numZeros = totalCells - numOnes;

    // Create an array with the appropriate number of 1s and 0s
    const cells = Array(numOnes).fill(1).concat(Array(numZeros).fill(0));

    // Shuffle the array to randomize the placement
    for (let i = cells.length - 1; i > 0; i--) {
        const j = Math.floor(rd() * (i + 1));
        [cells[i], cells[j]] = [cells[j], cells[i]];
    }

    // Convert the shuffled array into a 2D grid
    const grid = [];
    for (let i = 0; i < numRows; i++) {
        grid.push(cells.slice(i * numCols, (i + 1) * numCols));
    }

    displayGrid(grid);

    return grid;
}

// https://stackoverflow.com/a/29450606
Math.seed = function(seed) {
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

function displayGrid(grid) {
    const numRows = grid.length;
    const numCols = grid[0].length;
    let str = '';
    for(let row = 0; row < numRows; row++) {
        for(let col = 0; col < numCols; col++) {
            let val = grid[row][col];
            str += val == 0 ? '  ' : val == 1 ? ' X' : ' .';
        }
        str += '\n';
    }
    console.log(str);
}

function encrypt(message, cipher) {

}

function decrypt(coded, cipher) {

}