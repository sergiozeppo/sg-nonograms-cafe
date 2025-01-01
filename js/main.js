const args = process.argv.slice(2);

const numRows = parseInt(args[0], 10);
const numCols = parseInt(args[1], 10);
const seed = args[2] ? parseInt(args[2], 10) : null;

console.log(`numRows: ${numRows}`);
console.log(`numCols: ${numCols}`);
console.log(`seed: ${seed !== null ? seed : "not provided"}`);