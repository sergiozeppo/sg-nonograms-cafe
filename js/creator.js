import * as nono from './util/nono-utils.js';

const args = process.argv.slice(2);

const numRows = parseInt(args[0], 10);
const numCols = parseInt(args[1], 10);
const msg = args[2];
const msgType = args[3] || 0;

let id = nono.generateNonogram(numRows, numCols, msg, msgType);
console.log(`ID: ${id}`);
console.log(`Link: ${nono.PAGE_URL}?id=${id}`);